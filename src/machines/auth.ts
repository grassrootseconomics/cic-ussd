import { createMachine, send } from "xstate";
import bcrypt from "bcrypt";
import { updatePinAttempts, blockOnUssd, activateOnUssd } from "@db/models/account";
import { BaseContext, BaseEvent } from "@src/machines/utils";

export interface AuthContext extends BaseContext {
  data: {
    initialPin?: string;
  }
}

type AuthEvent =
  BaseEvent

export const authMachine = createMachine<AuthContext, AuthEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgWWQY0wEsA7MAOjGPTACcSoAFEgYgBUAlAQQDkBlASVYBtAAwBdRKAAOAe1iF0hGcUkgAHogBMAdgCMZAJwA2ABzaArABoQATy26ALGREPT5g9oe7NukQYcAvgHWaFi4BCTklNR0xIwsHDwCwroSSCCy8orKqhoIOvrGZla2iLoAzCaGukZG5o4i2mbaRkEhGDj4RKRkJABuyAA2hBBMxMzsAKIcAJqiadJyCkoq6XkOIppk9eZGmiV2CCZVXrX1G03aLW0goZ0RPXjKAGaENAC29GNsXHyC86pMsscmsypt9JoROVvActOYnI4TA5NCivD4-IFgrcOuFuuQnsRXh8vglfskhKlAUtsqtQHlfD4yJDoftrIddOYti4audGs09jc7rjImQpCRsIRYO9kOgCBNpuw5uIqVkVrkyhzymRyhY2WD9PCeQ1Li1dIKcV0RfhFANFHFOHgnqgqMwIMpyP0ZABrchCy09a2EW30B1OqgIT14GUreYA9JAmnqhC6CzaZx7WH5DxkMwOAxIzzeXz+c1hf2+vA26P2x0yZ3oZi0GgyGiiwYy54t95kP0PCtVu1QUN18OR6PKWPK+PUtWg5Op9Os0rJ9w5-PI1FFjFBLHEGQQOCqXt4lXA2nqRAAWiMeoQ19L9zxFCotBJ54Ts7piGRt8hRiZebroW6Illix4iv0QwjGMp6JnO5xMlCMK3iY+iAUBaLFpi7Rln2ZAEkSnxxDB06qiCX4IAhzLIcuPgnAYDEFph25gRaeFisQEpSjKBCwZ+F7JpodSLpmqFkHseZMVuoE4Y+VqVkG1ZDrW9Z8eRAkVCYWq6I45haeUBmGeUv6VGQ3iSQ4wFYQ+woBgpwbKJMNDNjQannvSxj-kYfg6pmHJVOZGHSdh2K4U+0ripQqBuUmuieeJPm6rRRhahJQUgZiQRAA */
    id: 'authMachine',
    initial: "authenticating",
    predictableActionArguments: true,
    states: {
      authenticating: {
        always: [
          { target: "accountProcessing", cond: "isPendingOnChain" },
          { target: "enteringPin", cond: "isPendingOnUssd" },
        ]
      },
      accountProcessing: {
        type: "final",
        description: "Account is being processed on chain"
      },
      enteringPin: {
        on: {
          TRANSIT: [
            { target: "confirmingPin", cond: "isValidPin", actions: ["savePin", "encryptInput"] },
            { target: "invalidPin" }
          ]
        },
        description: "Expects pin input from user."
      },
      invalidPin: {
        entry: send({ type: "RETRY", feedback: "invalidPin" }),
        on: {
          RETRY: "enteringPin"
        },
        description: "The pin entered is invalid. It does not conform to regExp[/^\\d{4}$/]"
      },
      confirmingPin: {
        on: {
          TRANSIT: [
            { target: "activatingAccount", cond: "pinsMatch", actions: ["encryptInput"] },
            { target: "pinMismatch" }
          ]
        },
        description: "Confirms the pin entered by the user. If it matches the saved pin, transitions to mainMenu, otherwise to pinMismatch."
      },
      pinMismatch: {
        entry: send({ type: "RETRY", feedback: "pinMismatch" }),
        on: {
          RETRY: "confirmingPin"
        },
        description: "The pin entered by the user did not match the saved pin. Offers the user a chance to retry entering the pin."
      },
      activatingAccount: {
        invoke: {
          src: "activateAccount",
          onDone: "mainMenu",
          onError: { target: "activationError", actions: "updateErrorMessages" }
        },
        description: "Activates the account on the ussd platform."
      },
      activationError: {
        type: "final",
        description: "An error occurred while activating the account."
      },
      mainMenu: {
        type: "final",
        description: "Final state. Indicates successful authentication and access to main menu."
      },
    }
  })

export async function activateAccount (context: AuthContext) {
  const { data: { initialPin },  resources: { db }, user: { account: { phone_number } } } = context
  return await activateOnUssd(db, initialPin, phone_number)
}

export function blockAccount (context: BaseContext) {
  blockOnUssd(context.resources.db, context.user.account.address)
}

export function createPINHash (pin: string) {
  // hash pin with bcrypt and 8 rounds of salt
  return bcrypt.hashSync(pin, 8)
}

export function encryptInput (context: AuthContext, event: any) {
  context.ussd.input = context.data.initialPin || createPINHash(context.ussd.input)
  return context
}



export function isAuthorized (context: AuthContext, event: any) {
  return (
    bcrypt.compareSync(event.data, context.user.account.password) &&
    context.user.account.status === 'ACTIVE'
  )
}

export function isBlocked (context: BaseContext) {
  return context.user.account.status === 'BLOCKED'
}


export function isPendingOnUssd (context: BaseContext) {
  return (
    context.user.account.status === 'PENDING' &&
    context.user.account.activated_on_chain &&
    !context.user.account.activated_on_ussd
  )
}

export function isValidPin (_, event: any) {
  return /^\d{4}$/.test(event.data)
}

export function pinsMatch (context: AuthContext, event: any) {
  const hashedPin = context.data?.initialPin
  return bcrypt.compareSync(event.data, hashedPin)
}

export function savePin (context: AuthContext, event: any) {
  context.data.initialPin = createPINHash(event.data)
  return context
}

export function updateAttempts(context: BaseContext) {
  const { user, resources } = context;
  const { account } = user;

  if (account.status === 'BLOCKED') {
    return;
  }

  const remainingAttempts = account.pin_attempts + 1;
  updatePinAttempts(resources.db, account.address, remainingAttempts);

  remainingAttempts === 3 && blockAccount(context);
}



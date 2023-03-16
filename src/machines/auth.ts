import {createMachine, send} from "xstate";
import bcrypt from "bcrypt";
import {AccountStatus, activateOnUssd, blockOnUssd, updatePinAttempts} from "@db/models/account";
import {BaseContext, BaseEvent, isOption00, translate, updateErrorMessages} from "@src/machines/utils";
import {ActiveVoucher} from "@lib/ussd/voucher";
import {Cache} from "@utils/redis";


export const authMachine = createMachine<BaseContext, BaseEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOjVsAdugJYDGyJBUAxANoAMAuoqAA4D2sxJ7BLIAD0QAmAIyjsADgDsAFgCc84QGZRwgKwL5AGhABPRGoBs2emfrL16o6OlHpogL6PdeHG8IlylGrVHMkEA4uHj5AoQQxCRktFTVNRV0DSOV6bA0zS1tZZUV6WWdXDHdizzIKYio6YQC2Tm5iXn4IqKk5RTiNLSTEZWVZbHVzYXolaSHJPsKQN2xPMAAnSqgABUrqABUAJQBBADkAZQBJDYZaoPrQ5sR5dWFsfuVpZSNlSSVX0R7I0QH8o3k9EkslE8jeinU01m8yWVDWBE2u0OJz852CDSa4RudweOWer3ewk+31Eb2w8lERiMkgBt1kZmEkihxWwlQAbsgADbECDw6hbACi2wAmmd+OirliEKIgfd3vQjCNZOpnupct9JJJsCCqTT5ApKfRpEyXDMWaReAAzYgLAC2yz5232x1OTHFl0aYVAEVs9AkKskQMBshDKqM3y62F+wOk0nymXeRmZWGwFoI1rtDvWTuRp387pCnuu0rj-uNQfyobsJJx+VsjOkYiByg0yZwrEqAFliLBbRRSJh+UKtqK3YEJUWpaJJspsO15HIcjESX7BiDnkT+nHnvI27hSCQOT4dqQLagiNQILwwKyCGz2ABrG+zZAH4hH5Yns9EBDs9jeT0zjFccPUxb0RDxbUnhDVINGBSwIwXNohmEZUjD9YRpD3V9DwqKgv3Yc90GoRYFnYBZsFYTkKEtcjbVwFkcPfPCoAIojfzvf8Kl4ICxzqQswMECCnigxdYPUeD1BreQpHkSQ7lsSwLHUJxpgIdgIDgfg3ALDEvSEhAAFpw30RBDPUclFCs6yrMbbDSiIcofF0yVwIQWRhG+FtZ3iP1LBGIwckhU0X1PQiiBWMjSDgLgqBcyc3OVNIYluHcXjeBUVzScYzHpUlLFyZQ9xhLN9InQSIiMTRtWs0kKTVHRTMiBV0iGCxA1QmIsJCll2S5Hl4XiirDFBAYA3EQNFHpBcNX9YYzDuWQqQVPc0wze04UqIb9J9UbBmNCbRn1UZpAjadBnmoZRE0OMip6lMOwIbte37TBtuLUaLLxWRGyBI15BM5JJAkRUhlu-6rDs+73DfD98LCoj3qlALZ1kd5NCJNGHCqiMyV8hIlA895uqKFMmI-XgBQWMiFiRtzMZMOScmEVDMLuJ4ay1fHVCeFVKRNUmcD7LtCFQOmDIZ8l4JZjzxhUU6ms3bBQeU6d9TuYLBbmARuHFiIkraBQVUKglMqa1IZIyCxflyI11F3ZxHCAA */
    id: 'auth',
    initial: "authenticating",
    predictableActionArguments: true,
    states: {
      authenticating: {
        always: [
          { target: "processingAccount", cond: "isPendingOnChain" },
          { target: "enteringPin", cond: "isPendingOnUssd" },
          { target: "accountBlocked", cond: "isBlocked" }
        ]
      },
      processingAccount: {
        type: "final",
        description: "Account is being processed on chain"
      },
      enteringPin: {
        on: {
          TRANSIT: [
            { target: "confirmingPin", cond: "isValidPin", actions: ["savePin", "encryptInput"] },
            { target: "exit", cond: "isOption00" },
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
            { target: "exit", cond: "isOption00" },
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
        description: "Activates the account on the ussd platform.",
        tags: "invoked"
      },
      activationError: {
        type: "final",
        description: "An error occurred while activating the account.",
        tags: "error"
      },
      mainMenu: {
        type: "final",
        description: "Final state. Indicates successful authentication and access to main menu.",
        tags: "resolved"
      },
      exit: {
        type: "final",
        description: "Final state. Indicates that the user has exited the authentication process."
      },
      accountBlocked: {
        type: "final",
        description: "Final state. Indicates that the user's account is blocked."
      }
    }
  },
    {
      actions: {
        encryptInput,
        savePin,
        updateErrorMessages,
      },
      guards: {
        isOption00,
        isPendingOnChain,
        isPendingOnUssd,
        isValidPin,
        pinsMatch,
        isBlocked,
      },
      services: {
        activateAccount,
      }
    })

export async function activateAccount (context: BaseContext) {
  const { data: { initialPin },  resources: { db, p_redis }, user: { account: { phone_number } } } = context
  const result = await activateOnUssd(db, initialPin, phone_number)
  if (result?.status === AccountStatus.ACTIVE) {
    const cache = new Cache(p_redis, phone_number)
    await cache.updateJSON( { ...result } )
  }
}

export async function blockAccount (context: BaseContext) {
  const { resources: { db, p_redis }, user: { account: { phone_number } } } = context
  await blockOnUssd(db, phone_number, p_redis)
}

// TODO[Philip]: Make this async
export function createPINHash (pin: string) {
  // hash pin with bcrypt and 8 rounds of salt
  return bcrypt.hashSync(pin, 8)
}

export function encryptInput (context: BaseContext, event: any) {
  context.ussd.input = context.data.initialPin || createPINHash(context.ussd.input)
  return context
}

export function isBlocked (context: BaseContext) {
  return context.user.account.status === 'BLOCKED'
}

export function isPendingOnChain (context: BaseContext) {
  const { user: { account: { activated_on_chain, status } } } = context
  return (
      !activated_on_chain && status === AccountStatus.PENDING
  )
}

export function isPendingOnUssd (context: BaseContext) {
  const { user: { account: { activated_on_chain, activated_on_ussd, status } } } = context
  return (
    status === AccountStatus.PENDING && activated_on_chain && !activated_on_ussd
  )
}

export function isValidPin (_, event: any) {
  return /^\d{4}$/.test(event.input)
}

export function pinsMatch (context: BaseContext, event: any) {
  const { data, ussd: { input } } = context
  const hashedPin = data?.initialPin
  return bcrypt.compareSync(input, hashedPin)
}

export function savePin (context: BaseContext, event: any) {
  context.data.initialPin = createPINHash(event.input)
  return context
}

export async function updateAttempts(context: BaseContext) {
  const { user, resources: { db, p_redis } } = context;
  const { account: { phone_number, pin_attempts, status } } = user;

  if (status === 'BLOCKED') {
    throw new Error('Account is blocked')
  }

  const attempts = pin_attempts + 1;
  await updatePinAttempts(db, phone_number, attempts, p_redis);

  attempts === 3 && await blockAccount(context);
}

export async function authTranslations(voucher: ActiveVoucher, state: string, translator: any) {
  const { balance, symbol } = voucher
  if (state === "mainMenu"){
    return await translate(state, translator, { balance: balance, symbol: symbol })
  } else {
    return await translate(state, translator)
  }
}

export async function validatePin(context: BaseContext, event: any) {
  const { user, ussd: { input }, resources: { db, p_redis } } = context;
  const { account: { phone_number, password, status } } = user;

  if (status === 'BLOCKED') {
    throw new Error('Account is blocked')
  }

  const isValid = await bcrypt.compare(input, password)
  if (!isValid) {
    await updateAttempts(context)
    throw new Error('Invalid pin')
  }

  await updatePinAttempts(db, phone_number, 0, p_redis);
}

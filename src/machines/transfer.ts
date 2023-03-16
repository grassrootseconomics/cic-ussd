import {createMachine, send} from "xstate";
import {BaseContext, BaseEvent, isOption1, isOption9, translate, updateErrorMessages} from "@src/machines/utils";
import {sanitizePhoneNumber} from "@utils/phoneNumber";
import {Account} from "@db/models/account";
import {cashRounding} from "@lib/ussd/utils";
import {isBlocked, isValidPin, updateAttempts} from "@src/machines/auth";
import {custodialTransfer} from "@lib/custodail";
import {createTracker, CustodialTaskType} from "@db/models/custodailTasks";
import bcrypt from "bcrypt";
import {isValidPhoneNumber} from "@machines/pin";
import {MachineError} from "@lib/errors";
import {Cache} from "@utils/redis";

export interface TransferContext extends BaseContext {
  data: {
    amount?: number;
    entry?: string;
    recipientAddress?: string;
  };
}

type TransferEvent =
  BaseEvent


enum TransferErrors {
  INVALID_PIN = "INVALID_PIN",
  INVALID_PHONE = "INVALID_PHONE",
  INVALID_RECIPIENT = "INVALID_RECIPIENT",
  SELF_TRANSFER = "SELF_TRANSFER",
  TRANSFER_FAILED = "TRANSFER_FAILED",
  UNAUTHORIZED = "UNAUTHORIZED",
}


export const transferMachine = createMachine<BaseContext, BaseEvent>({
    /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrAZmVAdGJsvgJaZQBKYAxmQA5nHIDEAQgIIDCA0gNoAGALqJQDAPawyyMhMxiQAD0QBWAEwAWAgE5VAZgCM6gByrVANkOqTAdgA0IAJ6JDJ7ZvUWrtrYc0mhr4AvsGOaFi4+EQk5JQ09EwsrAAqVJwAcgDKAJIpQqJIIJLSsvKKKgga2npGpuZWNg7Oarb6BBbqOhZmloLqhjq2oeEY2HiEAG7oADZkEOiy8XSMzCSsEPJgBBSTEgDW29NzC0vUK0kkBYolMnIKRZWGhoKqBOqC+oImeqqamhZ9KpHC4EAFBB1bBZLHoTCZBK8TBYRiAIuNosd5osKOdEms2PhUBJCAwZoscMSALYETGnHEJVYsa5FW5lB6gJ4vN4fL4-cz-QHAloIbw6Ag2UyCAKmX6GFFoqKEXazeYMy5sNKZXL5EQ3KR3cqPVxc96fb6-AVAkGtdqdbpDdSqbqvZFhVFjRU7TC0tX41LpbJ5fiGQrifVsiqueEQ2xuCx6QZS-R2a0inSGDqeeMWf6aJ39eUeiZen0XP2awP5dSh4rh+6RhBuBEEWNIhM6JMp4U2CwEfxeXzxhF5wuRYu7O7LPHJTaYba7A7z72T3GMq66ll1w0cxCOnPvbpI3OaWw6fSpiyCDM-dS2V5Op2A-Sj9FK5dnX3JQnEgik8lUksV0-dca1ZesjQQPdtC6Hoc1zU9z2FO9bAIfQdFvV4EzaWMX09Fg4igThKQkABXdYuD4Zkw1KcCd0bL5tD+HpNGeOwzChVNNC+PsoXMdxAgRHQdFw4t8NQHEiNI9YK21Kjaxo7dlGNTwCABOwBiRWw70BVNbzeWxVARfQrGhV59ChETojEiTiLIjUA1kkM9QU9klMbaMWzjdtO2aUFNDPAgjP8WxPECFigUst9aUkuzWCoABRNIAE05LAxTKgGQxex6ELs0CHThX+dRxU+QxjP0TK8wBSKYlIcTKAABQoDgeAEDdqINVzOVeU1eQtAErWFcyxQsXiT3MzQr00GrrMa5qZKDdr5M6htnh6nlzX5AahVBdRHXeQz+kMmxXlsOwavQEjkAAC2JMgAC8cRSIt8A2LYS0XAhLpuu7HsoZ6x3wVKty6qNm1beNVETLiu12rwW0OgdBEBNwNAuq7bvEv6oAB19WG-EkyWQClUGpb7MYep6XtQYGXNWjyIe8mHfNcfRtG8bw-kEM7+QMdGfqxqnAdQfHUCJQn-1Jr6Md+oXX2DUCQfp8GvKhjtmdTfQKoOhE2jMbogTZmqyPJ37ICazA4sSqgUqWtLQcg55srsAVTHqWHEECEqESmwI0J0FjQjdTAJAgOBFAVCZnJWiCAFoLFTePAp9lPU64mbYnq1d1WjiMIM8TjvlUrxLDKr5zKfGraWxKc12QXPaLcu8TBbNmugCDt3C0VNzBQy9OjzR11bcGrlROYD683OmIOsW8CHhAFS8+SazovMwWy8fpTwHVQLLdSPognD8yxYBv0t3PaW4mvQoXQoTjIvHpMwHLv+x0EwM7qmypMnjq87o-wQI+xaG6N4NoJ5bycXMAjIwLxzKBC0sJfe1MSwqggDFEgZ8HZ7VMKhEKN94xdDPAnQqlhxRHiMOCaEOZP4EQtlghso0r5OgqumEw5UKq6W8LoLwnQ4R7XMAHVQ-MKbY1xoqBhM9PBimRloOEvgXYmF0v0HWutl4-BCsbTApssbmwoJIuiOCr74N3oQ++JDQTdBbP5PQ79AgnRwsg4WX1aC0B-uwGYEhaCHAgAYtyRi8H+VMXfYhmtuYIwRH8NwJgBgsVdKMZxYAlAyD8RlS+gSCEhIft2QEfYsxnWRpYSwo93xgHimLYkqTdxaTeIIM8BkhwVXUGvYqN47zdFPN8AyJTJgyDAFkEiri4DwCnjHQxNTAr1JhJ8PaPctKoXQu0iqWsyrDCca+AglJ0AUAALLEBIlUkUuTubwjvs3QIhhUxZQzFmEyUI2hCThDVA+qAciYDuIsSAhyAnX2CUQ7Ju0VGOh9neNmGjqpByAA */
    id: "transfer",
    initial: "enteringRecipient",
    predictableActionArguments: true,
    preserveActionOrder: true,
    states: {
      enteringRecipient: {
        on: {
          BACK: "mainMenu",
          TRANSIT: [
            { target: "validatingRecipient", actions: "saveEntry" }
          ]
        },
        description: "Expects a valid phone number entry of the form (+254)|(0)7XXXXXXXX"
      },
      validatingRecipient: {
        invoke: {
          id: "validatingRecipient",
          src: "validateRecipient",
          onDone: { target: "enteringAmount", actions: "saveValidatedRecipient" },
          onError: { target: "invalidRecipient", actions: "updateErrorMessages" }
        },
        description: "Validates the recipient's phone number",
        tags: "invoked"
      },
      invalidRecipient: {
        on: {
          TRANSIT: [
            { target: "validatingRecipient", cond: "isValidPhoneNumber", actions: "saveEntry" },
            { target: "invitingRecipient", cond: "isOption1" },
            { target: "exit", cond: "isOption9" }
          ]
        },
        tags: "resolved"
      },
      invitingRecipient: {
        invoke: {
          id: "invitingRecipient",
          src: "inviteRecipient",
          onDone: { target: "inviteSuccess" },
          onError: { target: "inviteError" }
        }
      },
      enteringAmount: {
        on: {
          BACK: "enteringRecipient",
          TRANSIT: [
            { target: "enteringPin", cond: "isValidAmount", actions: "saveAmount" },
            { target: "invalidAmount" }
          ]
        },
        description: "Expects a valid amount entry. > 0 and <= balance",
        tags: "resolved"
      },
      invalidAmount: {
        entry: send( { type: "RETRY", feedback: "invalidAmount" } ),
        on: {
          RETRY: "enteringAmount"
        }
      },
      enteringPin: {
        on: {
          BACK: "enteringAmount",
          TRANSIT: "authorizingTransfer",
        },
        description: "Expects a valid pin entry. 4 digits && matches account's pin."
      },
      authorizingTransfer: {
        invoke: {
          id: "authorizingTransfer",
          src: "authorizeTransfer",
          onDone: { target:  "transferInitiated", cond: "isInitiated" },
          onError: [
            { target: "unauthorizedPin", cond: "isNotBlocked" },
            { target: "accountBlocked", cond: "attemptsExhausted" }
          ]
        },
        description: "Authorizes the transfer by validating the pin.",
        tags: "invoked"
      },
      unauthorizedPin: {
        entry: send( { type: "RETRY", feedback: "unauthorizedPin" } ),
        on: {
          RETRY: "enteringPin"
        },
        tags: "error"
      },
      accountBlocked: {
        type: "final",
        description: "Account is blocked."
      },
      exit: {
        type: "final",
        description: "Terminates USSD session."
      },
      inviteError: {
        type: "final",
        description: "Invite failed."
      },
      inviteSuccess: {
        type: "final",
        description: "Invite was sent successfully."
      },
      mainMenu: {
        type: "final",
        description: "User exited the transfer flow and jumps to main menu machine."
      },
      transferInitiated: {
        type: "final",
        description: "Transfer was initiated successfully.",
        tags: "resolved"
      }
    }
  },
  {
    actions: {
      saveAmount,
      saveEntry,
      saveValidatedRecipient,
      updateAttempts,
      updateErrorMessages
    },
    guards: {
      attemptsExhausted,
      isAuthorized: (_, event: any) => {
        return event.id === "authorized"
      },
      isBlocked,
      isInitiated,
      isNotBlocked: (context: TransferContext) => !isBlocked(context),
      isOption1,
      isOption9,
      isValidAmount,
      isValidPhoneNumber,
      isValidPin
    },
    services: {
      authorizeTransfer,
      initiateInvite,
      initiateTransfer,
      validateRecipient,
    }
  });


function attemptsExhausted(context: TransferContext){
  const { user: { account: { pin_attempts } } } = context
  return pin_attempts == 3
}

async function authorizeTransfer(context, event: any) {
  const { user: { account: { password } } } = context
  const { input } = event

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(TransferErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(TransferErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  // attempt to initiate transfer.
  try{
    await initiateTransfer(context)
    return { message: "initiated" }
  } catch (error) {
    throw new MachineError(TransferErrors.TRANSFER_FAILED, error.message)
  }
}

async function initiateInvite(context: TransferContext) {
  const { data: { entry }, user: { account: { phone_number } }, ussd: { countryCode } } = context
  let recipient;
  try {
    recipient = sanitizePhoneNumber(entry, countryCode)
  } catch (error) {
    throw new MachineError(TransferErrors.INVALID_PHONE, error.message)
  }

  // initiate invite
  console.debug(`Initiating invite to ${recipient} from ${phone_number}`)
  return { message: "initiated" }

}

async function initiateTransfer(context: TransferContext) {
  const {
    data: {amount, recipientAddress},
    user: {account: {address}, activeVoucher: {address: voucherAddress}}
  } = context
  try {
    const response = await custodialTransfer({
      amount: amount * 1000000,
      from: address,
      to: recipientAddress,
      voucherAddress: voucherAddress
    })

    await createTracker(context.resources.db, {
      address: address,
      task_type: CustodialTaskType.TRANSFER,
      task_reference: response.result.trackingId
    })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

function isInitiated(_, event: any){
  return event.data.message === "initiated"
}

function isValidAmount(context: TransferContext, event: any) {
  const amount = Number(event.input)
  const isANumber = !isNaN(amount)
  const isGreaterThanZero = amount > 0
  const isLessThanBalance = amount <= context.user.activeVoucher.balance
  return isANumber && isGreaterThanZero && isLessThanBalance
}

function saveAmount(context: TransferContext, event: any) {
  context.data.amount = cashRounding(event.input)
  return context
}

function saveEntry(context: TransferContext, event: any) {
  context.data.entry = event.input
  return context
}

function saveValidatedRecipient(context: TransferContext, event: any) {
  context.data.recipientAddress = event.data
  return context
}

async function validateRecipient(context: TransferContext) {
  const { data: { entry }, resources: { p_redis }, user: { account: { address } }, ussd: { countryCode } } = context
  let recipient: string, account: Account;

  // attempt to sanitize the phone number.
  try{
    recipient = sanitizePhoneNumber(entry, countryCode)
  } catch (error) {
    throw new MachineError(TransferErrors.INVALID_PHONE, error.message)
  }

  // check if the recipient is known to the system.
  const cache = new Cache<Account>(p_redis, recipient)
  account = await cache.getJSON()
  if (!account) {
    throw new MachineError(TransferErrors.INVALID_RECIPIENT, "Unrecognized recipient")
  }

  // check if the recipient is the same as the sender.
  if (account.address === address) {
    throw new MachineError(TransferErrors.SELF_TRANSFER, "You cannot transfer to yourself")
  }

  return account.address
}

export async function transferTranslations(context: TransferContext, state: string, translator: any) {
  const {
    data,
    user: {
      account: {phone_number},
      activeVoucher: {balance, symbol},
    },
  } = context;

  const amount = data.amount || null;
  const recipient = data.entry || null;

  const translations = {
    mainMenu: {balance: balance, symbol: symbol},
    enteringPin: {
      amount: amount,
      recipient: recipient,
      sender: phone_number,
      symbol: symbol,
    },
    enteringAmount: {spendable: balance, symbol: symbol},
    inviteError: {invitee: recipient},
    invalidRecipient: {recipient: recipient},
    inviteSuccess: {invitee: recipient},
    transferInitiated: {
      amount: amount,
      recipient: recipient,
      sender: phone_number,
      symbol: symbol,
    }
  };

  const translation = translations[state];
  return await translate(state, translator, translation);
}

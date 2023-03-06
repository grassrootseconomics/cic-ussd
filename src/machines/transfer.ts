import { createMachine, send } from "xstate";
import { BaseContext, BaseEvent } from "@src/machines/utils";
import { sanitizePhoneNumber } from "@utils/phoneNumber";
import { findPhoneNumber } from "@db/models/account";
import { cashRounding } from "@lib/ussd/utils";
import { isAuthorized, isBlocked } from "@src/machines/auth";
import { custodialTransfer } from "@lib/custodail";
import { ethers } from "ethers";
import { createTracker, CustodialTaskType } from "@db/models/custodailTasks";
import L from "@lib/i18n/i18n-node";

export interface TransferContext extends BaseContext {
  data: {
    amount?: number;
    recipient?: string;
    recipientAddress?: string;
  };
}

type TransferEvent =
  BaseEvent

export const transferMachine = createMachine<TransferContext, TransferEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrdBjZAlgPaYCyeAFgZmAHRibJirVQBKYuBADgQ8gGIAKmwCCAOQDKASSEBtAAwBdRKG5FYBQiVUgAHogBMATgBstAOxmAHLYAsARgCs1gMyvjAGhABPRE7trWgdDd2MLBVdQhzsnAF847zQsHHxiMkpqOgA3dAAbAgh0QkwoAQgSOmpsogBrOmTsPG0M3CoaWlyCopKoBGqiXGL0xSVR3XVNFt0DBAtTJ1pjVwsnBWszMMMnbz8EJ1NjYNC7OwUHDesz1wSkjCa0knI2rM78wuHSgWZUIlRabh5YoAMz+AFtaI1Ui1nu0cu8eqx+pgakMWqNxkgQJMtOkZoh5otlqt1psPNtdogHMYgk5Qq4zsZYi4nBY7LcQFDmulYa9qgiOFxePxhGIpLJMWoNLidFjZoSlis1htTFsdr4qQpDLRWecnE4YtsLlcOVzHq04bR+d1BTw+IxRRIZPIHCosTjpnKqWs7LRrIZrM5tiZrKZTBZKQhDAoFLRDHYaRYLCYk8Y6fFEpz7tCeZkOtUtGBypUrSi6g1s9ynnmqijC8jUcMSBjlBNpZ7QLNDAGgq4nEyA2ZjJF1XsHAoicYadYFFPWTOnDdM2aYTXS9lC99UL9-oCQeDIZXzbz83WmA3Bk3MC23VKpnivVGe7Q+wOVcO+5Huw44wm3FFA3jQIlzuFIqwtV5+GYVhRDBIgAFcHREJ0JVbd12wfTtvQUX1-UDdMQzDCMNX2DZaFME4HBiUxYliaxTSPVcXg6KCWFKWCEKQsVnTkV023vWUsIQZwcL9AMgzpGkiMjH0dQccM9RWU5bAzUCHiYy1rUKDjEMENgAFERAATUlbEMME-QqTDX1w2pHCaQcVxQ0jWjaHOBSwzcftDAYsDjzXdB4OQCg-gIAAvVghGzYFmEdcV5DQu8ZUwfEn1sF9+zsQdDhHGSFAsOM1lJJNoyy9ll0Y3NmLoQLgtCiLSiilIYtQOKeL49CBJSx9u3S18svfXKSNfcjh1ndwDTTHyKr8jTXlqkKWAaqAmuwFq2olQxbzMrrUt63tMuyj9R0QVUgnjOdwzOGjrFUrNZqqzTMFxYoiwqU8anqQ8HurarSxe88BjREZlFMj1MMshBXAnRZo1cal-VZfU0xckIlinYxqRCC5VgcXz1MevlnsIV6tx3AEgWQUFUAhFdCdPAGwAvYHm1BxKduS1Lof1ONIgR7ZVn7E79gnHVQkXNkAk2fGc1+y1EIW+rIFW2AWoABWoAQDOMsHzO6oT4wNOSDjZQxDkxyNoaOOzZyuGlZzpBJM0wIgIDgXQ6blrJ+M5x8AFpTEjP3Jwx0Ow5A+6Ca9ljGGg0pbWFRgfY7SGspk9wdQxiiY0FlYZfAk94W6T4oGTiHZjotznFVZw7AZCwHHT7VZynCwFyyvtyrU2WII+gVODtfgy4s2Zxy1MTAIseHrjcSNnCCDHAwTNY1mr-P-L+gsmGH-XIYuRcXxnAWJwTBY59MH8EynK6Ahjel17mmOmDYqAdKTzrfaEqjQ2CcbhwWcclwZKmFpBjZMTINgOQfvTWsXRtJwV0jvVKDgkzmH6pEVYUQFAgJcgyNyGNoxuDNvDeiM0o69xqkFRa4VIrRWYEgx81I6Q6iuI4FYQ5rBTxksOciMZ1gzmhhdYw0Do61kZgwg2qpzC2C1KsQMkRQguRATqPhmDqR9kDCIihtAFZUKVhAFW6tqASMhtsVUvN4ZTxwig+GlsqLoynOsbGbItRaMLrQPAuBOLIAAEJ5EGPUCAJiuwHFcBYmx1ip6NxIqYUWRUW75Vum4Lukce7uKhC1SQ8FcC4DgPAD+KdZhRAoksVhrIogBiiHYS26Ur5ENiJjUI8Y3FrgycwfS24-jBMQMU7UNJTjlN6lUlyTI3J8LNrdaMCxTAtM3meMAWScl5O6VGUJ4SrGOCiZGQMKi+F9mVFROwFhZlPQ3EwDpO4VlmLCXDCJmzbEkQuOYMBVgDm2Dxk7IAA */
  id: "transactionMachine",
  initial: "enteringRecipient",
  predictableActionArguments: true,
  states: {
    mainMenu: {
      type: "final",
      description: "User is returned to the main menu."
    },
    enteringRecipient: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "validating", actions: "saveRecipient" },
        ]
      },
      description: "Expects recipient input from user."
    },
    validating: {
      invoke: {
        src: "validateRecipient",
        onDone: { target: "enteringAmount", actions: "saveValidatedRecipient" },
        onError: { target: "invalidRecipient", actions: "updateErrorMessages" }
      },
      description: "Validates the recipient entered by the user."
    },
    invalidRecipient: {
      on: {
        TRANSIT: [
          { target: "enteringRecipient", cond: "isOption1", actions: "saveRecipient" },
          { target: "invite", cond: "isOption9" }
        ]
      },
      description: "The recipient entered is invalid. The recipient must be a valid phone number or virtual payment address as well as a registered user of the platform."
    },
    invite: {
      invoke: {
        src: "initiateInvite",
        onDone: { target: "inviteSuccess" },
        onError: { target: "inviteError" }
      },
      description: "Initiates an invite to the recipient entered by the user."
    },
    enteringAmount: {
      on: {
        TRANSIT: [
          { target: "authorizingTransfer", cond: "isValidAmount", actions: "saveAmount" },
          { target: "invalidAmount" }
        ]
      },
      description: "Expects amount input from user."
    },
    invalidAmount: {
      entry: send({ type: "RETRY", feedback: "invalidAmount" }),
      on: { RETRY: "enteringAmount" },
      description: "The amount entered is invalid. The amount must be a positive number and not greater than the available balance."
    },
    authorizingTransfer: {
      on: {
        TRANSIT: [
          { target: "initiate", cond: "isAuthorized" },
          { target: "unauthorizedTransferPin", cond: `${!isBlocked}`, actions: "updateAttempts" },
          { target: "accountBlocked"
          }
        ]
      },
      description: "Expects transfer pin input from user."
    },
    unauthorizedTransferPin: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: { RETRY: { target: "authorizingTransfer" }
      },
      description: "The pin is invalid or incorrect. The pin must be a 4 digit number and must match the pin set for the account."
    },
    initiate: {
      invoke: {
        src: "initiateTransfer",
        onDone: { target: "transferSuccess" },
        onError: { target: "transferError", actions: "updateErrorMessages" }
      },
      description: "Initiates a transfer to the recipient entered by the user."
    },
    accountBlocked: {
      type: "final",
      description: "The account is blocked. The account must be unblocked before a transfer can be initiated."
    },
    inviteSuccess: {
      type: "final",
      description: "The invite was successfully initiated."
    },
    inviteError: {
      type: "final",
      description: "The invite could not be initiated. The error message will be in the context object."
    },
    transferSuccess: {
      type: "final",
      description: "The transfer was successfully initiated."
    },
    transferError: {
      type: "final",
      description: "The transfer could not be initiated. The error message will be in the context object."
    },
  }
});

async function initiateInvite (context: TransferContext) {
  const message = L[context.user.account.language].sms.inviteRecipient
  console.log(`Sending message to ${context.data.recipient}: ${message}`)
}

async function initiateTransfer (context: TransferContext) {
  try {
    const response = await custodialTransfer({
      amount: ethers.parseUnits(context.data.amount.toString(), 6).toString(),
      from: context.user.account.address,
      to: context.data.recipientAddress,
      voucherAddress: context.user.activeVoucher.address
    })

    await createTracker(context.resources.db, {
      address: context.user.account.address,
      task_type: CustodialTaskType.TRANSFER,
      task_reference: response.result.trackingId
    })
  } catch (error) {
    console.error(error)
    throw new Error(error)
  }
}

function isValidAmount (context: TransferContext, event: any) {
  const amount = Number(event.data)
  return !isNaN(amount) && amount > context.user.activeVoucher.balance;
}

function saveAmount (context: TransferContext) {
  context.data.amount = cashRounding(context.ussd.input)
  return context
}

function saveRecipient(context: TransferContext, event: any) {
  context.data.recipient = event.data
}

function saveValidatedRecipient(context: TransferContext, event: any) {
  context.data.recipientAddress = event.data
}

async function validateRecipient(context: TransferContext) {
  const phoneNumber = sanitizePhoneNumber(context.data.recipient, context.ussd.countryCode)
  const account = await findPhoneNumber(context.resources.db, phoneNumber)

  if (!account) {
    throw new Error(`Invalid recipient: ${phoneNumber}`)
  }

  return account.blockchain_address
}

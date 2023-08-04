import { createMachine, send } from 'xstate';
import {
  isOption1,
  isOption9,
  isSuccess,
  isValidPhoneNumber,
  MachineEvent,
  MachineId, NotifierContext,
  updateErrorMessages,
  validateTargetUser
} from '@machines/utils';
import { isBlocked, isValidPin, validatePin } from '@machines/auth';
import { custodialTransfer } from '@lib/custodial';
import { createTracker, TaskType } from '@db/models/custodailTasks';
import { BaseMachineError, ContextError, MachineError, SystemError } from '@lib/errors';
import {cashRounding, getAddressFromTill, sendSMS, validatePhoneNumber} from '@lib/ussd';
import {tHelpers, translate, tSMS} from '@i18n/translators';
import { config } from '@/config';
import {getPhoneNumberFromAddress} from "@services/account";
import {logger} from "@/app";
import {ethers} from "ethers";

enum TransferError {
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_RECIPIENT = 'INVALID_RECIPIENT',
  INVITE_ERROR = 'INVITE_ERROR',
  TRANSFER_ERROR = "TRANSFER_ERROR",
}

export interface TransferContext extends NotifierContext {
  data: {
    amount?: number,
    recipientEntry?: string,
    recipientTag?: string,
    recipientAddress?: string,
  }
}

export const stateMachine = createMachine<TransferContext, MachineEvent>({
    id: MachineId.TRANSFER,
    initial: "enteringRecipient",
    predictableActionArguments: true,
    preserveActionOrder: true,
    states: {
      accountBlocked: {
        description: 'Account is blocked.',
        type: 'final'
      },
      authorizingTransfer: {
        description: 'Invoked service that authorizes the transfer.',
        invoke: {
          id: 'authorizingTransfer',
          src: 'authorizeTransfer',
          onDone: { target: 'transferInitiated', cond: 'isSuccess' },
          onError: [
            { target: 'accountBlocked', cond: 'isBlocked' },
            { target: 'transferError', cond: 'isTransferError', actions: 'updateErrorMessages' },
            { target: 'invalidPin', actions: 'updateErrorMessages' },
          ]
        },
        tags: 'invoked'
      },
      enteringAmount: {
        description: 'Expects a valid amount entry. > 0 and <= balance',
        on: {
          BACK: 'enteringRecipient',
          TRANSIT: [
            { target: 'enteringPin', cond: 'isValidAmount', actions: 'saveAmount' },
            { target: 'invalidAmount' }
          ]
        },
        tags: 'resolved'
      },
      enteringPin: {
        description: 'Expects a valid pin entry.',
        on: {
          BACK: 'enteringAmount',
          TRANSIT: 'authorizingTransfer'
        },
        tags: ['encryptInput', 'error']
      },
      enteringRecipient: {
        description: 'Expects a valid phone number entry of the form (+254)|(0)7XXXXXXXX',
        on: {
          BACK: 'mainMenu',
          TRANSIT: [
            { target: 'validatingRecipient', actions: 'saveRecipientEntry' }
          ]
        }
      },
      exit: {
        description: 'Terminates USSD session.',
        type: 'final'
      },
      invalidAmount: {
        description: 'Entered amount is invalid. Raise RETRY event to prompt user to re-enter amount.',
        entry: send({ type: 'RETRY', feedback: 'invalidAmount' }),
        on: {
          RETRY: 'enteringAmount'
        }
      },
      invalidRecipient: {
        description: 'Entered identifier is invalid.',
        on: {
          BACK: 'enteringRecipient',
          TRANSIT: [
            { target: 'exit', cond: 'isOption9' },
            { target: 'validatingRecipient', cond: 'isValidIdentifier', actions: 'saveRecipientEntry' },
          ]
        },
        tags: 'error'
      },
      invalidRecipientWithInvite: {
        description: 'Entered identifier is invalid.',
        on: {
          BACK: 'enteringRecipient',
          TRANSIT: [
            { target: 'exit', cond: 'isOption9' },
            { target: 'invitingRecipient', cond: 'isOption1' },
            { target: 'validatingRecipient', cond: 'isValidIdentifier', actions: 'saveRecipientEntry' },
          ]
        },
        tags: 'error'
      },
      inviteError: {
        description: 'Invite failed.',
        type: 'final',
        tags: 'error'
      },
      inviteSuccess: {
        description: 'Invite was sent successfully.',
        type: 'final',
        tags: 'resolved'
      },
      invitingRecipient: {
        description: 'Invoked service that sends an invite to the recipient.',
        invoke: {
          id: 'invitingRecipient',
          src: 'initiateInvite',
          onDone: { target: 'inviteSuccess', cond: 'isSuccess' },
          onError: { target: 'inviteError', cond: 'isInviteError', actions: 'updateErrorMessages' }
        },
        tags: 'invoked'
      },
      mainMenu: {
        description: 'Transitions to main menu.',
        type: 'final'
      },
      transferInitiated: {
        description: 'Transfer was initiated successfully.',
        tags: 'resolved',
        type: 'final'
      },
      transferError: {
        description: 'Transfer failed.',
        type: 'final',
        tags: 'error'
      },
      invalidPin: {
        description: 'Entered pin is invalid. Raise RETRY event to prompt user to re-enter pin.',
        entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
        on: {
          RETRY: 'enteringPin'
        },
      },
      validatingRecipient: {
        description: 'Invoked service that validates the recipient.',
        invoke: {
          id: 'validatingRecipient',
          src: 'validateRecipient',
          onDone: { target: 'enteringAmount', actions: 'saveValidatedRecipient' },
          onError: [
            { target: 'invalidRecipientWithInvite', cond: 'isInvitableRecipientError', actions: 'updateErrorMessages' },
            { target: 'invalidRecipient', actions: 'updateErrorMessages' }
          ]
        },
        tags: 'invoked'
      }
    }
  },
  {
    actions: {
      saveAmount,
      saveRecipientEntry,
      saveValidatedRecipient,
      updateErrorMessages
    },
    guards: {
      isBlocked,
      isInviteError,
      isOption1,
      isOption9,
      isSuccess,
      isInvitableRecipientError,
      isTransferError,
      isValidAmount,
      isValidIdentifier,
      isValidPin
    },
    services: {
      authorizeTransfer,
      initiateInvite,
      initiateTransfer,
      validateRecipient,
    }
  });


async function authorizeTransfer(context: TransferContext, event: any) {

  await validatePin(context, event.input)

  try{
    await initiateTransfer(context)
    return { success: true }
  } catch (error: any) {
    throw new MachineError(TransferError.TRANSFER_ERROR, error.message)
  }
}

async function initiateInvite(context: TransferContext) {
  const {
    data,
    notifier,
    user: { account: { language, phone_number }, tag },
    ussd: { countryCode } } = context
  if (!data.recipientEntry) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Missing recipient entry.")
  }
  const invitee = validatePhoneNumber(countryCode, data.recipientEntry)
  try {
    const message = tSMS('upsell', language, { sender: tag ? tag : phone_number, supportPhone: config.KE.SUPPORT_PHONE })
    await sendSMS(message, notifier, [invitee])
    return { success: true }
  } catch (error: any) {
    throw new MachineError(TransferError.INVITE_ERROR, error.message)
  }
}

function isInvitableRecipientError(_: TransferContext, event: any) {
  return event.data.code === TransferError.INVALID_RECIPIENT || event.data.code === BaseMachineError.UNKNOWN_ACCOUNT
}

function isInviteError(_: TransferContext, event: any) {
  return event.data.code === TransferError.INVITE_ERROR
}

function isTransferError(_: TransferContext, event: any) {
  return event.data.code === TransferError.TRANSFER_ERROR
}

async function initiateTransfer(context: TransferContext) {
  const {
    data,
    user: {account: {address}, vouchers: { active: {address: voucherAddress}}}
  } = context

  if (!data.recipientAddress || !data.amount) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Missing recipient or amount.")
  }

  let response;
  try {
    response = await custodialTransfer({
      amount: data.amount * 1000000,
      from: address,
      to: data.recipientAddress,
      voucherAddress: voucherAddress
    })
  } catch (error: any) {
    throw new MachineError(TransferError.TRANSFER_ERROR, error.message)
  }

  if(!response.result){
    throw new SystemError(`Failed to initiate transfer. ${response?.message}`)
  }

  try {
    await createTracker(context.connections.db, {
      address: address,
      task_type: TaskType.TRANSFER,
      task_reference: response.result.trackingId
    })
    return { success: true }
  } catch (error: any) {
    throw new SystemError(`Failed to create tracker. ${error.message}`)
  }
}

function isValidAmount(context: TransferContext, event: any) {
  const amount = Number(event.input)
  return !isNaN(amount) && amount > 0 && amount <= context.user.vouchers.active.balance
}

function isValidIdentifier(context: TransferContext, event: any) {
  return event.input.length === 6 || event.input.startsWith('0x') || isValidPhoneNumber(context, event)
}

function saveAmount(context: TransferContext, event: any) {
  context.data.amount = cashRounding(event.input)
  return context
}

function saveRecipientEntry(context: TransferContext, event: any) {
  context.data.recipientEntry = event.input
  return context
}

function saveValidatedRecipient(context: TransferContext, event: any) {
  context.data.recipientAddress = event.data.address
  context.data.recipientTag = event.data.tag
  return context
}

async function validateRecipient(context: TransferContext, event: any) {
  const { input } = event
  let phoneNumber = input;
  let checksumAddress: string;
  if(input.startsWith('0x')){
    try {
      checksumAddress = ethers.getAddress(input)
    } catch (error: any) {
      throw new MachineError(TransferError.INVALID_ADDRESS, error.message)
    }
    const phoneNumber = await getPhoneNumberFromAddress(checksumAddress, context.connections.db, context.connections.redis.persistent)
    if(!phoneNumber){
      logger.warn(`No account found for address ${input}.`)
      const tag = tHelpers('unknownAddress', context.user.account.language)
      return { address: checksumAddress, tag }
    }
  }

  if(input.length === 6){
    const address = await getAddressFromTill(context.connections.graphql, context.connections.redis.persistent, input)
    if (!address) {
      throw new MachineError(BaseMachineError.UNKNOWN_TILL_OR_VPA, `No account found for till: ${input}`)
    }
    phoneNumber = await getPhoneNumberFromAddress(address, context.connections.db, context.connections.redis.persistent)
    if(!phoneNumber){
      throw new MachineError(BaseMachineError.UNKNOWN_ADDRESS, `Account not found for address: ${address}.`)
    }
  }

  const recipient = await validateTargetUser(context, phoneNumber)
  if (!recipient) {
      throw new MachineError(TransferError.INVALID_RECIPIENT, `No account found for recipient: ${input}`)
  }
  return { address: recipient.account.address, tag: recipient.tag }
}

async function transferTranslations(context: TransferContext, state: string, translator: any) {
  const {
    data,
    user: {
      tag,
      vouchers: { active: { balance, symbol } }
    },
  } = context;

  switch (state) {
    case 'mainMenu':
      return await translate(state, translator, { balance, symbol });
    case 'enteringAmount':
      return await translate(state, translator, { spendable: balance, symbol });
    case 'enteringPin':
    case 'transferInitiated':
      return await translate(state, translator, {
        amount: data?.amount,
        recipient: data?.recipientTag,
        sender: tag,
        symbol: symbol,
      });
    case 'invalidRecipient':
    case 'invalidRecipientWithInvite':
      return await translate(state, translator, { recipient: data?.recipientEntry});
    case 'inviteError':
    case 'inviteSuccess':
      return await translate(state, translator, { invitee: data?.recipientEntry });
    default:
      return await translate(state, translator);
  }
}

export const transferMachine = {
  stateMachine,
  translate: transferTranslations
}

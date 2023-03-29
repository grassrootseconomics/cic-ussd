import { createMachine, raise } from 'xstate';
import {
  BaseContext,
  BaseEvent,
  isOption1,
  isOption9,
  isSuccess,
  isValidPhoneNumber,
  MachineId,
  translate,
  updateErrorMessages,
  validatePhoneNumber,
  validateTargetUser
} from '@src/machines/utils';
import { cashRounding } from '@lib/ussd/utils';
import { isBlocked, isValidPin, validatePin } from '@src/machines/auth';
import { custodialTransfer } from '@lib/custodail';
import { createTracker, CustodialTaskType } from '@db/models/custodailTasks';
import { MachineError } from '@lib/errors';

enum TransferError {
  INVITE_ERROR = 'INVITE_ERROR',
  TRANSFER_ERROR = "TRANSFER_ERROR",
}


export const transferMachine = createMachine<BaseContext, BaseEvent>({
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
            { target: 'invalidPin' },
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
            { target: 'validatingRecipient', actions: 'saveEntry' }
          ]
        }
      },
      exit: {
        description: 'Terminates USSD session.',
        type: 'final'
      },
      invalidAmount: {
        description: 'Entered amount is invalid. Raise RETRY event to prompt user to re-enter amount.',
        entry: raise({ type: 'RETRY', feedback: 'invalidAmount' }),
        on: {
          RETRY: 'enteringAmount'
        }
      },
      invalidRecipient: {
        description: 'Entered phone number is invalid.',
        on: {
          TRANSIT: [
            { target: 'exit', cond: 'isOption9' },
            { target: 'invitingRecipient', cond: 'isOption1' },
            { target: 'validatingRecipient', cond: 'isValidPhoneNumber', actions: 'saveEntry' },
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
        entry: raise({ type: 'RETRY', feedback: 'invalidPin' }),
        on: {
          RETRY: 'enteringPin'
        },
        tags: 'error'
      },
      validatingRecipient: {
        description: 'Invoked service that validates the recipient.',
        invoke: {
          id: 'validatingRecipient',
          src: 'validateRecipient',
          onDone: { target: 'enteringAmount', actions: 'saveValidatedRecipient' },
          onError: { target: 'invalidRecipient', actions: 'updateErrorMessages' }
        },
        tags: 'invoked'
      }
    }
  },
  {
    actions: {
      saveAmount,
      saveEntry,
      saveValidatedRecipient,
      updateErrorMessages
    },
    guards: {
      isBlocked,
      isInviteError,
      isOption1,
      isOption9,
      isSuccess,
      isTransferError,
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


async function authorizeTransfer(context, event: any) {
  const { input } = event

  await validatePin(context, input)

  try{
    await initiateTransfer(context)
    return { success: true }
  } catch (error) {
    throw new MachineError(TransferError.TRANSFER_ERROR, error.message)
  }
}

async function initiateInvite(context: BaseContext) {
  const {
    data: { transfer: { recipient: { entry } } },
    user: { account: { phone_number } },
    ussd: { countryCode } } = context
  const invitee = validatePhoneNumber(countryCode, entry)
  try {
    console.debug(`Initiating invite to ${invitee} from ${phone_number}`)
    return { success: true }
  } catch (error) {
    throw new MachineError(TransferError.INVITE_ERROR, error.message)
  }
}

function isInviteError(_, event: any) {
  return event.data.code === TransferError.INVITE_ERROR
}

function isTransferError(_, event: any) {
  return event.data.code === TransferError.TRANSFER_ERROR
}

async function initiateTransfer(context: BaseContext) {
  const {
    data: { transfer: { amount, recipient: { validated } } },
    user: {account: {address}, vouchers: { active: {address: voucherAddress}}}
  } = context

  const response = await custodialTransfer({
      amount: amount * 1000000,
      from: address,
      to: validated,
      voucherAddress: voucherAddress
    })

  await createTracker(context.resources.db, {
      address: address,
      task_type: CustodialTaskType.TRANSFER,
      task_reference: response.result.trackingId
    })
}

function isValidAmount(context: BaseContext, event: any) {
  const amount = Number(event.input)
  return !isNaN(amount) && amount > 0 && amount <= context.user.vouchers.active.balance
}

function saveAmount(context: BaseContext, event: any) {
  context.data.transfer = {
    ...(context.data.transfer || {}),
    amount: cashRounding(event.input)
  }
  return context
}

function saveEntry(context: BaseContext, event: any) {
  context.data = {
    ...(context.data || {}),
    transfer: {
      ...(context.data?.transfer || {}),
      recipient: {
        ...(context.data?.transfer?.recipient || {}),
        entry: event.input
      }
    }
  }
  return context
}

function saveValidatedRecipient(context: BaseContext, event: any) {
  context.data.transfer = {
    recipient: {
      ...(context.data.transfer?.recipient || {}),
      tag : event.data.tag,
      validated: event.data.address
    }
  }
  return context
}

async function validateRecipient(context: BaseContext, event: any) {
  const { input } = event
  const recipient = await validateTargetUser(context, input)
  return { address: recipient.account.address , tag: recipient.tag }
}

export async function transferTranslations(context: BaseContext, state: string, translator: any) {
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
        amount: data.transfer.amount,
        recipient: data.transfer.recipient.tag,
        sender: tag,
        symbol: symbol,
      });
    case 'invalidRecipient':
      return await translate(state, translator, { recipient: data.transfer.recipient.entry });
    case 'inviteError':
    case 'inviteSuccess':
      return await translate(state, translator, { invitee: data.transfer.recipient.entry });
    default:
      return await translate(state, translator);
  }
}

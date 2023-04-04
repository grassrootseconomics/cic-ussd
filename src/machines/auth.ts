import { createMachine, raise } from 'xstate';
import { AccountStatus, activateOnUssd, blockOnUssd, updatePinAttempts } from '@db/models/account';
import { BaseContext, BaseEvent, isOption00, MachineId, translate, updateErrorMessages } from '@machines/utils';
import { ContextError, MachineError, SystemError } from '@lib/errors';
import { PostgresDb } from '@fastify/postgres';
import { Redis as RedisClient } from 'ioredis';
import { updateGraphUser } from '@lib/graph/user';

const bcrypt = require('bcrypt');

enum AuthErrors {
  HASH_ERROR = "HASH_ERROR",
  INVALID = "INVALID",
  UNAUTHORIZED = "UNAUTHORIZED"
}


export const authMachine = createMachine<BaseContext, BaseEvent>({
  id: MachineId.AUTH,
  initial: "authenticating",
  predictableActionArguments: true,
  states: {
    accountBlocked: {
      description: 'Account is blocked.',
      type: 'final'
    },
    activatingAccount: {
      description: 'Invoked service that marks account as activated on USSD.',
      invoke: {
        src: 'activateAccount',
        onDone: 'mainMenu',
        onError: { target: 'activationError', actions: 'updateErrorMessages' }
      },
      tags: 'invoked'
    },
    activationError: {
      description: 'Account activation failed.',
      tags: 'error',
      type: 'final'
    },
    authenticating: {
      description: 'Determines the next state based on the account status.',
      always: [
        { target: 'accountBlocked', cond: 'isBlocked' },
        { target: 'processingAccount', cond: 'isPendingOnChain' },
        { target: 'enteringPin', cond: 'isPendingOnUssd' }
      ]
    },
    confirmingPin: {
      description: 'Expects PIN that matches the previously entered PIN.',
      on: {
        BACK: 'enteringPin',
        TRANSIT: [
          { target: 'activatingAccount', cond: 'pinsMatch' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'pinMismatch' }
        ]
      },
      tags: 'encryptInput'
    },
    enteringPin: {
      description: 'Expects valid PIN entry.',
      on: {
        TRANSIT: [
          { target: 'confirmingPin', cond: 'isValidPin', actions: 'savePin' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidPin' }
        ]
      },
      tags: 'encryptInput'
    },
    exit: {
      description: 'Terminated USSD session.',
      type: 'final'
    },
    invalidPin: {
      description: 'Entered PIN is invalid. Raises a RETRY event to prompt user to retry pin entry.',
      entry: raise({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPin'
      }
    },
    mainMenu: {
      description: 'Transitions to main menu.',
      tags: 'resolved',
      type: 'final'
    },
    pinMismatch: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: raise({ type: 'RETRY', feedback: 'pinMismatch' }),
      on: {
        RETRY: 'confirmingPin'
      }
    },
    processingAccount: {
      description: 'Account is not yet active on chain.',
      type: 'final'
    }
  }
  },
    {
      actions: {
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
  const { resources: { db, graphql, p_redis }, user: { account: { phone_number }, graph: { user: { id } } } } =  context
  const initial = context.data?.pins?.initial

  if (!initial) {
      throw new SystemError(`Malformed context data. Expected 'pins.initial' to be defined.`)
  }

  if(!id) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Graph user id missing from context object.")
  }

  const hashedInput = await hashValue(initial)
  await activateOnUssd(db, hashedInput, phone_number, p_redis)
  await updateGraphUser(id, graphql, { activated: true })
}

export async function blockAccount (db: PostgresDb, phoneNumber: string, redis: RedisClient) {
  await blockOnUssd(db, phoneNumber, redis)
}

export async function hashValue(value: string) {
  try {
    return await bcrypt.hash(value, 8);
  } catch (err) {
    throw new MachineError(AuthErrors.HASH_ERROR, "Invalid pin format.");
  }
}

export function isBlocked (context: BaseContext) {
  const { user: { account: { status } } } = context
  return status === AccountStatus.BLOCKED
}

export function isPendingOnChain (context: BaseContext, _: any) {
  const { user: { account: { activated_on_chain, status } } } = context
  return !activated_on_chain && status === AccountStatus.PENDING
}

export function isPendingOnUssd (context: BaseContext) {
  const { user: { account: { activated_on_chain, activated_on_ussd, status } } } = context
  return (
    status === AccountStatus.PENDING && activated_on_chain && !activated_on_ussd
  )
}

export function isValidPin (_: BaseContext, event: any) {
  return /^\d{4}$/.test(event.input)
}

export function pinsMatch (context: BaseContext, event: any) {
  const initial = context.data?.pins?.initial

  if (!initial) {
      throw new SystemError(`Malformed context data. Expected 'pins.initial' to be defined.`)
  }

  return initial === event.input
}

export function savePin (context: BaseContext, event: any) {
  context.data = {
    ...(context.data || {}),
    pins: {
      ...(context.data?.pins || {}),
      initial: event.input
    }
  }
  return context
}

export async function updateAttempts(attempts: number, db: PostgresDb, phoneNumber: string, redis: RedisClient, status: AccountStatus) {
  if (status === AccountStatus.BLOCKED) return
  const updatedAttempts = attempts + 1
  await updatePinAttempts(db, phoneNumber, updatedAttempts, redis)
  updatedAttempts === 3 && await blockAccount(db, phoneNumber, redis)
}

export async function validatePin(context: BaseContext, input: string) {
  const { user: { account: { pin, phone_number, pin_attempts, status } }, resources: { db, p_redis } } = context
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    throw new MachineError(AuthErrors.INVALID, "Invalid pin format.")
  }
  const isMatch = await bcrypt.compare(input, pin)
  if (!isMatch) {
    await updateAttempts(pin_attempts, db, phone_number, p_redis, status)
    throw new MachineError(AuthErrors.UNAUTHORIZED, "Unauthorized pin.")
  }
  await updatePinAttempts(db, phone_number, 0, p_redis)
}

export async function authTranslations(context: BaseContext, state: string, translator: any) {
  if (state === "mainMenu"){
    const { user: { vouchers: { active: { balance, symbol } } } } = context
    return await translate(state, translator, { balance: balance, symbol: symbol })
  } else {
    return await translate(state, translator)
  }
}
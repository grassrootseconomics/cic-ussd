import { createMachine, send } from 'xstate';
import { AccountStatus } from '@db/models/account';
import { ContextError, MachineError } from '@lib/errors';
import { PostgresDb } from '@fastify/postgres';
import { Redis as RedisClient } from 'ioredis';
import {
  isOption00,
  MachineEvent,
  MachineId,
  MachineInterface,
  updateErrorMessages,
  UserContext
} from '@machines/utils';
import { AccountService } from '@services/account';
import { translate } from '@i18n/translators';

const bcrypt = require('bcrypt');

enum AuthErrors {
  HASH_ERROR = "HASH_ERROR",
  INVALID = "INVALID",
  UNAUTHORIZED = "UNAUTHORIZED"
}

export interface AuthContext extends UserContext {
  data: {
    initialPin?: string,
  }
}

const stateMachine = createMachine<AuthContext, MachineEvent>({
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
      entry: send({ type: 'RETRY', feedback: 'invalidPinAtRegistration' }),
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
      entry: send({ type: 'RETRY', feedback: 'pinMismatch' }),
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

export async function activateAccount (context: AuthContext) {
  const { connections: { db, graphql, redis }, user: { account: { phone_number }, graph: { user: { id } } } } =  context
  if(!context.data?.initialPin){
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Context data is missing initialPin.");
  }
  const hashedPin = await hashValue(context.data.initialPin)
  await new AccountService(db, redis.persistent).activateOnUssd(graphql, id, phone_number, hashedPin)
}

export async function blockAccount (db: PostgresDb, phoneNumber: string, redis: RedisClient) {
  await new AccountService(db, redis).block(phoneNumber)
}

export async function hashValue(value: string){
  try {
    return await bcrypt.hash(value, 8);
  } catch (err) {
    throw new MachineError(AuthErrors.HASH_ERROR, "Invalid pin format.");
  }
}

export function isBlocked (context: UserContext) {
  const { user: { account: { status } } } = context
  return status === AccountStatus.BLOCKED
}

export function isPendingOnChain (context: AuthContext) {
  const { user: { account: { activated_on_chain, status } } } = context
  return !activated_on_chain && status === AccountStatus.PENDING
}

export function isPendingOnUssd (context: AuthContext) {
  const { user: { account: { activated_on_chain, activated_on_ussd, status } } } = context
  return (
    status === AccountStatus.PENDING && activated_on_chain && !activated_on_ussd
    || status === AccountStatus.RESETTING_PIN && !activated_on_ussd
  )
}

export function isValidPin (_: UserContext, event: any) {
  return /^\d{4}$/.test(event.input)
}

export function pinsMatch (context: AuthContext, event: any) {
  return context.data.initialPin === event.input
}

export function savePin (context: AuthContext, event: any) {
  context.data = { initialPin: event.input }
  return context
}

export async function updateAttempts(attempts: number, db: PostgresDb, phoneNumber: string, redis: RedisClient, status: AccountStatus) {
  if (status === AccountStatus.BLOCKED) return
  const updatedAttempts = attempts + 1
  await new AccountService(db, redis).updatePinAttempts(phoneNumber, updatedAttempts)
  updatedAttempts === 3 && await blockAccount(db, phoneNumber, redis)
}

export async function validatePin(context: UserContext, input: string) {
  const { connections: { db, redis }, user: { account: { pin, phone_number, pin_attempts, status } } } = context
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    throw new MachineError(AuthErrors.INVALID, "Invalid pin format.")
  }
  const isMatch = await bcrypt.compare(input, pin)
  if (!isMatch) {
    await updateAttempts(pin_attempts, db, phone_number, redis.persistent, status)
    throw new MachineError(AuthErrors.UNAUTHORIZED, "Unauthorized pin.")
  }
  await new AccountService(db, redis.persistent).updatePinAttempts(phone_number, 0)
}

async function authTranslations(context: AuthContext, state: string, translator: any){
  if (state === "mainMenu"){
    const { user: { vouchers: { active: { balance, symbol } } } } = context
    return await translate(state, translator, { balance: balance, symbol: symbol })
  }
  return await translate(state, translator)
}

export const authMachine: MachineInterface = {
  stateMachine: stateMachine,
  translate: authTranslations
}
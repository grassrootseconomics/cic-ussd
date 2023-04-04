import { createMachine, raise } from 'xstate';
import {
  BaseContext,
  BaseEvent,
  isOption00,
  isOption11,
  isOption22,
  isSuccess,
  MachineId,
  menuPages,
  translate,
  updateErrorMessages
} from '@machines/utils';
import { isBlocked, validatePin } from '@machines/auth';
import { ContextError, MachineError } from '@lib/errors';
import { Address, cashRounding, getTag } from '@lib/ussd/utils';
import { tHelpers } from '@i18n/translators';
import moment from 'moment-timezone';
import { Redis as RedisClient } from 'ioredis';
import { GraphQLClient } from 'graphql-request';
import { config } from '@/config';
import { ethers } from 'ethers';
import { Locales } from '@i18n/i18n-types';


export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export interface Transaction {
  block: number;
  from: Address;
  symbol: string;
  time: number;
  to: Address;
  transactionHash: string;
  type: TransactionType;
  value: number;
}

enum StatementError {
  LOAD_ERROR = "LOAD_ERROR"
}

export const statementMachine = createMachine<BaseContext, BaseEvent>({
  id: MachineId.STATEMENT,
  initial: "enteringPin",
  predictableActionArguments: true,
  states: {
    accountBlocked: {
      description: 'Account is blocked.',
      tags: 'error',
      type: 'final'
    },
    authorizingStatementView: {
      description: 'Invoked service that authorizes view of account statement.',
      invoke: {
        id: 'authorizeStatementView',
        src: 'authorizeStatementView',
        onDone: { target: 'firstTransactionSet', cond: 'isSuccess', actions: 'saveStatement' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'loadError', cond: 'isLoadError', actions: 'updateErrorMessages' },
          { target: 'invalidPin' },
        ]
      },
      tags: 'invoked'
    },
    enteringPin: {
      description: "Expects valid PIN matching account's PIN.",
      on: {
        BACK: 'settingsMenu',
        TRANSIT: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'authorizingStatementView' },
        ]
      },
      tags: ['encryptInput', 'error']
    },
    exit: {
      description: 'Terminates USSD session.',
      type: 'final'
    },
    firstTransactionSet: {
      description: 'Displays first set of transactions.',
      on: {
        BACK: 'settingsMenu',
        TRANSIT: [
          { target: 'secondTransactionSet', cond: 'isOption11' },
          { target: 'exit', cond: 'isOption00' }
        ]
      },
      tags: 'resolved'
    },
    invalidPin: {
      description: 'Entered PIN is invalid. Raises a RETRY event to prompt user to retry PIN entry.',
      entry: raise({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPin'
      }
    },
    loadError: {
      description: 'Loading statement failed.',
      tags: 'error',
      type: 'final'
    },
    settingsMenu: {
      description: 'Transitions to settings menu.',
      type: 'final'
    },
    secondTransactionSet: {
      description: 'Displays second set of transactions.',
      on: {
        TRANSIT: [
          { target: 'thirdTransactionSet', cond: 'isOption11' },
          { target: 'firstTransactionSet', cond: 'isOption22' },
          { target: 'exit', cond: 'isOption00' }
        ]
      }
    },
    thirdTransactionSet: {
      description: 'Displays third set of transactions.',
      on: {
        TRANSIT: [
          { target: 'secondTransactionSet', cond: 'isOption22' },
          { target: 'exit', cond: 'isOption00' }
        ]
      }
    }
  }
}, {
  actions: {
    saveStatement,
    updateErrorMessages
  },
  guards: {
    isBlocked,
    isLoadError,
    isOption00,
    isOption11,
    isOption22,
    isSuccess
  },
  services: {
    authorizeStatementView
  }
})

function isLoadError(context: BaseContext, event: any) {
  return event.data.code === StatementError.LOAD_ERROR;
}

async function authorizeStatementView(context: BaseContext, event: any) {
  const { resources: { graphql, p_redis }, user: { account: { language }, transactions } } = context
  const { input } = event

  await validatePin(context, input)

  try {
    const statement = await generateStatement(graphql, language, p_redis, transactions || [])
    return { success: true, statement: statement }
  } catch (error) {
    throw new MachineError(StatementError.LOAD_ERROR, `Error loading statement.`)
  }
}

async function generateStatement( graphql: GraphQLClient, language: Locales, redis: RedisClient, transactions: Transaction[]){
  const placeholder = tHelpers("noMoreTransactions", language)
  const sortedTransactions = [...transactions].sort((a, b) => b.time - a.time)
  const formattedTransactions = await Promise.all(sortedTransactions
    .map(async (transaction) => {
     return formatTransaction(transaction, language, redis)
  }))
  return await menuPages(formattedTransactions, placeholder)
}

async function formatTransaction(transaction: Transaction, language: Locales, redis: RedisClient){
  const { from, symbol, time, to, type, value } = transaction
  const transactionType = type === TransactionType.CREDIT ? "credit" : "debit"
  const [recipient, sender] = await Promise.all([
    getTransactionActor(to, language, redis),
    getTransactionActor(from, language, redis)
  ])

  const data = {
    value: cashRounding(ethers.formatUnits(value, 6)),
    symbol: symbol,
    time: moment(new Date(time)).tz(config.TIMEZONE).format("DD-MM-YYYY HH:mm A"),
    sender: sender,
    recipient: recipient
  }
  return tHelpers(transactionType, language, data)
}

async function getTransactionActor(address: string, language: Locales, redis: RedisClient){
  let actor = tHelpers("unknownAddress", language)
  const phoneNumber = await redis.get(`address-phone-${address}`)
  if (phoneNumber) {
    actor = await getTag(phoneNumber, redis)
  }
  return actor
}

function saveStatement(context: BaseContext, event: any) {
  context.data = {
    ...(context.data || {}),
    statement: event.data.statement
  }
  return context;
}

export async function statementTranslations(context: BaseContext, state: string, translator: any){
  const { data: { statement } } = context
  switch (state) {
    case "firstTransactionSet":
      if(!statement) throw new MachineError(ContextError.MALFORMED_CONTEXT, "Statement missing in context object data.")
      return await translate(state, translator, {transactions: statement[0]})
    case "secondTransactionSet":
      if(!statement) throw new MachineError(ContextError.MALFORMED_CONTEXT, "Statement missing in context object data.")
      return await translate(state, translator, {transactions: statement[1]})
    case "thirdTransactionSet":
      if(!statement) throw new MachineError(ContextError.MALFORMED_CONTEXT, "Statement missing in context object data.")
      return await translate(state, translator, {transactions: statement[2]})
    default:
      return await translate(state, translator)
  }
}

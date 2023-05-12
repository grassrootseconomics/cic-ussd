import { createMachine, send } from 'xstate';
import {
  isOption00,
  isOption11,
  isOption22,
  isSuccess,
  MachineEvent,
  MachineId,
  MachineInterface,
  updateErrorMessages,
  UserContext
} from '@machines/utils';
import { isBlocked, validatePin } from '@machines/auth';
import { MachineError } from '@lib/errors';
import { tHelpers, translate } from '@i18n/translators';
import { Redis as RedisClient } from 'ioredis';
import { GraphQLClient } from 'graphql-request';
import { Locales } from '@i18n/i18n-types';
import { Transaction, TransactionType } from '@services/transfer';
import { menuPages } from '@lib/ussd';


enum StatementError {
  LOAD_ERROR = "LOAD_ERROR"
}

export interface StatementContext extends UserContext {
  statement: Transaction[]
}

export const stateMachine = createMachine<StatementContext, MachineEvent>({
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
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
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

function isLoadError(context: StatementContext, event: any) {
  return event.data.code === StatementError.LOAD_ERROR;
}

async function authorizeStatementView(context: StatementContext, event: any) {
  const { connections: { graphql, redis }, user: { account: { language }, statement } } = context

  await validatePin(context, event.input)

  try {
    const formattedStatement = await formatStatement(graphql, language, redis.persistent, statement || [])
    return { success: true, statement: formattedStatement }
  } catch (error) {
    throw new MachineError(StatementError.LOAD_ERROR, `Error loading statement.`)
  }
}

async function formatStatement( graphql: GraphQLClient, language: Locales, redis: RedisClient, transactions: Transaction[]){
  const placeholder = tHelpers("noMoreTransactions", language)
  const formattedTransactions = await Promise.all(transactions.map(async (transaction) => {
      const transactionType = transaction.type === TransactionType.CREDIT ? "credit" : "debit"
     return tHelpers(transactionType, language, {
       value: transaction.value,
       time: transaction.timestamp,
       sender: transaction.sender,
       recipient: transaction.recipient,
       symbol: transaction.symbol,
     })
  }))
  return await menuPages(formattedTransactions, placeholder)
}

function saveStatement(context: StatementContext, event: any) {
  context.data.statement = event.data.statement
  return context;
}

async function statementTranslations(context: StatementContext, state: string, translator: any){
  const { data: { statement } } = context
  switch (state) {
    case "firstTransactionSet":
      return await translate(state, translator, {transactions: statement[0]})
    case "secondTransactionSet":
      return await translate(state, translator, {transactions: statement[1]})
    case "thirdTransactionSet":
      return await translate(state, translator, {transactions: statement[2]})
    default:
      return await translate(state, translator)
  }
}

export const statementMachine: MachineInterface = {
  stateMachine,
  translate: statementTranslations
}
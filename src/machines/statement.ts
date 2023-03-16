import {createMachine, send} from "xstate";
import {
  BaseContext,
  BaseEvent, isOption00, isOption11,
  isOption22,
  isOption9,
  menuPages,
  translate,
  updateErrorMessages
} from "@src/machines/utils";
import {AccountMetadata, getAccountMetadata} from "@lib/ussd/account";
import {isBlocked, updateAttempts} from "@machines/auth";
import {MachineError} from "@lib/errors";
import bcrypt from "bcrypt"
import {getTransactionTag, Symbol} from "@lib/ussd/utils";
import {tHelpers} from "@src/i18n/translator";
import moment from "moment-timezone";
import {Redis as RedisClient} from "ioredis";
import {TransferContext} from "@machines/transfer";


export interface StatementContext extends BaseContext {
  data: {
    statement?: string[];
  };
}

type StatementEvent =
  BaseEvent


export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export interface Transaction {
  block: number;
  from: string;
  symbol: Symbol;
  time: number;
  to: string;
  transactionHash: string;
  type: TransactionType;
  value: number;
}

enum StatementErrors {
  INVALID_PIN = "INVALID_PIN",
  LOAD_ERROR = "LOAD_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
}

export const statementMachine = createMachine<StatementContext, StatementEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMVgLZgHYoFk0BjACwEtcwA6NAVxVIHsAncgL0qgGV1Md8ANXJgA7gGIAQgEEAwgGkA2gAYAuolAAHJrHIpyTXBpAAPRABYArOeoAOAEy2AjE4Bslx-YDsATksAaEABPRABmD2pQ1ysvL3sop1tlawBfFMDUDGw8QhIKKloGZjZOXB4+bKERCQAVACVpADluAEkalXUkEG1dfUNjMwQrGwdnNw8HXwDgiy9Q6lcnGPNbUJ9lczi0jIqBXLJKGnpGVg4uXiy94TFxeqbW9qdOrR09AyMuweG7Rxd3TymgRCCCcoSc1B8kMhzksoTBfks2xAmX4OSIBwKx2KZzKF1RVRud2abUU9me3VefQ+oC+1h+Y3+kz8QMQ9nMrjs0Usvnsrg2vPMSJRlX2+RodFwWNO7EgeJF1wkdQAovUAJodYw9N79T6IVwOajKMHxRbmHxOSyuHwshDOahmqHraIOezKWxC3ZovKHagAGyYaAg509+HEEEMNEoADcmABrGjCvbosV+gNB3EhlAIaNMYgYd4dDVdLVUgaIJwbHwQ5SueyOSyV-42zbg1Zwtm2Zz2RI+Lwey5ejE0f2B4MD0NgFgsVjUTS+jAAM1YWGoicHKZH6fK46zObzVMLak1lPeZZBlertfrjY8NqiHLh7atyXZm1CaXSIFwTAgcGMa-wZNDmPXpT11BAAFpXBtKDDWUeCEMQhC+0-ADRR9LA0EoAg8DoEDtWpUxECmSInA7cxkidUJbDvewqyiGJYh8exLA8bx+3xdDMSKaUx04hV8NLcDzHsZt4kiLkvD5V1bHMaiOJFICCglKUSllTMBOLE8dRpYi-FI8jKJraibRcWwJKsZxZIrOSfAUpNvQKTc+JFQSwN020nCrcxNnWZQXBWS0nGbUIRkk7l9VCYz7PXH00IAGTTSA3J0oiQQ7CF9TiOTVh8VwpObLxlGoALuTNOEvBWFCdh3JSE0zRLAwAMSw31kq00DUsGMiVky2xsuotZ8ugmYEAYhYlgivxfB8KwYsAxyjmIYgmAlFBJH9Yh4wgFLCMGEjjRWCjLComjRrreZbEknxnHym6jQ-FIgA */
  id: "statement",
  initial: "enteringPin",
  predictableActionArguments: true,
  states: {
    mainMenu: {
      type: "final",
      description: "User is returned to the main menu."
    },
    enteringPin: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "authorizingStatementView", cond: "isNotBlocked" },
          { target: "accountBlocked" }
        ]
      }
    },
    authorizingStatementView: {
      invoke: {
        id: "authorizeStatementView",
        src: "loadStatement",
        onDone: { target: "firstTransactionSet", cond: "succeeded", actions: "saveStatement" },
        onError: [
          { target: "invalidPin", cond: "isInvalidPin" },
          { target: "loadError", cond: "isLoadError", actions: "updateErrorMessages" },
          { target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      tags: "invoked"
    },
    invalidPin: {
      entry: send( { type: "RETRY", feedback: "invalidPin" } ),
      on: {
        RETRY: "enteringPin"
      },
      description: "User is prompted to re-enter their PIN.",
      tags: "error"
    },

    // final states
    firstTransactionSet: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "secondTransactionSet", cond: "isOption11" },
          { target: "exit", cond: "isOption00" }
        ]
      },
      description: "User is informed that their account balance has been loaded.",
      tags: "resolved"
    },
    secondTransactionSet: {
      on: {
        TRANSIT: [
          { target: "thirdTransactionSet", cond: "isOption11" },
          { target: "firstTransactionSet", cond: "isOption22" },
          { target: "exit", cond: "isOption00" }
        ]
      }
    },
    thirdTransactionSet: {
      on: {
        TRANSIT: [
          { target: "secondTransactionSet", cond: "isOption22" },
          { target: "exit", cond: "isOption00" }
        ]
      }
    },
    loadError: {
      type: "final",
      description: "An error occurred while loading the account balance.",
      tags: "error"
    },
    accountBlocked: {
      type: "final",
      description: "User is informed that their account is blocked.",
      tags: "error"
    },
    exit: {
      type: "final",
      description: "User is returned to the main menu.",
    }
  }
}, {
  actions: {
    updateErrorMessages,
    saveStatement
  },
  guards: {
    isBlocked,
    isLoadError,
    isNotBlocked: (context: StatementContext) => !isBlocked(context),
    isInvalidPin,
    isOption00,
    isOption11,
    isOption22,
    succeeded: (context: StatementContext, event: any) => event.data.success
  },
  services: {
    loadStatement
  }
})

function isLoadError(context: StatementContext, event: any) {
  return event.data.code === StatementErrors.LOAD_ERROR;
}

function isInvalidPin(context: StatementContext, event: any) {
  return event.data.code === StatementErrors.INVALID_PIN || event.data.code === StatementErrors.UNAUTHORIZED
}

async function loadStatement(context: StatementContext, event: any) {
  const { resources: { p_redis }, user: { account: { address, language, password } } } = context
  const { input } = event

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(StatementErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(StatementErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  // load statement
  try {
    const statement = await getAccountMetadata(address, p_redis, AccountMetadata.STATEMENT) || [];
    const formattedStatement = await formatStatement(language, p_redis, statement)
    return { success: true, statement: formattedStatement }
  } catch (error) {
    console.error("STATEMENT ERROR", error.stackTrace)
    throw new MachineError(StatementErrors.LOAD_ERROR, error.message)
  }
}

async function formatStatement(language: string, redis: RedisClient, transactions: Transaction[]){
  const placeholder = tHelpers("noMoreTransactions", language)
  if (transactions.length === 0) return [[placeholder], [placeholder], [placeholder]]
  const formattedTransactions = await Promise.all(transactions.map(async (transaction) => {
    const { from, symbol, time, to, type, value } = transaction
    const transactionType = type === TransactionType.CREDIT ? "credit" : "debit"
    const [fromTag, toTag] = await Promise.all([
      getTransactionTag(from, redis),
      getTransactionTag(to, redis)
    ])
    return tHelpers(transactionType, language, {
      value,
      symbol,
      time: moment.unix(time).format("DD-MM-YYYY HH:mm A"),
      from: fromTag,
      to: toTag
    })
  }))
  return await menuPages(formattedTransactions, placeholder)
}

function saveStatement(context: StatementContext, event: any) {
  context.data.statement = event.data.statement;
  return context;
}

export async function statementTranslations(context: StatementContext, state: string, translator: any){
  const { data, user: { activeVoucher: { balance, symbol } } } = context;
  switch (state) {
    case "mainMenu":
      return await translate(state, translator, {balance, symbol})
    case "firstTransactionSet": {
      const {statement} = data;
      return await translate(state, translator, {transactions: statement[0]})
    }
    case "secondTransactionSet": {
      const {statement} = data;
      return await translate(state, translator, {transactions: statement[1]})
    }
    case "thirdTransactionSet": {
      const {statement} = data;
      return await translate(state, translator, {transactions: statement[2]})
    }
    default:
      return await translate(state, translator)
  }
}

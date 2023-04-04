import { createMachine, raise } from 'xstate';
import {
  BaseContext,
  BaseEvent,
  getLanguage,
  isOption00,
  isOption11,
  isOption22,
  isSuccess,
  languageOptions,
  MachineId,
  translate,
  updateErrorMessages,
  User
} from '@machines/utils';
import { Address, supportedLanguages } from '@lib/ussd/utils';
import { createWallet } from '@lib/custodail';
import { createTracker, CustodialTaskType } from '@db/models/custodailTasks';
import { createAccount } from '@db/models/account';
import { createGraphUser } from '@lib/graph/user';
import { createGraphAccount, GraphAccountTypes } from '@lib/graph/account';
import { ContextError, ErrorCodes, MachineError, SystemError } from '@lib/errors';
import { Cache } from '@utils/redis';

enum RegistrationError {
  ACCOUNT_CREATION_FAILED = 'ACCOUNT_CREATION_FAILED',
}


export const registrationMachine = createMachine<BaseContext, BaseEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOkwCcx0AXAqAQU0wHsBXfagYgmcJIIBuzANZgSaLHkKkKVWvgZM2HBIOaYauXgG0ADAF09+xKAAOzWLlq8TIAB6IATAHZHukgDYALLo+OArB4AzAAcAIwRADQgAJ6IYbq6-iTOukGOYW4eYV5h4QC++dESOATEZJSaCows7Fxg5OTM5CSmADY0AGbNqOIYpdIVcnQ1ytSq+EIa1vhGRrbmljO2Dggubp4+foGhEWHRcQgJISEkXs4el2FBAJyuSSGFxf1S5Z245LDUADLoCqzoGAAZTAXAAKgAlegAOSBAEkwfMkCBFlYtPgVogvP5nCRdDcgs5ArpnDdciT-Ad4jkvGd-OlfCEbkl-KyniASq9SO9Pj8-lAAcDQZxITD4YiwsZkajlsjVtjcfjCcTSeSiVSEKEPCR-IlEjTHCEgl4guzOWVuR8vr9-oCwCDwVDYQjtI4pWYLGibHKsTi8QSiR4SWSEurYohnEFtUTEjdLs4iVGzS8LSQedb+YL7cLRc7EUF3SjPbLQPK-UrA8G1ZTw2tdI4SAFEkFboEPKz-MnJKnBOg2rgIDaBXaAPKmGacCEAUUhAE0kR6lujMWsEtqbvSwjcmWTdWFnBrwjq9T4bmFAtcvF2BuVYGAWPhB5m7Q6RU7xQui0vvaX4m53HkRKpI4bgtucGoJIkJB3JcXhGro2LxteXIkHeD5PraQqOmKLqSgsxbLj6CBeBuZw3OR3gkuc-iZBqLbanqujnlGFLIamaG8Bhw5YW+OGIm6+HfhiRGZFBgE4vWoHGgeta6u4ckIfiCE5GSV5FByKaDBxj5Dlmr65h+BaCV6wm-kc-4kOJwFSeBtbZAx+ppME3gEo86nmlp96cbpL45u+LpeIWMqEWZokASEQGSWk0l0Y4QR4nqjgeORFwwR4bGDNQeDkFxel+Xxn7BT+9jxMyYQ6tsgT+Ke3ghIefoKUyzh5DibnPN2mXZblvnYXm2h4dKBHFasmShDqAa3EyW7OCEjgati7iMdVs1ZP4jgZeUWUfN1PEGS6AmDUJK5bkxFUBFVNVwfNpFNhESQbtiYTeBtpBbTlPm7f5+ZBUNpklUcZVnay7aXXVtZeBDKQkXcmQtaSYSFOp+DMBAcC2B5xDGSW-0ALQeBqeMJYxxN6s4L0kFgtQcAAwpUMxTo0zRYyF-1BDSZy+EE-ghBDPMhPjtbHNGaQgUEaQ3I4zJtRpHXlJTYy08MvBAqwTBwPAh0mSubOQ1sXM83BcEC4c27laBbjhNzwNk+5mnlLIVSKFT1DM8NTiS2bzIeAmNGEsENYmzz0H0nFYvnpcujSxjpBgHYViu39qwgYamyc-SSReI4EMav4BJE5HEuEk9Jzk+mfKYdmLua9j8pzbWJwkOkOTZKykuzSEna27LpC9v2O1gGO2NFYn7sp5R-ti9VWdeBBqTQYl4TnuRLg2+1N6kNp-cOgnK4JrS+6AWz3uBBcsU3CkclH4GEWml368kG9W+gjvIk0biSWBHB27nGSxtYiaF9Ej-lCJGO4iN8hAA */
  id: MachineId.REGISTRATION,
  initial: "firstLanguageSet",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    accountCreationError: {
      description: 'Account creation failed.',
      tags: 'error',
      type: 'final'
    },
    accountCreationSuccess: {
      description: 'Account creation was successful.',
      tags: 'resolved',
      type: 'final'
    },
    creatingAccount: {
      description: 'Invoked service that initiates account creation.',
      invoke: {
        src: 'initiateAccountCreation',
        onDone: { target: 'accountCreationSuccess', cond: 'isSuccess' },
        onError: { target: 'accountCreationError', cond: "isAccountCreationError", actions: 'updateErrorMessages' }
      },
      tags: 'invoked'
    },
    exit: {
      description: 'Terminates USSD session.',
      type: 'final'
    },
    firstLanguageSet: {
      description: 'Expecting language selection from first language set.',
      on: {
        TRANSIT: [
          { target: 'creatingAccount', cond: 'isValidLanguageOption', actions: ['saveLanguageOption'] },
          { target: 'secondLanguageSet', cond: 'isOption11' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidLanguageOption' }
        ]
      }
    },
    invalidLanguageOption: {
      description: 'Entered language option is invalid. Raises RETRY event to retry language selection.',
      entry: raise({ type: 'RETRY', feedback: 'invalidLanguageOption' }),
      on: {
        RETRY: 'firstLanguageSet'
      }
    },
    secondLanguageSet: {
      description: 'Expecting language selection from second language set.',
      on: {
        TRANSIT: [
          { target: 'creatingAccount', cond: 'isValidLanguageOption', actions: ['saveLanguageOption'] },
          { target: 'firstLanguageSet', cond: 'isOption22' },
          { target: 'thirdLanguageSet', cond: 'isOption11' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidLanguageOption' }
        ]
      }
    },
    thirdLanguageSet: {
      description: 'Expecting language selection from third language set.',
      on: {
        TRANSIT: [
          { target: 'creatingAccount', cond: 'isValidLanguageOption', actions: ['saveLanguageOption'] },
          { target: 'secondLanguageSet', cond: 'isOption22' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidLanguageOption' }
        ]
      }
    }
  }
},{
  actions: {
    saveLanguageOption,
    updateErrorMessages
  },
  guards: {
    isAccountCreationError,
    isOption00,
    isOption11,
    isOption22,
    isSuccess,
    isValidLanguageOption
  },
  services: {
    initiateAccountCreation
  }
})

function isAccountCreationError(context: BaseContext, event: any) {
  return event.data.code === RegistrationError.ACCOUNT_CREATION_FAILED || event.data.code === ErrorCodes.SYSTEM_ERROR
}

async function initiateAccountCreation(context: BaseContext) {
  const { data: { languages }, resources: { db, graphql, p_redis }, ussd: { phoneNumber } } = context

  if (!languages?.selected){
    throw new MachineError(ContextError.MALFORMED_CONTEXT, 'selected language is missing.')
  }

  let account, graphAccount, graphUser, wallet;
  try {
    wallet = await createWallet()
  } catch (error: any) {
    throw new SystemError(error.message)
  }

  if(!wallet.result) {
    throw new SystemError("Wallet creation failed.")
  }

  try {
    await createTracker(db, {
      address: wallet.result.publicKey,
      task_reference: wallet.result.trackingId,
      task_type: CustodialTaskType.REGISTER
    })
  } catch (error: any) {
    throw new SystemError(error.message)
  }

  try {
    account = await createAccount({
      address: wallet.result.publicKey as Address,
      language: languages.selected,
      phone_number: phoneNumber
    }, db, p_redis)
  } catch (error: any) {
    throw new SystemError(error.message)
  }

  if(!account){
    throw new SystemError("Account creation failed.")
  }

  try {
    graphUser = await createGraphUser(graphql, {
      activated: false,
      interface_identifier: String(account.id),
      interface_type: "USSD",
    })
  } catch (error: any) {
    throw new SystemError(error.message)
  }

  if(!graphUser){
    throw new SystemError("Graph user creation failed.")
  }

  try {
    graphAccount = await createGraphAccount(graphql, {
      account_type: GraphAccountTypes.CUSTODIAL_PERSONAL,
      blockchain_address: wallet.result.publicKey,
      user_identifier: graphUser.id })
  } catch (error: any) {
    throw new SystemError(error.message)
  }

  if(!graphAccount){
    throw new SystemError("Graph account creation failed.")
  }

  try {
    const cache = new Cache<User>(p_redis, phoneNumber)
    await cache.updateJSON({
      graph: {
        account: { id: graphAccount.id },
        user: { id: graphUser.id }
      }
    })
    return { success: true }
  } catch (error: any) {
    throw new MachineError(RegistrationError.ACCOUNT_CREATION_FAILED, error.message)
  }
}

function isValidLanguageOption(context: BaseContext, event: any) {
  const index = parseInt(event.input) - 1;
  return Object.keys(supportedLanguages)[index] !== undefined
}

function saveLanguageOption(context: BaseContext, event: any) {
  const { input } = event
  context.data = {
    ...(context.data || {}),
    languages: {
      selected: getLanguage(input)
    }
  }
  return context
}

export async function registrationTranslations(state: string, translator: any) {
  const languages = await languageOptions()
  switch(state){
    case "firstLanguageSet":
      return await translate(state, translator,{ languages: languages[0] })
    case "secondLanguageSet":
      return await translate(state, translator,{ languages: languages[1] })
    case "thirdLanguageSet":
      return await translate(state, translator,{ languages: languages[2] })
    default:
      return await translate(state, translator)
  }
}

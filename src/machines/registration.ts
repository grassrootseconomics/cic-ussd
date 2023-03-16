import {createMachine, send} from "xstate";
import {
  BaseContext,
  BaseEvent,
  isOption00,
  isOption11,
  isOption22,
  languageOptions,
  updateErrorMessages
} from "@src/machines/utils";
import {Address, supportedLanguages} from "@lib/ussd/utils";
import {createWallet} from "@lib/custodail";
import {createTracker, CustodialTaskType} from "@db/models/custodailTasks";
import {createAccount} from "@db/models/account";
import {createGraphUser} from "@lib/graph/user";
import {createGraphAccount, GraphAccountTypes} from "@lib/graph/account";
import {translate} from "@machines/utils";


export const registrationMachine = createMachine<BaseContext, BaseEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QCcxQJawC7IIZfQHsA7AWVwGMALdYsAOgHcwAbCwgWzAGIAVAJQCCAOQDKASV4BtAAwBdRKAAOhWOgIlFIAB6IALAFYA7PRkBOAMxGDAJkM2ZADj0WANCACeiAGwP6z7ysbMxkARj0XAF9I91QMbDwNMkoaOiZWdi4+ITFJKVCFJBAVNSStXQRDE3MrW3snF3cvBHCbegszTu8DczMbQKiYkDjMHHwiZOpaBmY2Th4BEQlpG0LlVXUJ8v1jU0trO1sGt09EYxl2vQHQg2M9GW7o2LRRxInyKbTZzIWc5akLGtihsykUKlU9rVDg5nCdmv0LPQbBYUTIjHYrEYLI8hiMEuMSB9UgxYGB2MQIAAZXDEKAAV1wMFEYCw2SWeXkWhKm00YMQoRsjm89FCRlCfTMxmcekFTX0Mj0IpcyL0WO6-VuT2GL3xSSJ03opPJVJp9MZYGZrMWuWkBS5IK2fMqkvoPRkCqxRkcRiMYTlCDMoX8nTMPuMPu8jijWrxYz1KQNRpIJtpDKZLLZNqkq3tpUdoAqAqFIrFEqlEVlpwQNgMZlM7vdkZVoScMZ1cfeCbSSYp1NT5stmf+gNzPOI2xaguFovFwXLMsc-scQb0IaMehbByxNjb8Q7hK7DCwNGQKbN6atfw5QO5oIL-NDJgMVyMnQVFkOcMQ-Qu3j-3ixVd3R9VVd1eAlJmJehj3QU8+3PC0M2tf47SKW98x0fkP0VKUahkWoZGCf0YXoVdOmsVV9hlCwwN1TtPiPE8zzTRDL3ZFYbwdXl7xaR9XRfN9lUML9qxbEV-xlcJvAVcxaP3SCDVoAA3XAWHQZjzQAeSUJJuH4ABRAQAE1ZE4vNuMwhA-zaPRpQ3Kw8JEmwBXoLEP2sRxyKsUI5LeA8GPoChUHGWlBAodg6WIVkIBIBhlMIABrBhYz8hS0iCsAQqgMKIqihB4ooCDTNM0c70sjUnwsAV0WRfYjH9AxwnabwzEcQiIgMCwnB3XF21S-V0uCghQvCwhItZMBkGQQhkHoJQWHwAAzGaOHoFKIIGhgMqynKxrygqivkEq0K48cnQq10qpsGqOkxf17kcfwWq9NrJJcYxoiGYhCAgOAtHW+MGNKjCKgAWm8f1QYMegQ1huHOho3q936w90jmLhgYs8EbH9VrXOc+5oXFYnfI21Gew0i9MbOnjHAsR7Qm8G57m6X13RExxoe8MjfGswMbH6UnAagmC4NNFjLWpidGfwpEeacTqDCZiGqwcNo7C6L0m3XbwhfoqDlNU9T4JY7SyvQrHEBAkticasxbMFMx-VCKN6G5zoo0jUNascPX-Kg7bhuy0bxql86usVXxV1FMwBls-16YZ8Vl3pmRbixX2kfA4WDUoXKsAAYSGyAw544JQhXB4Hl9Rmqvuzyntaqr8L-SU-bShg872wuhomAAxXB0BYEuTvMmnysDSvpIAsJAlCBPnGax9BRbVq6aMdvNvoMBtHUUvyojt2NZjuPFyrF2TEZv90VsEDX0+yIgA */
  id: "registration",
  initial: "welcome",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    welcome: {
      on: {
        TRANSIT: [
          { target: "creatingAccount", cond: "isValidLanguageOption", actions: ["saveLanguageOption" ] },
          { target: "secondLanguageSet", cond: "isOption11" },
          { target: "exit", cond: "isOption00" },
          { target: "invalidLanguageOption" }
        ]
      },
      description: "Expecting language selection from first language set."
    },
    secondLanguageSet: {
      on: {
        TRANSIT: [
          { target: "creatingAccount", cond: "isValidLanguageOption", actions: ["saveLanguageOption" ] },
          { target: "welcome", cond: "isOption22" },
          { target: "thirdLanguageSet", cond: "isOption11" },
          { target: "exit", cond: "isOption00" },
          { target: "invalidLanguageOption" }
        ]
      },
      description: "Expecting language selection from second language set."
    },
    thirdLanguageSet: {
      on: {
        TRANSIT: [
          { target: "creatingAccount", cond: "isValidLanguageOption", actions: ["saveLanguageOption" ] },
          { target: "secondLanguageSet", cond: "isOption22" },
          { target: "exit", cond: "isOption00" },
          { target: "invalidLanguageOption" }
        ]
      },
      description: "Expecting language selection from third language set."
    },
    invalidLanguageOption: {
      entry: send({ type: "RETRY", feedback: "invalidLanguageOption" }),
      on: {
        RETRY: "welcome"
      },
      description: "The language option entered is invalid. It should be in the supported languages list."
    },
    creatingAccount: {
      invoke: {
        src: "initiateAccountCreation",
        onDone: { target: "accountCreated" },
        onError: { target: "accountCreationFailed", actions: "updateErrorMessages" }
      },
      description: "Initiates account creation on the custodial service.",
      tags: "invoked"
    },
    accountCreated: {
      type: "final",
      description: "Account creation was successful.",
      tags: "resolved"
    },
    accountCreationFailed: {
      type: "final",
      description: "Account creation failed.",
      tags: "error"
    },
    exit: {
      type: "final",
      description: "The user has exited the registration process."
    }
  } },{
  actions: {
    saveLanguageOption,
    updateErrorMessages
  },
  guards: {
    isValidLanguageOption,
    isOption00,
    isOption11,
    isOption22
  },
  services: {
    initiateAccountCreation
  }
})

async function initiateAccountCreation(context: BaseContext) {
  const { data: { language }, resources: { db, graphql, p_redis }, ussd: { phoneNumber } } = context
  try {
    // create wallet.
    const wallet = await createWallet()

    // create tracker for wallet creation task.
    await createTracker(db, {
      address: wallet.result.publicKey,
      task_reference: wallet.result.trackingId,
      task_type: CustodialTaskType.REGISTER
    })

    // create an account on db.
    const account = await createAccount({
      address: wallet.result.publicKey as Address,
      language: language,
      phone_number: phoneNumber
    }, db, p_redis)

    // create a user on graph.
    const graphUser = await createGraphUser(graphql, {
      activated: false,
      interface_identifier: String(account.id),
      interface_type: "USSD",
    })

    // create a corresponding account on graph.
    await createGraphAccount(graphql, {
      account_type: GraphAccountTypes.CUSTODIAL_PERSONAL,
      blockchain_address: wallet.result.publicKey,
      user_identifier: graphUser.id })

  } catch (error) {
    console.log(`STACK TRACE: ${error.stack} `)
    throw new Error(error)
  }
}

function isValidLanguageOption(context: BaseContext) {
  return Object.keys(supportedLanguages).includes(context.ussd.input)
}

function saveLanguageOption(context: BaseContext) {
  const { input } = context.ussd
  context.data.language = Object.keys(supportedLanguages[input])[0]
  return context
}

export async function registrationTranslations(state: string, translator: any) {
  const languages = await languageOptions()
  switch(state){
    case "welcome":
      return await translate(state, translator,{ languages: languages[0] })
    case "secondLanguageSet":
      return await translate(state, translator,{ languages: languages[1] })
    case "thirdLanguageSet":
      return await translate(state, translator,{ languages: languages[2] })
    default:
      return await translate(state, translator)
  }
}

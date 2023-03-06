import { createMachine, send } from "xstate";
import { BaseContext, BaseEvent } from "@src/machines/utils";
import { supportedLanguages } from "@lib/ussd/utils";
import { createWallet } from "@lib/custodail";
import { createTracker, CustodialTaskType } from "@db/models/custodailTasks";
import { createAccount } from "@db/models/account";
import { createGraphUser } from "@lib/graph/user";
import { createGraphAccount, GraphAccountTypes } from "@lib/graph/account";

export interface RegistrationContext extends BaseContext {
  data: {
    language?: string;
  };
}

type RegistrationEvent =
  BaseEvent

export const registrationMachine = createMachine<RegistrationContext, RegistrationEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QCcxQJawC7IIZfQHsA7AWVwGMALdYsAOgHcwAbCwgWzAGIAVAJQCCAOQDKASV4BtAAwBdRKAAOhWOgIlFIAB6IALAFYA7PRkBOAMxGDAJkM2ZADj0WANCACeiAGwP6z7ysbMxkARj0XAF9I91QMbDwNMkoaOiZWdi4+ITFJKVCFJBAVNSStXQRDE3MrW3snF3cvBHCbegszTu8DczMbQKiYkDjMHHwiZOpaBmY2Th4BEQlpG0LlVXUJ8v1jU0trO1sGt09EYxl2vQHQg2M9GW7o2LRRxInyKbTZzIWc5akLGtihsykUKlU9rVDg5nCdmv0LPQbBYUTIjHYrEYLI8hiMEuMSB9UgxYGB2MQIAAZXDEKAAV1wMFEYCw2SWeXkWhKm00YMQoRsjm89FCRlCfTMxmcekFTX0Mj0IpcyL0WO6-VuT2GL3xSSJ03opPJVJp9MZYGZrMWuWkBS5IK2fMqkvoPRkCqxRkcRiMYTlCDMoX8nTMPuMPu8jijWrxYz1KQNRpIJtpDKZLLZNqkq3tpUdoAqAqFIrFEqlEVlpwQNgMZlM7vdkZVoScMZ1cfeCbSSYp1NT5stmf+gNzPOI2xaguFovFwXLMsc-scQb0IaMehbByxNjb8Q7hK7DCwNGQKbN6atfw5QO5oIL-NDJgMVyMnQVFkOcMQ-Qu3j-3ixVd3R9VVd1eAlJmJehj3QU8+3PC0M2tf47SKW98x0fkP0VKUahkWoZGCf0YXoVdOmsVV9hlCwwN1TtPiPE8zzTRDL3ZFYbwdXl7xaR9XRfN9lUML9qxbEV-xlcJvAVcxaP3SCDVoAA3XAWHQZjzQAeSUJJuH4ABRAQAE1ZE4vNuMwhA-zaPRpQ3Kw8JEmwBXoLEP2sRxyKsUI5LeA8GPoChUHGWlBAodg6WIVkIBIBhlMIABrBhYz8hS0iCsAQqgMKIqihB4ooCDTNM0c70sjUnwsAV0WRfYjH9AxwnabwzEcQiIgMCwnB3XF21S-V0uCghQvCwhItZMBkGQQhkHoJQWHwAAzGaOHoFKIIGhgMqynKxrygqivkEq0K48cnQq10qpsGqOkxf17kcfwWq9NrJJcYxoiGYhCAgOAtHW+MGNKjCKgAWm8f1QYMegQ1huHOho3q936w90jmLhgYs8EbH9VrXOc+5oXFYnfI21Gew0i9MbOnjHAsR7Qm8G57m6X13RExxoe8MjfGswMbH6UnAagmC4NNFjLWpidGfwpEeacTqDCZiGqwcNo7C6L0m3XbwhfoqDlNU9T4JY7SyvQrHEBAkticasxbMFMx-VCKN6G5zoo0jUNascPX-Kg7bhuy0bxql86usVXxV1FMwBls-16YZ8Vl3pmRbixX2kfA4WDUoXKsAAYSGyAw544JQhXB4Hl9Rmqvuzyntaqr8L-SU-bShg872wuhomAAxXB0BYEuTvMmnysDSvpIAsJAlCBPnGax9BRbVq6aMdvNvoMBtHUUvyojt2NZjuPFyrF2TEZv90VsEDX0+yIgA */
  id: "registrationMachine",
  initial: "welcome",
  predictableActionArguments: true,
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
        onError: { target: "accountCreationFailed" }
      },
      description: "Initiates account creation on the custodial service."
    },
    accountCreated: {
      type: "final",
      description: "Account creation was successful."
    },
    accountCreationFailed: {
      type: "final",
      description: "Account creation failed."
    },
    exit: {
      type: "final",
      description: "The user has exited the registration process."
    }
  }
},{

  actions: {
    saveLanguageOption
  },
  guards: {
    isValidLanguageOption,
    isOption00(context: RegistrationContext) {
      return context.ussd.input === "00"
    },
    isOption11(context: RegistrationContext) {
      return context.ussd.input === "11"
    },
    isOption22(context: RegistrationContext) {
      return context.ussd.input === "22"
    }
  },
  services: {
    initiateAccountCreation
  }
})

async function initiateAccountCreation(context: RegistrationContext) {
  try {
    const wallet = await createWallet()
    await createTracker(context.resources.db, {
      address: wallet.result.publicKey,
      task_reference: wallet.result.trackingId,
      task_type: CustodialTaskType.REGISTER
    })
    const account = await createAccount(context.resources.db, {
      address: wallet.result.publicKey,
      language: context.data.language,
      phone_number: context.ussd.phoneNumber
    })
    const graphUser = await createGraphUser(context.resources.graphql, {
      activated: false,
      interface_identifier: String(account.id),
      interface_type: "USSD",
    })
    await createGraphAccount(context.resources.graphql, {
      account_type: GraphAccountTypes.CUSTODIAL_PERSONAL,
      blockchain_address: wallet.result.publicKey,
      user_identifier: graphUser.id })
  } catch (error) {
    throw new Error(error)
  }
}

function isValidLanguageOption(context: RegistrationContext) {
  return Object.keys(supportedLanguages).includes(context.ussd.input)
}

function saveLanguageOption(context: RegistrationContext) {
  const { input } = context.ussd
  context.data.language = Object.keys(supportedLanguages[input])[0]
  return context
}
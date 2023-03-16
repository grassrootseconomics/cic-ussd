import {BaseContext, BaseEvent, isOption9, languageOptions, translate, updateErrorMessages} from "@src/machines/utils";
import {createMachine, send} from "xstate";
import {supportedLanguages} from "@lib/ussd/utils";
import {isBlocked, updateAttempts} from "@machines/auth";
import {MachineError} from "@lib/errors";
import bcrypt from "bcrypt";
import {succeeded} from "@machines/voucher";
import {updateLanguage} from "@db/models/account";

export interface LanguagesContext extends BaseContext {
  data: {
    language?: string;
  };
}

type LanguagesEvent =
  BaseEvent

enum LanguageErrors {
  INVALID_PIN = "INVALID_PIN",
  UNAUTHORIZED = "UNAUTHORIZED",
  CHANGE_FAILED = "CHANGE_FAILED",
}


export const languagesMachine = createMachine<LanguagesContext, LanguagesEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QBsCGA7KBXVNYFlUBjACwEt0wA6WMZMIgFwqgBkNtcwBiAIQEEAwgGkA2gAYAuolAAHAPawyzeehkgAHogCMAJm0BWKgA49BgDQgAnol26j44wGYXrt04DsAXy+W0mHDxCUgpqWnomFnYArm4AFQAlfgA5AGUASTiJaSQQBSUVNVytBD1DEzNLGwQAFnFxKhrtADZWtvbvXxB-TiDickoaOgZmTGjenkSUjKztHLlFZTJVdRKyo1N7KsQnGoBOKj2W9pPmpx8-DkC4YIHqCgA3VGQyCHHr7gSAUUSATWz1PklitijpPAc9uJmltrLY9gcmqcTucuj1rgR+qEqGB0IwwAAnFgABQofCEYikgMWhVWYOMzRMNU8FlhtT2DJqHiOSOanUuMT6IUGOLxhMwJPQ8SSaUyANyQJpoNKuhcJl0mxZ1QMNQZey5x1OfO6Vy4GKF1BFBOJpKmMtm8zy1OWRVAa2cTioKqZHk1iA8xiM2n1PKNaNNtyxqCwjBI8kJAC8oiaYIISBweBBVPd0A95ABrahRmNxsiJsbJsCp9NyhYFZ20hAGcS6Kjif2VVktFv2C7GgU3TGDIuxhNJ-tVzA8An4uNUWRoRgAMzjAFsqMOS2W2BWJzAa466yDXYgmy22xrtgguR4qB5dNykaGK2a7uvoyPS2OJrup-iZ-i5wXZd8TXDdR3Lcc00nUQ5ipQ8XU0E9m1bdsYWqZo9m7e8DROJ9+xfSN303L9rh-bhp1nedUCXVc32LcDt0g6tdAdBV6yVU8UIvVk9jqRpg0fXsw0FV9HmeV4JU+H4En+Sl5SdI9EOVcpuOqLkGTsB9DSE58I0GUh01SLAiCIOBYDJER9zYxS1n0DYO2qIMaioAx3XcNw8ImAj9KgmAjJMsypWmWU5NrYEENslSHJ0cRnIMHwunQeQIDgdRhIHc04PChsAFpmkvPKdPwvTqBXVAKHwHEsCyxVj1KAxtA9bRjB9S9ms89ESqGCJRkYiYavYuruSoIN2t9BAnHVEaeXaFF+S8rqxJeN4KwGmydAapqWvG+8W3i1FdMHC1cStcUKDWiKNpqYwTD2ZlL39IxeS03CioWo66I-Ld3i4H8LobGpdEvM4IQE7SDuKj6lok875Pghs9mMFtAfZbaHo8D1NJwjo3s6j6DMnfzTNgeA4eypU9m1Q59DRzsnD2XHw3x3ywC+P843+in9BGjwxuB3lb2wkNGZEyMTPkLBcV4ZB5CIAsIE5urdDbG9IWhcbIQaYxKbc9wahFjLXzADRlEVpTDEakbaeqUwXISrwgA */
  id: "language",
  initial: "selectingLanguage",
  predictableActionArguments: true,
  states: {
    mainMenu: {
      type: "final",
      description: "User is returned to the main menu."
    },
    selectingLanguage: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "enteringPin", cond: "isValidLanguageOption", actions: "saveLanguageOption" },
          { target: "invalidLanguage" }
        ]
      },
      description: "User is prompted to select their language."
    },
    invalidLanguage: {
      entry: send( { type: "RETRY", feedback: "invalidLanguage" } ),
      on: {
        RETRY: "selectingLanguage"
      },
      description: "User is prompted to select their language again."
    },
    enteringPin: {
      on: {
        BACK: "selectingLanguage",
        TRANSIT: [
          { target: "authorizingLanguageChange", cond: "isNotBlocked" },
          { target: "accountBlocked" }
        ]
      }
    },
    authorizingLanguageChange: {
      invoke: {
        id: "authorizingLanguageChange",
        src: "initiateLanguageChange",
        onDone: { target: "changeSuccess", cond: "succeeded" },
        onError: [
          { target: "invalidPin", cond: "isInvalidPin" },
          { target: "changeError", cond: "isError" },
          { target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      description: "User is prompted to enter their PIN to authorize the language change.",
      tags: "invoked"
    },
    invalidPin: {
      entry: send( { type: "RETRY", feedback: "invalidPin" } ),
      on: {
        RETRY: "enteringPin"
      },
      tags: "error"
    },

    // final states
    changeSuccess: {
      on: {
        BACK: "mainMenu",
        TRANSIT: { target: "exit", cond: "isOption9" }
      },
      description: "Language change is successful.",
      tags: "resolved"
    },
    changeError: {
      type: "final",
      description: "Exits the ussd session.",
      tags: "error"
    },
    accountBlocked: {
      type: "final",
      description: "Exits the ussd session.",
      tags: "error"
    },
    exit: {
      type: "final",
      description: "Exits the ussd session."
    }
  }
}, {
  actions: {
    saveLanguageOption,
    updateErrorMessages
  },
  guards: {
    isBlocked,
    isError,
    isInvalidPin,
    isNotBlocked: (context: BaseContext) => !isBlocked(context),
    isOption9,
    isValidLanguageOption,
    succeeded
  },
  services: {
    initiateLanguageChange
  }
})

async function initiateLanguageChange(context: BaseContext, event: any) {
    const { resources: { db, p_redis }, user: { account: { password, phone_number } } } = context
    const { input } = event

    // check that pin has valid format.
    const isValidPin = /^\d{4}$/.test(input)
    if (!isValidPin) {
      await updateAttempts(context)
      throw new MachineError(LanguageErrors.INVALID_PIN, "PIN is invalid.")
    }

    // check that pin is correct.
    const isAuthorized = await bcrypt.compare(input, password)
    if (!isAuthorized) {
      await updateAttempts(context)
      throw new MachineError(LanguageErrors.UNAUTHORIZED, "PIN is incorrect.")
    }

    // change language in db and redis
    try {
      await updateLanguage(db, phone_number, context.data.language, p_redis)
      return { success: true }
    } catch (error) {
      throw new MachineError(LanguageErrors.CHANGE_FAILED, "Language change failed.")
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

function isInvalidPin(context: BaseContext, event: any) {
  return event.data.code === LanguageErrors.INVALID_PIN || event.data.code === LanguageErrors.UNAUTHORIZED
}

function isError(context: BaseContext, event: any) {
  return event.data.code === LanguageErrors.CHANGE_FAILED
}

export async function languageTranslations(context: BaseContext, state: string, translator: any){
  const { user: { activeVoucher: { balance, symbol } } } = context;
  const languages = await languageOptions()
  switch(state) {
    case "selectingLanguage":
      return await translate(state, translator, {languages: languages[0]})
    case "secondLanguageSet":
      return await translate(state, translator, {languages: languages[1]})
    case "thirdLanguageSet":
      return await translate(state, translator, {languages: languages[2]})
    case "mainMenu":
      return await translate(state, translator, { balance: balance, symbol: symbol });
    default:
      return await translate(state, translator)
  }
}
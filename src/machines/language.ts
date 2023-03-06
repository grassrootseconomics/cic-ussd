import { BaseContext, BaseEvent } from "@src/machines/utils";
import { createMachine, send } from "xstate";

export interface LanguagesContext extends BaseContext {
  data: {
    language?: string;
  };
}

type LanguagesEvent =
  BaseEvent


export const languagesMachine = createMachine<LanguagesContext, LanguagesEvent>({
  id: "languagesMachine",
  initial: "selectingLanguage",
  predictableActionArguments: true,
  states: {
    mainMenu: {
      type: "final",
      description: "User is returned to the main menu."
    },
    selectingLanguage: {
      on: {
        TRANSIT: [
          { target: "authorizingLanguageChange", cond: "isValidLanguage", actions: "saveLanguage" },
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
    authorizingLanguageChange: {
      on: {
        TRANSIT: [
          { target: "changingLanguage", cond: "isAuthorizedLanguageChange" },
          { target: "unauthorizedLanguageChange", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "User is prompted to enter their pin to change their language."
    },
    unauthorizedLanguageChange: {
      entry: send( { type: "RETRY", feedback: "unauthorizedLanguageChange" } ),
      on: {
        RETRY: "selectingLanguage"
      },
      description: "User is prompted to enter their pin again."
    },
    changingLanguage: {
      invoke: {
        src: "initiateLanguageChange",
        onDone: { target: "languageChanged", actions: "updateLanguage" },
        onError: { target: "languageChangeFailed", actions: "updateErrorMessages" }
      },
      description: "Initiates language change request in db."
    },
    languageChanged: {
      type: "final",
      description: "Language change was successful."
    },
    languageChangeFailed: {
      type: "final",
      description: "Language change failed."
    },
    accountBlocked: {
      type: "final",
      description: "Account is blocked."
    },
  }
})

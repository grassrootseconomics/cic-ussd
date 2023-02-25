import { assign, createMachine } from "xstate";
import { UssdContext } from "@utils/context";
import {
  isActivatedAccount,
  isBlockedAccount,
  isNewAccount,
  isPendingCreation
} from "@services/stateMachine/aux/guards/auth";
import {
  isValidLanguageOption, supportedLanguages
} from "@services/stateMachine/aux/guards/languages";
import { initiateAccountCreation } from "@services/stateMachine/aux/services/account";

export type machineEvent =
  |{type: 'TRANSIT'}
  |{type: 'RETRY'}



export const baseMachine = 
/** @xstate-layout N4IgpgJg5mDOIC5QCMCGswFlUGMAWAlgHZgB0EYALmAE4C2xYAkkQZQagDYDEA2gAwBdRKAAOAe1hsC4oiJAAPRACYAzAE5SAVlUBGZVv5HjR1QBoQAT0R7NBgL72LaDNnyNyVWgxItpXPl1hJBAJKXZZeSUENU0dfUMTY3MrRAAOVVIHJxAXLFxCEk9qekY-dgDeZWCxSWlIkOjY7T0DJOSLawRdABZlUnVBoeGhgHZHZ3R89yKKEp9mVgqeXlUa0LqIuUaVDRaE9tNOm1H1Cdypt0KyOe8ypY4VnvWw+u3QJr34tsOUruV+JkRsDBuMcnkrh4wEQSsQoAAFGhgABmtCREAAMqgiFAAK6oGDcAAqACUAIIAOQAykwiQIXpsZO9FIhRgA2fhZdRstLqfgGNKjXm6Y4xdQ9LKjVQ9VSjLTnCEFKEw2hwxEotGQLE4-GE0mUml0oLyV5bKKIQyZUZSnpaZRywW8-hs0XKNnKBWXJVFXA4cS4mEAYSRqC25Q41Ag3AgsjIxAAbuIANZkHAh6hknB+gOUekmxkND6IXR6XQDZS6NLKdTKNRs1TKNKu3SjUj8UaA-Q9YFgyaub1kX3+oPppnh0OQbho8Q0UiiTih5EzuikNNgCeZ7MwvMhU1M83dUvlyvV2uqeuN0V6Tn86Wy+XnIjiCjwEKKmZgfPhfc7BAAWhdVJ-zZT1+w-Yo7l8B4uC-N4Dz6K82QlHpdDZND0Iw+tQOma5SGhWEcXVVEaHRbU8QJT9dwLZlom7CV1HiHp+S0R0+UAro9FbB8+xwjwhxzYN1zDaDI1gs1f10dtW1lbstD6OsGybIDqx6bDISKJEoAIWBKBoUMmSpXEszASBIDEn8i26LQSyyNktC0U4zwvJT-llbQeh5UZux7NSB1ITTtN0-TZAAMVQAhODMqjv0LFkrJst17MchTLyA1RVE5biLjA3C6HCohMGhXFzNi2jeVIHo0hlPkBSFNjRTSMssvfXD+JhAAhThxBwFMIBKmjEEqzRKuq5jWOdUUS00EEfPBL1wLayh4WhCA4UE4LmT3UrBvKkaNDGuqJrS9lfPAvKPwAURImd+vg3aqv22qnXYlQjAGGbhjBRwgA */
createMachine<UssdContext, machineEvent>(
  {
    predictableActionArguments: true,
    id: "baseMachine",
    initial: "determineInitial",
    states: {
      determineInitial: {
        always: [
          {
            target: "enteringPreferredLanguage",
            cond: "isNewAccount",
          },
          {
            target: "mainMenu",
            cond: "isActivatedAccount",
          },
          {
            target: "accountBlocked",
            cond: "isBlockedAccount",
          },
          {
            target: "accountPendingCreation",
            cond: "isPendingCreation"
          },
          {
            target: "machineError"
          }
        ]
      },

      enteringPreferredLanguage: {
        on: {
          TRANSIT: [
            {
              target: "accountCreationInitiated",
              cond: "isValidLanguageOption",
              actions: assign((context: UssdContext ) => {
                let preferredLanguage = supportedLanguages.fallback;
                if (context.actorInput) {
                  preferredLanguage = supportedLanguages[context.actorInput];
                }
                context["data"]["preferredLanguage"] = preferredLanguage;
                return context;
              })
            },
            {
              target: "enteringPreferredLanguage"
            }
          ],
        },
      },

      accountCreationInitiated: {
        invoke: {
          id: "createAccount",
          src: initiateAccountCreation,
          onDone: {
            target: "registrationSucceeded",
            actions: ["clearErrorMessages"],
          },
          onError: {
            target: "registrationFailed",
            actions: ["updateErrorMessage"],
          }
        }
      },

      registrationSucceeded: {
        type: "final"
      },


      registrationFailed: {
        type : "final"
      },


      mainMenu: {
      },

      accountBlocked: {
        type: "final"
      },

      accountPendingCreation: {
        type: "final"
      },

      machineError: {
        type: "final"
      }
    },
  },
  {
    actions: {
      clearErrorMessages: assign((context: UssdContext) => {
        return {
          ...context,
          errorMessages: [],
        };
      }),
      updateErrorMessage: assign((context, event: any) => {
        return {
          ...context,
          errorMessages: [event.data] || ["An unknown error occurred."],
        };
      }),
    },
    guards: {
      isNewAccount,
      isActivatedAccount,
      isBlockedAccount,
      isPendingCreation,
      isValidLanguageOption
    }
  }
);

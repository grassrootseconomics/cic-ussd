import { createMachine, send, StateValue } from "xstate";

interface machineContext {
  account?: any;
  actorInput: string;
  data?: Record<string, string>;
  errorMessages: string[];
}

type machineEvent =
  | { type: "BACK" }
  | { type: "RETRY"; feedback?: string }
  | { type: "TRANSIT" };

const transferMenuStates = {
  id: "transferMenuStates",
  initial: "transferMenu",
  states: {
    transferMenu: {
      entry: send("TRANSIT"),
      on: {
        BACK: {
          target: "#baseMachine.mainMenu",
        },
        TRANSIT: [
          {
            target: "enteringRecipient",
            cond: "isValidRecipient",
            actions: ["saveRecipient"],
          },
          {
            target: "invalidRecipient",
          },
        ],
      },
    },
    enteringRecipient: {
      on: {
        BACK: "#baseMachine.mainMenu",
        TRANSIT: [
          {
            target: "enteringAmount",
            cond: "isValidRecipient",
            actions: ["saveRecipient"],
          },
          {
            target: "invalidRecipient",
          },
        ],
      },
    },
    invalidRecipient: {
      entry: send({ type: "RETRY", feedback: "Invalid recipient entered." }),
      on: {
        BACK: "#baseMachine.mainMenu",
        RETRY: [
          {
            target: "enteringRecipient",
            cond: "isOption1",
          },
          {
            target: "inviteRecipient",
            cond: "isOption2",
          },
        ],
      },
    },
    inviteRecipient: {
      invoke: {
        id: "initiateInvite",
        src: "initiateInvite",
        onDone: {
          target: "#baseMachine.inviteSuccess",
        },
        onError: {
          target: "#baseMachine.inviteFailure",
          actions: ["updateErrorMessages"],
        },
      },
    },
    enteringAmount: {
      on: {
        BACK: "enteringRecipient",
        TRANSIT: [
          {
            target: "confirmingTransfer",
            cond: "isValidAmount",
          },
          {
            target: "invalidAmount",
          },
        ],
      },
    },
    invalidAmount: {
      entry: send({ type: "RETRY", feedback: "Invalid amount entered." }),
      on: {
        BACK: "enteringRecipient",
        RETRY: "enteringAmount",
      },
    },
    confirmingTransfer: {
      id: "confirmingTransfer",
      initial: "confirmingTransfer",
      states: {
        confirmingTransfer: {
          on: {
            TRANSIT: [
              {
                target: 'transfer',
                cond: "isAuthorized",
              },
              {
                target: "retryingPIN",
                cond: "isNotBlocked",
              },
            ],
          },
        },
        retryingPIN: {
          on: {
            TRANSIT: [
              {
                target: 'transfer',
                cond: "isAuthorized",
              },
              {
                target: "#baseMachine.accountBlocked",
              },
            ],
          },
        },
        transfer: {
          invoke: {
            id: "initiateTransfer",
            src: "initiateTransfer",
            onDone: {
              target: "#baseMachine.voucherTransferSuccess",
            },
            onError: {
              target: "#baseMachine.voucherTransferFailure",
              actions: ["updateErrorMessages"],
            },
          },
        },
      },
    },
  },
};

const baseMachine = createMachine<machineContext, machineEvent>(
  {
    id: "baseMachine",
    initial: "mainMenu",
    context: {
      actorInput: "1",
      errorMessages: [],
      data: {
        recipient: "+254706533739",
        amount: "5",
      },
      account: {
        password: "1234",
      },
    },
    states: {
      mainMenu: {
        on: {
          TRANSIT: [
            {
              target: "transferMenu",
              cond: "isOption1",
            },
            {
              target: "voucherMenu",
              cond: "isOption2",
            },
            {
              target: "accountManagementMenu",
              cond: "isOption3",
            },
            {
              target: "helpMenu",
              cond: "isOption4",
            },
          ],
        },
      },
      transferMenu: {
        ...transferMenuStates,
      },
      voucherMenu: {},
      accountManagementMenu: {},
      helpMenu: {},
      accountBlocked: {
        type: "final",
      },
      voucherTransferSuccess: {
        type: "final",
      },
      voucherTransferFailure: {
        type: "final",
      },
      inviteSuccess: {
        type: "final",
      },
      inviteFailure: {
        type: "final",
      },
    },
  },
  {
    guards: {
      isOption0: (context) => {
        const { actorInput } = context;
        return actorInput === "0";
      },
      isOption1: (context) => {
        const { actorInput } = context;
        return actorInput === "1";
      },
      isOption2: (context) => {
        const { actorInput } = context;
        return actorInput === "2";
      },
      isOption3: (context) => {
        const { actorInput } = context;
        return actorInput === "3";
      },
      isOption4: (context) => {
        const { actorInput } = context;
        return actorInput === "4";
      },

      // transfer guards
      isValidRecipient: (context) => {
        const recipient = context.data?.recipient;
        return recipient.startsWith("+254");
      },
      isValidAmount: (context) => {
        return parseInt(context.data.amount) > 0;
      },
    },
    actions: {
      updateErrorMessages: (context, event: any) => {
        return {
          ...context,
          errorMessages: context.errorMessages.concat(
            event.data ?? "Unknown machine error"
          ),
        };
      },
      saveVoucherRecipient: (context, event) => {
        const { actorInput } = context;
        return {
          ...context,
          data: { ...context.data, voucherRecipient: actorInput },
        };
      },
    },
    services: {
      initiateTransfer: async (context, event) => {},
    },
  }
);

import { createMachine, send } from "xstate";

const randomChoice = Math.random() < 0.5

interface machineContext {
  account?: any
  actorInput: string
  data: Record<string, string>
  errorMessages: string[]
}

type machineEvent =
  |{ type: 'RETRY' , feedback?: string }
  |{ type: 'TRANSIT' }

const signUpMachine =
createMachine<machineContext, machineEvent>(
  {
    id: 'signupMachine',
    initial: 'enteringPreferredLanguage',
    states: {
      enteringPreferredLanguage: {
        on: {
          TRANSIT: [
            {
              target: 'enteringPIN',
              cond: 'isValidLanguage'
            },
            {
              target: 'invalidLanguageOption',
            }
          ]
        }
      },
      invalidLanguageOption: {
        entry: send({ type: 'RETRY', feedback: 'Invalid language option' }),
        on: {
          RETRY: 'enteringPreferredLanguage'
        }
      },
      enteringPIN: {
        on: {
          TRANSIT: [
            {
              target: 'confirmingPIN',
              cond: 'isValidPIN'
            },
            {
              target: 'invalidPIN',
            }
          ]
        }
      },
      invalidPIN: {
        entry: send({ type: 'RETRY', feedback: 'Invalid PIN' }),
        on: {
          RETRY: 'enteringPIN'
        }
      },
      confirmingPIN: {
        on: {
          TRANSIT: [
            {
              target: 'initiateAccountCreation',
              cond: 'pinsMatch'
            },
            {
              target: 'pinsMismatch',
            }
          ]
        }
      },
      pinsMismatch: {
        entry: send({ type: 'RETRY', feedback: 'PINs do not match' }),
        on: {
          RETRY: 'enteringPIN'
        }
      },
      initiateAccountCreation: {
        invoke: {
          id: 'createAccount',
          src: 'initiateAccountCreation',
          onDone: {
            target: 'accountCreationSuccess',
          },
          onError: {
            target: 'accountCreationError',
            actions: ['updateErrorMessages']
          }
        }
      },
      accountCreationSuccess: {
        type: 'final'
      },
      accountCreationError: {
        type: 'final'
      }
    },
  },
  {
    guards: {
      isValidLanguage: (context) => {
        return randomChoice
      },
      isValidPIN: (context) => {
        return randomChoice
      },
      pinsMatch: (context) => {
        return randomChoice
      }
    },
    actions: {},
    services: {
      initiateAccountCreation: async (context, event) => {
      }
    }
  })

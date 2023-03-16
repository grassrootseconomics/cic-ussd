import {
  BaseContext,
  BaseEvent,
  isOption1,
  isOption2,
  isOption3,
  isOption4,
  isOption5,
  translate
} from "@src/machines/utils";
import {createMachine} from "xstate";
import {ActiveVoucher} from "@lib/ussd/voucher";

export const mainMenuMachine = createMachine<BaseContext, BaseEvent>({
  id: "main",
  initial: "mainMenu",
  states: {
    mainMenu: {
        always: [
            { target: "transfer", cond: "isOption1" },
            { target: "voucher", cond: "isOption2" },
            { target: "accountManagement", cond: "isOption3" },
            { target: "help", cond: "isOption4" },
        ]
    },
    transfer: {
        type: "final",
        description: "Transitions user to transfer machine"
    },
    voucher: {
        type: "final",
        description: "Transitions user to voucher machine"
    },
    accountManagement: {
        type: "final",
        description: "Transitions user to profile machine"
    },
    help: {
        type: "final",

    }
  }
}, {
    guards: {
        isOption1,
        isOption2,
        isOption3,
        isOption4
    }
})

export async function mainMenuTranslations(voucher: ActiveVoucher, state: string, translator: any) {
  const { balance, symbol } = voucher
  if (state === "mainMenu"){
    return await translate(state, translator, { balance: balance, symbol: symbol })
  } else {
    return await translate(state, translator)
  }
}

export const settingsMachine = createMachine<BaseContext, BaseEvent>({
    id: "settings",
    initial: "settingsMenu",
    states: {
        mainMenu: {
          type: "final",
            description: "Transitions user to main menu machine"
        },
        settingsMenu: {
            on: {
                BACK: "mainMenu",
                TRANSIT:[
                    { target: "profile", cond: "isOption1" },
                    { target: "language", cond: "isOption2" },
                    { target: "balances", cond: "isOption3" },
                    { target: "statement", cond: "isOption4" },
                    { target: "pinManagement", cond: "isOption5" },
                ]
            },
            description: "Displays account management menu."
        },
        profile: {
            type: "final",
            description: "Transitions user to profile machine"
        },
        language: {
            type: "final",
            description: "Transitions user to language machine"
        },
        balances: {
            type: "final",
            description: "Transitions user to balances machine"
        },
        statement: {
            type: "final",
            description: "Transitions user to statement machine"
        },
      pinManagement: {
        type: "final",
        description: "Transitions user to pin management machine"
      }
    }
},{
    guards: {
        isOption1,
        isOption2,
        isOption3,
        isOption4,
        isOption5
    }
})

export async function settingsTranslations(context: any, state: string, translator: any) {
  const { balance, symbol } = context.user.activeVoucher
  if (state === "mainMenu"){
    return await translate(state, translator, { balance: balance, symbol: symbol })
  } else {
    return await translate(state, translator)
  }
}


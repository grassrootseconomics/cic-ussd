import {
  BaseContext,
  BaseEvent,
  isOption1,
  isOption2,
  isOption3,
  isOption4,
  isOption5,
  MachineId,
  translate
} from '@src/machines/utils';
import { createMachine } from 'xstate';

export const mainMenuMachine = createMachine<BaseContext, BaseEvent>({
  id: MachineId.MAIN,
  initial: "mainMenu",
  states: {
    help: {
      type: 'final'
    },
    mainMenu: {
      on: {
        TRANSIT: [
          { target: 'transfer', cond: 'isOption1' },
          { target: 'voucher', cond: 'isOption2' },
          { target: 'settings', cond: 'isOption3' },
          { target: 'help', cond: 'isOption4' }
        ]
      }
    },
    settings: {
      description: 'Transitions to profile machine',
      type: 'final'
    },
    transfer: {
      description: 'Transitions to transfer machine',
      type: 'final'
    },
    voucher: {
      description: 'Transitions to voucher machine',
      type: 'final'
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

export async function mainMenuTranslations(context: BaseContext, state: string, translator: any) {
  const { user: { vouchers: { active: { balance, symbol } } } } = context
  if (state === "mainMenu"){
    return await translate(state, translator, { balance: balance, symbol: symbol })
  } else {
    return await translate(state, translator)
  }
}

export const settingsMachine = createMachine<BaseContext, BaseEvent>({
    id: MachineId.SETTINGS,
    initial: "settingsMenu",
    states: {
      balances: {
        description: 'Transitions to balances machine',
        type: 'final'
      },
      language: {
        description: 'Transitions to language machine',
        type: 'final'
      },
      mainMenu: {
        description: 'Transitions to main menu machine',
        type: 'final'
      },
      pinManagement: {
        description: 'Transitions to pin management machine',
        type: 'final'
      },
      profile: {
        description: 'Transitions to profile machine',
        type: 'final'
      },
      settingsMenu: {
        description: 'Displays account management menu.',
        on: {
          BACK: 'mainMenu',
          TRANSIT: [
            { target: 'profile', cond: 'isOption1' },
            { target: 'language', cond: 'isOption2' },
            { target: 'balances', cond: 'isOption3' },
            { target: 'statement', cond: 'isOption4' },
            { target: 'pinManagement', cond: 'isOption5' }
          ]
        }
      },
      statement: {
        description: 'Transitions to statement machine',
        type: 'final'
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

export async function settingsTranslations(context: BaseContext, state: string, translator: any) {
  const { user: { vouchers: { active: { balance, symbol } } } } = context
  if (state === "mainMenu"){
    return await translate(state, translator, { balance: balance, symbol: symbol })
  } else {
    return await translate(state, translator)
  }
}


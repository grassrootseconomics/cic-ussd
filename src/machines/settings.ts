import { createMachine } from 'xstate';
import {
  intermediateMachineTranslations,
  isOption1,
  isOption2,
  isOption3,
  isOption4,
  isOption5,
  isOption6,
  MachineEvent,
  MachineId,
  MachineInterface,
  UserContext
} from '@machines/utils';

const stateMachine = createMachine<UserContext, MachineEvent>({
    id: MachineId.SETTINGS,
    initial: "settingsMenu",
    states: {
      balances: {
        description: 'Transitions to balances machine',
        type: 'final'
      },
      displayAddress: {
          description: 'Displays the address of the current user.',
          on: {
            BACK: 'settingsMenu'
          }
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
            { target: 'pinManagement', cond: 'isOption5' },
            { target: 'displayAddress', cond: 'isOption6'}
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
        isOption5,
        isOption6
    }
})

export const settingsMachine: MachineInterface = {
  stateMachine,
  translate: intermediateMachineTranslations
}
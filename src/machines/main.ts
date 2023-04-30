import {
  intermediateMachineTranslations,
  isOption1,
  isOption2,
  isOption3,
  isOption4,
  MachineEvent,
  MachineId,
  MachineInterface,
  UserContext
} from '@machines/utils';
import { createMachine } from 'xstate';

const stateMachine = createMachine<UserContext, MachineEvent>({
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

export const mainMachine: MachineInterface = {
  stateMachine,
  translate: intermediateMachineTranslations
}
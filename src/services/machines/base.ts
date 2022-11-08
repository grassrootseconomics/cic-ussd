import { createUpdater } from '@xstate/immer';
import { createMachine } from 'xstate';

import { UssdContext } from '../../helpers/context';
import {
  baseMachineEvent,
  updateActorInputEvent
} from '../../types/machines';

import {
  isOptionFourSelected,
  isOptionOneSelected,
  isOptionThreeSelected,
  isOptionTwoSelected
} from './guards/menuOptions';

/* Creating an updater that will update the actor input. */
export const actorInputUpdater = createUpdater<UssdContext, updateActorInputEvent>(
  'UPDATE_ACTOR_INPUT', (machineContext, { input }) => {
  machineContext.actorInput = input;
})

/* Creating a state machine. */
export const baseMachine = createMachine(
  {
    schema: {
    context: {} as UssdContext,
    events: {} as baseMachineEvent
  },
    predictableActionArguments: true,
    id: 'base',
    initial: 'start',
    states: {
      start: {
        on: {
          [actorInputUpdater.type]: { actions: actorInputUpdater.action },
          NEXT: [
            { target: 'transaction_amount', cond: 'isOptionOneSelected' },
            { target: 'vouchers', cond: 'isOptionTwoSelected' },
            { target: 'settings', cond: 'isOptionThreeSelected' },
            { target: 'help', cond: 'isOptionFourSelected' },
          ]
        }
      },
      transaction_amount: {},
      vouchers: {},
      settings: {},
      help: {},
    }
    },
  {
    guards: {
      isOptionOneSelected,
      isOptionTwoSelected,
      isOptionThreeSelected,
      isOptionFourSelected
    }
  })

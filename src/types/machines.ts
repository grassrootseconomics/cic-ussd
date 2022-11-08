import { ImmerUpdateEvent } from '@xstate/immer';


export type  updateActorInputEvent = ImmerUpdateEvent<'UPDATE_ACTOR_INPUT', string>

export type baseMachineEvent =
  | updateActorInputEvent
  | { type: 'NEXT' }

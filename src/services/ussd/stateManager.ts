import { interpret } from 'xstate';

import { UssdContext } from '../../helpers/context';
import {
  actorInputUpdater,
  baseMachine
} from '../machines/base';

export class MachineService {
  context: UssdContext
  service

  constructor(context: UssdContext) {
    this.context = context;
    const machine = baseMachine.withContext(this.context);
    this.service = interpret(machine).onTransition(
      (state) => {
        console.log('state', state);
      }
    ).start()
  }

  async handleUssdRequest() {
    this.service.send(actorInputUpdater.update(this.context.actorInput));
    this.service.send('NEXT');
    return this.service.state.value.toString();
  }
}


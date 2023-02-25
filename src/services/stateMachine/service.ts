import { UssdContext } from "@utils/context";
import Redis from "ioredis";
import { getUssdSessionById, SessionHistory, UssdSession } from "@utils/ussdSession";
import { interpret, StateValue } from "xstate";
import { baseMachine } from "@services/stateMachine/machine";
import { PoolClient } from "pg";
import L from "@lib/i18n/i18n-node";
import { supportedLanguages } from "@services/stateMachine/aux/guards/languages";


export async function processRequest(db: PoolClient, redis: Redis, ussdContext: UssdContext) {
  let machineService;

  // check if an active session exists
  const session = await getUssdSessionById(redis, ussdContext.sessionId) as UssdSession;

  if (session === null) {

    // initialize state machine from first state
    machineService = interpret(baseMachine.withContext(ussdContext)).start();

    // get machine state
    const machineState = machineService.state.value;

    // build history
    const history = {
      responses: [machineState]
    }

    // create a new session
    await new UssdSession(redis, {
      actorInput: ussdContext.actorInput,
      id : ussdContext.sessionId,
      machineState: machineState,
      phoneNumber: ussdContext.phoneNumber,
      serviceCode: ussdContext.serviceCode,
      history: history,
    }).create();

    return buildResponse(machineState, ussdContext)

  } else {
    // update ussd context with resumed session data
    ussdContext.data = session.data || {};

    // update ussd context with ussd session
    ussdContext.session = session;

    // initialize state machine from last state
    machineService = interpret(baseMachine.withContext(ussdContext)).start(session.machineState);

    // check whether a state transition is possible
    if (machineService.state.can({ type: 'TRANSIT' })){

      try {
        //  attempt to execute state transition
        machineService.send({ type: 'TRANSIT' });

        // get machine state
        const machineState = machineService.state.value;

        // build session update
        const update = await buildSessionUpdate(machineService.state.context.data, machineState, session, ussdContext);

        // the machine state is used to render the response, hence it constitutes the first session update
        await updateSession(session, update);

        // it may be the case that an async process that results in a state transition gets resolved
        // check whether the machine has hit onDone or onError and update session accordingly
        machineService.onDone(async () => {
          const finalState = machineService.state.value;
          const history = await updateHistory(session.history, { responses: [finalState] });
          await updateSession(session, { history: history, machineState: finalState, version: session.version + 2 });
          console.debug('Machine has reached final state. Stopping machine service.')
          machineService.stop();
        })

        console.log(`USSD CONTEXT PREFERRED LANGUAGE: ${ussdContext.data?.preferredLanguage}`)
        console.log(`USSD CONTEXT ACCOUNT PREFERRED LANGUAGE: ${ussdContext.account?.preferred_language}`)

        return buildResponse(machineState, ussdContext)

      } catch (error) {
        // if state transition fails, log error and return to current state
        // TODO:[Philip] - handle state transition errors
        const expectedNextState = machineService.nextState('TRANSIT').value
        console.error(`Error: ${error} while attempting to transition from state ${session.machineState} to ${expectedNextState} for session ${ussdContext.sessionId}.`);
      }
    } else {
      // if state transition is not possible, return current state
      // TODO:[Philip] - handle non-resumable states
      console.log(`USSD CONTEXT PREFERRED LANGUAGE: ${ussdContext.data?.preferredLanguage}`)
      console.log(`USSD CONTEXT ACCOUNT PREFERRED LANGUAGE: ${ussdContext.account?.preferred_language}`)
      return await buildResponse(machineService.state.value, ussdContext)
    }
  }
}

async function buildSessionUpdate(machineData: Record<string, string>, machineState: StateValue, session: UssdSession, ussdContext: UssdContext) {

  let updates : Partial<UssdSession> = {
    actorInput: ussdContext.actorInput,
  }

  // get updated session history
  const history = await updateHistory(session.history, { responses: [machineState] });
  updates = { ...updates, history: history };

  // check if session data and data from context are different and update accordingly
  let sessionData = session.data || {};
  if (JSON.stringify(sessionData) !== JSON.stringify(machineData)) {
    const data = await updateData(sessionData, machineData);
    updates = { ...updates, data: data };
  }

  // update version
  return { ...updates, version: session.version + 1 };

}

async function updateSession(ussdSession: UssdSession, update: Partial<UssdSession>) {
  await ussdSession.update(update);
}

async function updateHistory(history: SessionHistory, update: Partial<SessionHistory>) {
  history.responses.push(...update.responses);
  return history;
}

async function updateData(data: Record<string, string>, update: Record<string, string>) {
  Object.assign(data, update);
  return data;
}

async function buildResponse(machineState:StateValue, ussdContext: UssdContext) {
  console.log(`USSD CONTEXT PREFERRED LANGUAGE: ${ussdContext.data?.preferredLanguage}`)
  console.log(`USSD CONTEXT ACCOUNT PREFERRED LANGUAGE: ${ussdContext.account?.preferredLanguage}`)
  const preferredLanguage = ussdContext.data?.preferredLanguage || ussdContext.account?.preferred_language || supportedLanguages.fallback;
  return L[preferredLanguage][machineState]();
}
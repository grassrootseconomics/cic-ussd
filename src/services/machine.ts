import { BaseContext, MachineId, translate, User } from '@machines/utils';
import { transferMachine, transferTranslations } from '@machines/transfer';
import { voucherMachine, voucherTranslations } from '@machines/voucher';
import { mainMenuMachine, mainMenuTranslations, settingsMachine, settingsTranslations } from '@machines/intermediate';
import { profileMachine, profileTranslations } from '@machines/profile';
import { languagesMachine, languagesTranslations } from '@machines/languages';
import { balancesMachine, balancesTranslations } from '@machines/balances';
import { statementMachine, statementTranslations } from '@machines/statement';
import { pinManagementMachine, pinsTranslations } from '@machines/pins';
import { AccountStatus } from '@db/models/account';
import { authMachine, authTranslations, hashValue } from '@machines/auth';
import { registrationMachine, registrationTranslations } from '@machines/registration';
import { supportedLanguages } from '@lib/ussd/utils';
import { createSession, getSessionById, updateSession } from '@lib/ussd/session';
import { interpret, Interpreter, StateValue } from 'xstate';
import L from '@src/i18n/i18n-node';
import { waitFor } from 'xstate/lib/waitFor';
import { socialRecoveryMachine, socialRecoveryTranslations } from '@machines/socialRecovery';

const machines = {
  balances: balancesMachine,
  languages: languagesMachine,
  pins: pinManagementMachine,
  profile: profileMachine,
  statement: statementMachine,
  transfer: transferMachine,
  socialRecovery: socialRecoveryMachine,
  settings: settingsMachine,
  voucher: voucherMachine
};


export async function machineService(context: BaseContext) {
  const { resources: { e_redis }, user, ussd: { input, requestId } } = context

  const session = await getSessionById(e_redis, requestId)
  let machine
  if (session) {
    context.data = session.data
    context.session = session
    const { machineId, state } = session
    machine = await resolveMachine(user, input, machineId, state)
  } else {
    machine = await resolveMachine(user, input)
  }

  // check for machine jumps if the last machine id is present and start in the next machine's initial state
  const service = (session && session.machineId === machine.id)
  ?interpret(machine.withContext(context)).start(session.state)
  :interpret(machine.withContext(context)).start()

  // if a machine jump is detected, update the session and return the response
  let updatedContext, machineId, nextState;
  if (session && session.machineId !== machine.id) {
    await updateSession(context, machine.id, service.getSnapshot().value)
    updatedContext = context
    machineId = machine.id
    nextState = service.getSnapshot().value.toString()
  } else{
    [ updatedContext, machineId, nextState ] = session
    ? await transition(input, service)
    : await newSession(service)
  }

  return await response(updatedContext, machineId, nextState)

}

async function newSession(service: Interpreter<any, any, any, any>): Promise<[BaseContext, string, string]> {
  const { context, machine: { id }, value } = service.getSnapshot()
  const { resources: { e_redis } } = context

  await createSession(context, id, e_redis, value)
  return [context, id, value.toString()]
}

async function transition(input: string, service: Interpreter<any, any, any, any>): Promise<[BaseContext, string, string]> {
  const snapshot = service.getSnapshot();
  const { context, machine: { id }, value: currentValue } = snapshot;

  // check if current state can transition to the next state
  if (!snapshot.can({ type: "TRANSIT", input })) {
    return [context, id, currentValue.toString()];
  }

  // check if input needs to be encrypted
  if (snapshot.hasTag("encryptInput")) {
    context.ussd.input = await hashValue(input);
  }

  // attempt to transition to the next state
  service.send({ type: "TRANSIT", input });

  // wait for the invoked service to finish, if applicable
  let state = service.getSnapshot().value;
  if (service.getSnapshot().hasTag("invoked")) {
    const resolvedState = await waitFor(service, (state) => state.hasTag("resolved") || state.hasTag("error"));
    state = resolvedState.value;
  }

  // update the session with the new state
  await updateSession(context, id, state.toString());
  return [context, id, state.toString()];
}


async function resolveMachine(user: User | undefined, input?: string, machineId?: string, state?: StateValue) {

  if (!user) {
    return registrationMachine;
  }
  const { account } = user
  if (account.status === AccountStatus.PENDING || account.status === AccountStatus.BLOCKED) {
    return authMachine;
  }

  if (account.status === AccountStatus.ACTIVE) {
    return await activeMachine(input, machineId, state)
  }
}

async function activeMachine(input?: string, id?: string, state?: StateValue){
  if (state === undefined || state === "mainMenu") {
    return await mainMenu(input)
  } else if (state === "settingsMenu") {
    return await settingsMenu(input)
  } else if (state === "pinManagementMenu") {
    return await pinManagementMenu(input)
  } else {
    return machines[id]
  }

}

async function mainMenu(input){
  const menu = {
    "1": transferMachine,
    "2": voucherMachine,
    "3": settingsMachine
  }
  return menu[input] || mainMenuMachine
}

async function settingsMenu(input){
  const menu = {
    "1": profileMachine,
    "2": languagesMachine,
    "3": balancesMachine,
    "4": statementMachine,
    "5": pinManagementMachine
  }
  return menu[input] || profileMachine
}

async function pinManagementMenu(input){
  const menu = {
    "3": socialRecoveryMachine
  }
  return menu[input] || pinManagementMachine
}

async function response(context: BaseContext, machineId: string, state: string) {
  const { data, user } = context
  let language
  if (state === "changeSuccess" || state === "accountCreationSuccess") {
    language = data?.languages.selected
  } else {
    language = user?.account?.language  || Object.values(supportedLanguages.fallback)[0]
  }
  const translator = L[language][machineId]
  switch (machineId) {
    case MachineId.REGISTRATION:
        return await registrationTranslations(state, translator)
    case MachineId.AUTH:
      return await authTranslations(context, state, translator)
    case MachineId.MAIN:
      return await mainMenuTranslations(context, state, translator)
    case MachineId.TRANSFER:
      return await transferTranslations(context, state, translator)
    case MachineId.VOUCHER:
      return await voucherTranslations(context, state, translator)
    case MachineId.SETTINGS:
      return await settingsTranslations(context, state, translator)
    case MachineId.PROFILE:
      return await profileTranslations(context, state, translator)
    case MachineId.LANGUAGES:
      return await languagesTranslations(context, state, translator)
    case MachineId.BALANCES:
      return await balancesTranslations(context, state, translator)
    case MachineId.STATEMENT:
      return await statementTranslations(context, state, translator)
    case MachineId.PINS:
      return await pinsTranslations(context, state, translator)
    case MachineId.SOCIAL_RECOVERY:
      return await socialRecoveryTranslations(context, state, translator)
    default:
        return await translate(state, translator)
  }
}
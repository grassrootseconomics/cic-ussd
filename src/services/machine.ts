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
import { createSession, getSessionById, updateSession } from '@lib/ussd/session';
import { interpret, Interpreter, StateValue } from 'xstate';
import L from '@i18n/i18n-node';
import { waitFor } from 'xstate/lib/waitFor';
import { socialRecoveryMachine, socialRecoveryTranslations } from '@machines/socialRecovery';
import { Locales } from '@i18n/i18n-types';
import { fallbackLanguage } from '@i18n/translators';

const machines: menu = {
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
  const { context, value } = service.getSnapshot()
  const { resources: { e_redis } } = context

  const id = service.getSnapshot().machine?.id
  if(!id) {
    throw new Error("Machine ID not found")
  }

  await createSession(context, id, e_redis, value)
  return [context, id, value.toString()]
}

function resolveMachineJumps(state: StateValue, id: string) {
  if (state === "mainMenu" && id !== "main"){
    // override the machine id to main
    return "main"
  }

  if (state === "settingsMenu" && id !== "settings"){
    // override the machine id to settings
    return "settings"
  }

  if (state === "pinManagementMenu" && id !== "pins"){
    // override the machine id to pins
    return "pins"
  }
}

async function transition(input: string, service: Interpreter<any, any, any, any>): Promise<[BaseContext, string, string]> {
  let snapshot = service.getSnapshot();
  const { context, value: currentValue } = snapshot;

  let id = snapshot.machine?.id
  if(!id) {
    throw new Error("Machine ID not found")
  }

  // check if current state can transition to the next state or go back
  if (!snapshot.can({ type: "TRANSIT", input }) && !snapshot.can("BACK")) {
    return [context, id, currentValue.toString()];
  }

  // check if input needs to be encrypted
  if (snapshot.hasTag("encryptInput")) {
    context.ussd.input = await hashValue(input);
  }

  // attempt to transition to the next state
  if (input === "0") {
    service.send("BACK");
  }
  else {
    service.send({ type: "TRANSIT", input });
  }

  // wait for the invoked service to finish, if applicable
  snapshot = service.getSnapshot();
  let state = snapshot.value;
  if (snapshot.hasTag("invoked")) {
    const resolvedState = await waitFor(service, state => {
      return state.hasTag('resolved') || state.hasTag('error');
    })
    state = resolvedState.value;
  }

  // update the session with the new state
  id = resolveMachineJumps(state, id) || id

  await updateSession(context, id, state.toString());
  return [context, id, state.toString()];
}


async function resolveMachine(user: User | undefined, input: string, machineId?: string, state?: StateValue) {

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

type menu = {
  [key: string]: any
}

async function activeMachine(input: string, id?: string, state?: StateValue){
  if (state === undefined || state === "mainMenu") return await mainMenu(input)
  if (state === "settingsMenu") return await settingsMenu(input)
  if (state === "pinManagementMenu") return await pinManagementMenu(input)
  if(!id) return mainMenuMachine
  return machines[id]
}

async function mainMenu(input: string){
  const menu: menu = {
    "1": transferMachine,
    "2": voucherMachine,
    "3": settingsMachine
  }
  return menu[input] || mainMenuMachine
}

async function settingsMenu(input: string){
  const menu: menu = {
    "1": profileMachine,
    "2": languagesMachine,
    "3": balancesMachine,
    "4": statementMachine,
    "5": pinManagementMachine
  }
  return menu[input] || settingsMachine
}

async function pinManagementMenu(input: string){
  const menu: menu = {
    "3": socialRecoveryMachine
  }
  return menu[input] || pinManagementMachine
}

async function response(context: BaseContext, machineId: string, state: string) {
  const { data, user } = context
  let language: Locales
  if (state === "changeSuccess" || state === "accountCreationSuccess" || state === "accountCreationError") {
    language = data?.languages?.selected || fallbackLanguage()
  } else {
    language = user?.account?.language || fallbackLanguage()
  }
  const translator = L[language][machineId as keyof typeof L[typeof language]]
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
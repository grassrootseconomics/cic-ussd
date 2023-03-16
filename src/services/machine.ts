import {BaseContext, translate} from "@machines/utils";
import {transferMachine, transferTranslations} from "@machines/transfer";
import {voucherMachine, voucherTranslations} from "@machines/voucher";
import {mainMenuMachine, mainMenuTranslations, settingsMachine, settingsTranslations} from "@machines/intermediate";
import {profileMachine, profileTranslations} from "@machines/profile";
import {languagesMachine, languageTranslations} from "@machines/language";
import {balancesMachine, balancesTranslations} from "@machines/balances";
import {statementMachine, statementTranslations} from "@machines/statement";
import {pinManagementMachine, pinTranslations} from "@machines/pin";
import {Account, AccountStatus} from "@db/models/account";
import {authMachine, authTranslations} from "@machines/auth";
import {registrationMachine, registrationTranslations} from "@machines/registration";
import {supportedLanguages} from "@lib/ussd/utils";
import {createSession, getSessionById, updateSession} from "@lib/ussd/session";
import {interpret, Interpreter, StateValue} from "xstate";
import L from "@src/i18n/i18n-node";
import {waitFor} from "xstate/lib/waitFor";
import {socialRecoveryMachine} from "@machines/socialRecovery";

const machines = {
  balances: balancesMachine,
  language: languagesMachine,
  pin: pinManagementMachine,
  profile: profileMachine,
  statement: statementMachine,
  transfer: transferMachine,
  settings: settingsMachine,
  voucher: voucherMachine
};


export async function machineService(context: BaseContext) {
  const { resources: { e_redis }, user: { account }, ussd: { input, requestId } } = context

  const session = await getSessionById(e_redis, requestId)
  let machine
  if (session) {
    context.data = session.data || {}
    context.session = session
    const { machineId, state } = session
    machine = await resolveMachine(account, input, machineId, state)
  } else {
    machine = await resolveMachine(account, input)
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

async function newSession(service: Interpreter<BaseContext, any, any, any>): Promise<[BaseContext, string, string]> {
  const { context, machine: { id }, value } = service.getSnapshot()
  const { resources: { e_redis } } = context

  await createSession(context, id, e_redis, value)
  return [context, id, value.toString()]
}

async function transition(input: string, service: Interpreter<BaseContext, any, any, any>): Promise<[BaseContext, string, string]> {

  // check if current state can transition to the next state
  if (!service.getSnapshot().can({ type: "TRANSIT", input: input })){
    const { context, machine: { id }, value } = service.getSnapshot()
    return [context, id, value.toString()]
  }

  // attempt to transition to the next state
  service.send({ type: "TRANSIT", input: input })

  // get a snapshot of the current state
  let snapshot = service.getSnapshot()

  // get current state value
  let state = snapshot.value.toString()

  // check if the resultant state is an invoked service
  if (snapshot.hasTag("invoked")) {

    // wait for the invoked service to finish
    const resolvedState = await waitFor(service, (state) => {
      return state.hasTag("resolved") || state.hasTag("error") || state.hasTag("done")
    });

    // get state value from the resolved state
    state = resolvedState.value.toString()
  }

  // parse updated context, machine id and next state
  const { context, machine: { id } } = snapshot

  // update the session with the new state
  await updateSession(context, id, state)
  return [context, id, state]
}

async function resolveMachine(account: Account | null, input?: string, machineId?: string, state?: StateValue) {

  if (!account) {
    return registrationMachine;
  }

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

async function response(context: any, machineId: string, state: string) {
  const { data, user } = context
  let language
  if (state === "changeSuccess"){
    language = data?.language
  } else {
    language = user?.account?.language  || Object.values(supportedLanguages.fallback)[0]
  }
  const translator = L[language][machineId]
  switch (machineId) {
    case "registration":
        return await registrationTranslations(state, translator)
    case "auth":
      return await authTranslations(user.activeVoucher, state, translator)
    case "main":
      return await mainMenuTranslations(user.activeVoucher, state, translator)
    case "transfer":
      return await transferTranslations(context, state, translator)
    case "voucher":
      return await voucherTranslations(context, state, translator)
    case "settings":
      return await settingsTranslations(context, state, translator)
    case "profile":
      return await profileTranslations(context, state, translator)
    case "language":
      return await languageTranslations(context, state, translator)
    case "balances":
      return await balancesTranslations(context, state, translator)
    case "statement":
      return await statementTranslations(context, state, translator)
    case "pin":
      return await pinTranslations(context, state, translator)
    default:
        return await translate(state, translator)
  }
}
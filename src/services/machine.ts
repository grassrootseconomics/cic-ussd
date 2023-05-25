import { SessionInterface, SessionType } from '@db/models/session';
import { RegistrationContext, registrationMachine } from '@machines/registration';
import { AccountStatus } from '@db/models/account';
import { AuthContext, authMachine, hashValue } from '@machines/auth';
import { mainMachine } from '@machines/main';
import { SessionService } from '@services/session';
import { interpret, Interpreter, StateValue } from 'xstate';
import { fallbackLanguage, languageOptions, tFeedback } from '@i18n/translators';
import { BalancesContext, balancesMachine } from '@machines/balances';
import { LanguagesContext, languagesMachine } from '@machines/languages';
import { PinManagementContext, pinManagementMachine } from '@machines/pins';
import { ProfileContext, profileMachine } from '@machines/profile';
import { settingsMachine } from '@machines/settings';
import { SocialRecoveryContext, socialRecoveryMachine } from '@machines/socialRecovery';
import { StatementContext, statementMachine } from '@machines/statement';
import { TransferContext, transferMachine } from '@machines/transfer';
import { voucherMachine, VouchersContext } from '@machines/voucher';
import { SystemError } from '@lib/errors';
import { waitFor } from 'xstate/lib/waitFor';
import { L } from '@i18n/i18n-node';
import { Locales, NamespaceFeedbackTranslation } from '@i18n/i18n-types';
import {
  BaseContext,
  MachineEvent,
  MachineId,
  MachineInterface,
  MachineServiceInterface,
  NotifierContext,
  UserContext
} from '@machines/utils';
import { ActorMenu, mainMenu, pinManagementMenu, settingsMenu } from '@lib/menus';
import { LocalizedString } from 'typesafe-i18n';
import { config } from '@/config';

export type MachineContext =
  | AuthContext
  | BaseContext
  | BalancesContext
  | LanguagesContext
  | NotifierContext
  | PinManagementContext
  | ProfileContext
  | RegistrationContext
  | SocialRecoveryContext
  | StatementContext
  | TransferContext
  | UserContext
  | VouchersContext

export const machines: MachineInterface[] = [
  authMachine,
  balancesMachine,
  languagesMachine,
  mainMachine,
  pinManagementMachine,
  profileMachine,
  registrationMachine,
  settingsMachine,
  socialRecoveryMachine,
  statementMachine,
  transferMachine,
  voucherMachine
]

// TODO[Philip]: "Notifiable" can be a machine attribute to insert the notifier to context in a cleaner way.
export const notifyingMachines: MachineId[] = [MachineId.PIN_MANAGEMENT, MachineId.TRANSFER]

class MachineService implements MachineServiceInterface {

  public readonly service: Interpreter<any, any, MachineEvent, any, any>

  constructor(
    context: MachineContext,
    machine: typeof machines[number],
    session: SessionInterface) {
    const interpreter = interpret(machine.stateMachine.withContext(context))
    if(session.machineId === machine.stateMachine.id) {
      this.service = interpreter.start(session.machineState)
    } else {
      this.service = interpreter.start()
    }
  }

  async transition(event: MachineEvent ): Promise<[keyof NamespaceFeedbackTranslation | undefined, boolean, string]> {

    let  feedback: keyof NamespaceFeedbackTranslation | undefined, isRetry: boolean = false, state: StateValue;

    this.service.send(event)

    // check whether a retry occurred during the transition
    this.service.onTransition(async (_, machineEvent) => {
      if (machineEvent.type === 'RETRY'){
        isRetry = true;
        feedback = machineEvent.feedback
      } else {
        feedback = undefined
      }
    })

    const snapshot = this.service.getSnapshot()
    if(snapshot.hasTag('invoked')){
      state = await waitForInvokedService(this.service)
    } else {
      state = snapshot.value
    }

    return [feedback, isRetry, state.toString()]
  }

  async response(context: MachineContext, machineId: MachineId, state: string) {
    const machine = machines.find(machine => machine.stateMachine.id === machineId)
    if(!machine) {
      throw new SystemError(`No machine matching machine ID: ${machineId} found.`)
    }
    const language = await resolveResponseLanguage(context, state)
    const translator = L[language][machineId]
    return await machine.translate(context, state, translator)
  }

  stop(): void {
    this.service.stop()
  }
}

export async function buildResponse(context: any, session: SessionInterface) {

  const machine = await resolveMachine(context, session);
  const machineService = new MachineService(context, machine, session);
  const input = context.ussd.input;
  if (machineService.service.getSnapshot().hasTag("encryptInput")) {
    context.ussd.input = await hashValue(input);
  }
  let feedback, isRetry: boolean = false, response: LocalizedString, state: string;

  if (session. machineId === machine.stateMachine.id) {
    const transitionType = input === '0' ? 'BACK' : 'TRANSIT';
    const event: MachineEvent = transitionType === 'TRANSIT'? { type: transitionType, input: input } : { type: transitionType };
    [feedback, isRetry, state] = await machineService.transition(event);
  } else {
    const snapshot = machineService.service.getSnapshot();
    state = snapshot?.value.toString();
  }

  const machineId = resolveMachineId(machine.stateMachine.id as MachineId, state);
  const updatedContext = machineService.service?.machine.context;

  // build response
  if(feedback && isRetry) {
    response = await resolveErrorResponse(context, feedback)
  } else {
    response = await machineService.response(updatedContext, machineId, state);
  }
  machineService.stop();

  const sessionType = response.startsWith('END') ? SessionType.COMPLETED : SessionType.ACTIVE;

  // update session
  const { connections: { db, redis}, ussd: { requestId } } = context;
  const sessionUpdate: Partial<SessionInterface> = {
    extId: context.ussd.requestId,
    inputs: [...session.inputs || [], context.ussd.input],
    machineId,
    machineState: state,
    machines: [...session.machines || [], machineId],
    responses: [...session.responses || [], response],
    sessionType,
    version: session.version + 1
  }
  if(updatedContext.data && Object.keys(updatedContext.data).length > 0){
    sessionUpdate.data = updatedContext.data
  }
  await new SessionService(db, requestId, redis.ephemeral).update(sessionUpdate)
  return response;
}

async function handleActiveAccount(input: string, session: SessionInterface){

  const stateHandlers: Record<string, ActorMenu> = {
    "mainMenu": mainMenu,
    "pinManagement": pinManagementMenu,
    "settingsMenu": settingsMenu
  }

  const state = session.machineState
  if(!state) return mainMachine

  if(stateHandlers[state]){
    return stateHandlers[state].jumpTo(input)
  } else{
    return machines.find(machine => machine.stateMachine.id === session.machineId) || mainMachine
  }
}

async function resolveErrorResponse<K extends keyof NamespaceFeedbackTranslation>(context: UserContext, feedback: K){
  const language = context?.user?.account?.language || fallbackLanguage()
  switch (feedback) {
    case 'invalidPinAtRegistration':
    case 'invalidNewPin':
    case 'pinMismatch':
      return tFeedback(feedback, language, { supportPhone: config.KE.SUPPORT_PHONE})

    case 'invalidPin':
    case 'invalidPinPC':
    case 'invalidPinPV':
      const remainingAttempts = 2 - context.user.account.pin_attempts
      return tFeedback(feedback, language, { remainingAttempts })

    case 'invalidLanguageOption':
      const languages = await languageOptions()
      return tFeedback(feedback, language, { languages: languages[0] })

    case 'invalidVoucher':
      return tFeedback(feedback, language, { vouchers: context.data.heldVouchers[0] })

    default:
      return tFeedback(feedback, language)
  }
}

async function resolveMachine(context: BaseContext | UserContext, session: SessionInterface){
  if('user' in context){
    const  { user: { account } } = context
    if(account.status === AccountStatus.BLOCKED || account.status === AccountStatus.PENDING || account.status === AccountStatus.RESETTING_PIN){
      return authMachine
    }
    return handleActiveAccount(context.ussd.input, session)
  }
  return registrationMachine
}

export function resolveMachineId(machineId: MachineId, state: string) {
  const stateMachineIds: Record<string, MachineId> = {
    'mainMenu': MachineId.MAIN,
    'settingsMenu': MachineId.SETTINGS,
    'pinManagementMenu': MachineId.PIN_MANAGEMENT,
    'socialRecoveryMenu': MachineId.SOCIAL_RECOVERY
  };

  const defaultMachineId = stateMachineIds[state];

  if (defaultMachineId && machineId !== defaultMachineId) {
    return defaultMachineId;
  }

  return machineId;
}

export async function resolveResponseLanguage(context: MachineContext, state: string): Promise<Locales> {
  const languageChangeStates = ['accountCreationError', 'accountCreationSuccess', 'changeSuccess'];
  let language;

  if (languageChangeStates.includes(state) && 'selectedLanguage' in context.data) {
    language = context.data.selectedLanguage
  } else if ('user' in context) {
    language = context.user.account.language;
  }

  return language || fallbackLanguage();
}

async function waitForInvokedService(service: Interpreter<any, any, MachineEvent, any, any>){
  const resolvedState = await waitFor(service, state => {
      return state.hasTag('resolved') || state.hasTag('error')
  })
  return resolvedState.value
}

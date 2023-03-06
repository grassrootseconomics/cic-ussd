import L from "@lib/i18n/i18n-node";

import { Redis } from "ioredis";
import { Interpreter, StateValue } from "xstate";
import { BaseContext, loadMachine } from "@src/machines/utils";
import { supportedLanguages } from "@lib/ussd/utils";
import { getSessionById, updateSession, Session, createSession } from "@lib/ussd/session";

/**
 * Processes an incoming USSD request and returns a response.
 * If an active session exists for the USSD session ID, the state machine is resumed from the last state stored in the session data.
 * If an active session does not exist for the USSD session ID, a new session is created with the initial state of the state machine.
 * @param context
 * @param {Redis} redis - The Redis client instance.
 * @returns {Promise<string>} - The USSD response.
 */
export async function machineService (context: BaseContext, redis: Redis) {
  const session = await getSessionById(redis, context.ussd?.requestId) as Session
  const baseMachine = await loadMachine(context)
  console.log(`Machine id: ${baseMachine.id}`)
  if (session === null) {
    const x = baseMachine.start()
    const s = x.getSnapshot().value
    await createSession(context, redis, s)
    return s
  } else {
    context.data = session.data || {}
    context.session = session
    const t = await baseMachine.start(session.machineState)
    console.log(`USER INPUT AT ENTRY: ${context.ussd.input}`)
    return await transition(context.ussd.input, t, redis)
  }
}

/**
 * Describes the possible invoke states of interest in the state machine.
 */
const invokeStates = ['validatingRecipient']

/**
 * Describes states to transition to after an invoke state is done.
 */
const onDoneStates = {
  accountActivationSuccess: 'mainMenu',
  accountActivationError: 'machineError',
  accountVouchersLoaded: 'enteringVoucher',
  accountVouchersLoadError: 'machineError',
  voucherSetSuccess: 'activeVoucherSet',
  voucherSetError: 'machineError',
  recipientValidationSuccess: 'enteringAmount',
  recipientValidationError: 'invalidRecipient'
}

/**
 * Transitions the state machine to the next state and returns a response.
 * @param {Interpreter<BaseContext, any, machineEvent>} msvc - The state machine interpreter.
 * @param {Redis} redis - The Redis client instance.
 * @returns {Promise<string>} - The USSD response.
 */
async function transition (input: string, msvc: any, redis: Redis) {
  if (msvc.getSnapshot().can({ type: 'TRANSIT' })) {
    msvc.send({ type: 'TRANSIT', input})
    const state = msvc.getSnapshot().value
    if (shouldWait(state)) {
      return await respOnDone(msvc, redis)
    } else {
      await updateSession(msvc.getSnapshot().context, redis, state)
      return state
    }
  }
  return 'Invalid input'
}

/**
 * Checks if the current state is an invoke state.
 * @param {StateValue} state - The current state of the state machine.
 */
function shouldWait (state: StateValue) {
  return invokeStates.includes(state as string)
}

/**
 * Returns a promise that resolves when the state machine is done.
 * @param {Interpreter<BaseContext, any, machineEvent>} msvc - The state machine interpreter.
 * @param {Redis} redis - The Redis client instance.
 * @returns {Promise<string>} - The USSD response.
 */
async function respOnDone (msvc: Interpreter<any, any, any>, redis: Redis) {
  return await new Promise((resolve) => {
    msvc.onDone(async () => {
      const state = msvc.getSnapshot()
      const finalState = onDoneStates[state.value.toString()]
      await updateSession(state.context, redis, finalState)
      resolve(translate(state.context, finalState))
    })
  })
}

/**
 * Builds a localized response object based on the provided context, language, state and feedback.
 * @param {BaseContext} ctx - The context object.
 * @param {StateValue} state - The current state of the state machine.
 * @param {string} [feedback] - The feedback to be included in the response.
 * @returns {string} - The localized response.
 */
function translate (context: BaseContext, state: StateValue, feedback?: string) {
  return state
}

export interface LocalizedResponse {
  [key: string]: string | number | boolean
}

/**
 * Builds a localized response object with feedback.
 * @param {StateValue} state - The current state of the state machine.
 * @param {string} lang - The language to use for the response.
 * @param {string} [feedback] - The feedback to be included in the response.
 * @param {Record<string, string | number>} [data] - The data to be included in the response.
 * @returns {LocalizedResponse} The localized response object.
 */
function stateWithFeedback (
  state: StateValue,
  lang: string,
  feedback?: string,
  data?: Record<string, string | number>
): LocalizedResponse {
  const response: LocalizedResponse = {}
  if (feedback) {
    response.feedback = feedback
  }
  if (data) {
    Object.assign(response, data)
  }
  return L[lang][state](response)
}

function langOpts () {
  // Filter the supported languages to exclude the fallback object and extract the language names into an array
  const languagesList = Object.values(supportedLanguages)
    .filter((obj) => Object.keys(obj)[0] !== 'fb')
    .map((obj, index) => `${index + 1}. ${Object.values(obj)[0]}`)

  // Split the array into three sub-arrays, each containing up to three elements
  const ls1 = languagesList.slice(0, 3)
  const ls2 = languagesList.slice(3, 6)
  const ls3 = languagesList.slice(6, 9)

  // Join the sub-arrays into a single string, with each sub-array on a new line
  return [ls1, ls2, ls3].map((ls) => ls.join('\n'))
}

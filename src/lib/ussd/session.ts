import { upsertSession } from "@db/models/session";
import { PostgresDb } from "@fastify/postgres";
import { config } from "@src/config";
import { Cache } from "@utils/redis";

import Redis from "ioredis";
import { StateValue } from "xstate";
import { BaseContext } from "@src/machines/utils";
import {createHash} from "crypto";

/**
 * Description placeholder
 * @date 3/3/2023 - 10:46:51 AM
 *
 * @typedef {SessionData}
 */
type SessionData = any

/**
 * Description placeholder
 * @date 3/3/2023 - 10:46:51 AM
 *
 * @export
 * @interface History
 * @typedef {History}
 */
export interface History {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:51 AM
   *
   * @type {string[]}
   */
  inputs: string[]
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:51 AM
   *
   * @type {StateValue[]}
   */
  responses: StateValue[]
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:46:51 AM
 *
 * @export
 * @interface SessionInterface
 * @typedef {SessionInterface}
 */
export interface SessionInterface {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:51 AM
   *
   * @type {string}
   */
  actorInput: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:50 AM
   *
   * @type {?SessionData}
   */
  data?: SessionData
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:50 AM
   *
   * @type {?History}
   */
  history?: History
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:50 AM
   *
   * @type {string}
   */
  id: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:50 AM
   *
   * @type {StateValue}
   */
  machineState: StateValue
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:50 AM
   *
   * @type {string}
   */
  phoneNumber: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:50 AM
   *
   * @type {string}
   */
  serviceCode: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:46:50 AM
   *
   * @type {?number}
   */
  version?: number
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:46:49 AM
 *
 * @export
 * @class Session
 * @typedef {Session}
 * @extends {Cache}
 * @implements {SessionInterface}
 */
export class Session extends Cache implements SessionInterface {
  /**
   * The user's input for the current session.
   * @type {string}
   */
  actorInput: string
  /**
   * Additional data associated with the session.
   * @type {SessionData}
   */
  data?: SessionData
  /**
   * History of the session's states.
   * @type {History}
   */
  history?: History
  /**
   * The ID of the session.
   * @type {string}
   */
  id: string
  /**
   * The current state of the session's state machine.
   * @type {StateValue}
   */
  machineState: StateValue
  /**
   * The phone number associated with the session.
   * @type {string}
   */
  phoneNumber: string
  /**
   * The service code associated with the session.
   * @type {string}
   */
  serviceCode: string
  /**
   * The version number of the session.
   * @type {number}
   */
  version: number

  /**
   * Creates an instance of Session.
   * @date 3/3/2023 - 10:46:49 AM
   *
   * @constructor
   * @param {Redis} redis
   * @param {SessionInterface} session
   */
  constructor (redis: Redis, session: SessionInterface) {
    redis.select(config.REDIS.EPHEMERAL_DATABASE)
    super(redis, session.id)
    const { actorInput, data, history, id, machineState, phoneNumber, serviceCode, version = 1 } = session
    this.actorInput = actorInput
    this.data = data
    this.history = history
    this.id = id
    this.machineState = machineState
    this.phoneNumber = phoneNumber
    this.serviceCode = serviceCode
    this.version = version
  }

  async create (): Promise<Session> {
    await this.setJSON(this.toJson(), 180)
    return this
  }

  async update (data: unknown, db: PostgresDb): Promise<void> {
    await this.updateJSON(data)
    // TODO[Philip]: For now we're just updating the session in Postgres, however this generates a lot of db traffic.
    // Ideally we would maintain a threshold value above the the session's TLL and only update the session in Postgres
    // when the threshold is reached. However, this creates a lot of complexity and is not worth the effort at this point.
    // We can revisit this later.
    await upsertSession(db, this.toJson())
  }


  toJson (): SessionInterface {
    const { actorInput, data, history, id, machineState, phoneNumber, serviceCode, version } = this
    return { actorInput, data, history, id, machineState, phoneNumber, serviceCode, version }
  }
}


export async function createSession (context: BaseContext, redis: Redis, state: StateValue) {
  const { ussd: { phoneNumber, requestId, serviceCode } } = context
  const history: History = {
    inputs: [context.ussd.input],
    responses: [state]
  }
  // create new session
  return await new Session(redis, {
    actorInput: context.ussd.input,
    data: context.data,
    history,
    id: requestId,
    machineState: state,
    phoneNumber: phoneNumber,
    serviceCode: serviceCode
  }).create()
}

export async function getSessionById (
  redis: Redis,
  sessionId: string
): Promise<Session | null> {
  const cache = new Cache(redis, sessionId)
  const session = await cache.getJSON()
  if (session) {
    return new Session(redis, session as SessionInterface)
  }
  return null
}

export function updateData (data: any, update: any) {
  return Object.assign({}, data, update)
}

export function updateHistory (history: History, update: History) {
  return {
    ...history,
    inputs: [...history.inputs, ...update.inputs],
    responses: [...history.responses, ...update.responses]
  }
}

export async function updateSession (context: BaseContext, redis: Redis, state: StateValue) {
  const session = context.session
  const history = updateHistory(session.history, { inputs: [context.ussd.input], responses: [state] })
  const data = updateData(session.data, context.data)
  await session.update({
    actorInput: context.ussd.input,
    data,
    history,
    machineState: state,
    version: session.version + 1
  }, context.resources.db)
}


export function pointer (identifier: string | string[]): string {
  const hashBuilder = createHash('sha256')
  if (Array.isArray(identifier)) {
    const concatenated = identifier.join('')
    hashBuilder.update(concatenated)
  } else {
    hashBuilder.update(identifier)
  }
  return hashBuilder.digest('hex')
}
import {insertSession, setSession} from "@db/models/session";
import {PostgresDb} from "@fastify/postgres";
import {Cache} from "@utils/redis";

import Redis from "ioredis";
import {StateValue} from "xstate";
import {BaseContext} from "@src/machines/utils";
import {createHash} from "crypto";
import {Address, Symbol} from "@lib/ussd/utils";


type SessionData = any

export interface History {
  inputs: string[]
  machines: string[]
  responses: StateValue[]
}

export interface SessionInterface {
  data?: SessionData
  history?: History
  id: string
  input: string
  machineId: string
  phoneNumber: string
  serviceCode: string
  state: StateValue
  version?: number
}

export class Session extends Cache<SessionInterface> implements SessionInterface {
  input: string
  data?: SessionData
  history?: History
  id: string
  state: StateValue
  machineId: string
  phoneNumber: string
  serviceCode: string
  version: number

  constructor (redis: Redis, session: SessionInterface) {
    super(redis, session.id)
    const { input, data, history, id, machineId, phoneNumber, serviceCode, state, version = 1 } = session
    this.input = input
    this.data = data
    this.history = history
    this.id = id
    this.machineId = machineId
    this.phoneNumber = phoneNumber
    this.serviceCode = serviceCode
    this.state = state
    this.version = version
  }

  async create (db: PostgresDb): Promise<Session> {
    await this.setJSON(this.toJson(), 180)
    await insertSession(db, {
        input: this.input,
        data: this.data,
        history: this.history,
        id: this.id,
        phoneNumber: this.phoneNumber,
        serviceCode: this.serviceCode,
        state: this.state,
        version: this.version
    })
    return this
  }

  async update (data: Partial<SessionData>, db: PostgresDb): Promise<void> {
    await this.updateJSON(data)
    // TODO[Philip]: For now we're just updating the session in Postgres, however this generates a lot of db traffic.
    // Ideally we would maintain a threshold value above the the session's TLL and only update the session in Postgres
    // when the threshold is reached. However, this creates a lot of complexity and is not worth the effort at this point.
    // We can revisit this later.
    await setSession(db, {
      history: {
        inputs: data.history?.inputs,
        machines: data.history?.machines,
        responses: data.history?.responses
      },
      id: this.id,
      state: data.state,
      version: data.version
    })
  }


  toJson (): SessionInterface {
    const { input, data, history, id, machineId, phoneNumber, serviceCode, state, version } = this
    return { input, data, history, id, machineId, phoneNumber, serviceCode, state, version }
  }
}


export async function createSession (context: BaseContext, machineId: string, redis: Redis, state: StateValue) {
  const { resources: { db }, ussd: { phoneNumber, requestId, serviceCode } } = context
  const history: History = {
    inputs: [context.ussd.input],
    machines: [machineId],
    responses: [state]
  }
  // create new session
  return await new Session(redis, {
    input: context.ussd.input,
    data: context.data,
    history,
    id: requestId,
    machineId: machineId,
    phoneNumber: phoneNumber,
    serviceCode: serviceCode,
    state: state
  }).create(db)
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
    machines: [...history.machines, ...update.machines],
    responses: [...history.responses, ...update.responses]
  }
}

export async function updateSession (context: BaseContext, machineId: string, state: StateValue) {
  const { data, resources: { db }, session, ussd: { input } } = context


  const updatedData = updateData(session.data || {}, data || {})
  const updatedHistory = updateHistory(session.history || { inputs: [], machines: [], responses: [] }, { inputs: [input], machines: [machineId], responses: [state] })
  await session.update({
    input: input,
    data: updatedData,
    history: updatedHistory,
    machineId: machineId,
    state: state,
    version: session.version + 1
  }, db)
}


export function pointer (identifier: Address | Symbol | string[]): string {
  const hashBuilder = createHash('sha256')
  if (Array.isArray(identifier)) {
    const concatenated = identifier.join('')
    hashBuilder.update(concatenated)
  } else {
    hashBuilder.update(identifier)
  }
  return hashBuilder.digest('hex')
}
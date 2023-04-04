import { insertSession, setSession } from '@db/models/session';
import { PostgresDb } from '@fastify/postgres';
import { Cache } from '@utils/redis';

import Redis from 'ioredis';
import { StateValue } from 'xstate';
import { BaseContext } from '@machines/utils';


type SessionData = any

export interface History {
  inputs: string[]
  machines: string[]
  responses: StateValue[]
}

export interface SessionInterface {
  data?: SessionData
  history: History
  id: string
  input: string
  machineId: string
  phoneNumber: string
  serviceCode: string
  state: StateValue
  version?: number
}

export class Session extends Cache<SessionInterface> implements SessionInterface {
  input!: string
  data?: SessionData
  history!: History
  id!: string
  state!: StateValue
  machineId!: string
  phoneNumber!: string
  serviceCode!: string
  version!: number

  constructor(redis: Redis, session: SessionInterface) {
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

  async create(db: PostgresDb): Promise<Session> {
  await this.setJSON(this.toJson(), 180);
  const session: SessionInterface = {
    input: this.input,
    history: this.history,
    id: this.id,
    phoneNumber: this.phoneNumber,
    serviceCode: this.serviceCode,
    state: this.state,
    version: this.version,
    ...(this.data && { data: this.data }),
  };
  await insertSession(db, session);
  return this;
}

  async update(data: SessionData, db: PostgresDb): Promise<void> {
    await this.updateJSON(data)
    await setSession(db, {
      history: {
        inputs: data.history?.inputs ?? this.history?.inputs,
        machines: data.history?.machines ?? this.history?.machines,
        responses: data.history?.responses ?? this.history?.responses,
      },
      id: this.id,
      state: data.state ?? this.state,
      version: data.version ?? this.version,
    })
  }

  toJson(): SessionInterface {
  const session: SessionInterface = {
    history: this.history,
    input: this.input,
    id: this.id,
    machineId: this.machineId,
    phoneNumber: this.phoneNumber,
    serviceCode: this.serviceCode,
    state: this.state,
    version: this.version,
  };
  if (this.data !== undefined) {
    session.data = this.data;
  }
  return session;
}
}

export async function createSession(context: BaseContext, machineId: string, redis: Redis, state: StateValue) {
  const { resources: { db }, ussd: { phoneNumber, requestId, serviceCode }, data } = context;
  const { input } = context.ussd;

  const session: SessionInterface = {
    input,
    history: {
      inputs: [input],
      machines: [machineId],
      responses: [state]
    },
    id: requestId,
    machineId,
    phoneNumber,
    serviceCode,
    state
  };

  if (data !== undefined) {
    session.data = data;
  }

  return await new Session(redis, session).create(db);
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

  if (!session) {
    throw new Error('Session is undefined.')
  }

  const updatedHistory = updateHistory(session.history, { inputs: [input], machines: [machineId], responses: [state] })
  const updatedSession: Partial<SessionInterface> = {
    input: input,
    history: updatedHistory,
    machineId: machineId,
    state: state,
    version: session.version + 1
  }

  if(data) {
    updatedSession.data = updateData(session.data || {}, data)
  }

  await session.update(updatedSession, db)
}

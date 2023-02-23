import Redis from 'ioredis';
import {
  JsonObject,
  JsonProperty,
  JsonSerializer
} from 'typescript-json-serializer';

import {
  CacheAccessor
} from "@utils/redis";
import { StateValue } from "xstate";


type SessionData = Record<string, string > ;
export interface SessionHistory {
  responses: StateValue[]
}

interface Session {
  actorInput: string;
  data?: SessionData;
  history?: SessionHistory;
  id : string;
  machineState: StateValue;
  phoneNumber: string;
  serviceCode: string;
  version?: number;
}


export class UssdSession extends CacheAccessor implements Session{

    actorInput: string;
    data?: SessionData;
    history?: SessionHistory;
    id: string;
    machineState: StateValue;
    phoneNumber: string;
    serviceCode: string;
    version: number;

  constructor(redis: Redis, session: Session) {
    super(redis, session.id);
    this.actorInput = session.actorInput;
    this.data = session.data;
    this.history = session.history;
    this.id = session.id;
    this.machineState = session.machineState;
    this.phoneNumber = session.phoneNumber;
    this.serviceCode = session.serviceCode;
    this.version = session.version || 1;
  }

  async create() {
    await this.cacheJSONData(this.toJson(), 180);
    return this
  }


  async update(data: unknown) {
    await this.updateCacheJsonData(data);
  }

  toJson() {
    return {
      actorInput: this.actorInput,
      data: this.data,
      history: this.history,
      id: this.id,
      machineState: this.machineState,
      phoneNumber: this.phoneNumber,
      serviceCode: this.serviceCode,
      version: this.version
    };
  }

}

export async function getUssdSessionById(redis: Redis, sessionId: string) {
  const cacheAccessor = new CacheAccessor(redis, sessionId);
  const session = await cacheAccessor.getCacheJSONData();
  if (session) {
    return new UssdSession(redis, session);
  }
  return null;
}
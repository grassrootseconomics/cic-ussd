import Redis from 'ioredis';
import {
  JsonObject,
  JsonProperty,
  JsonSerializer
} from 'typescript-json-serializer';

import {
  CacheAccessor
} from "@utils/redis";


type SessionData = Record<string, string | number> ;

interface UssdSessionObject {
  actorInput: string;
  data: SessionData;
  lastState: string;
  ussdCode: string;
  version: number;
}

@JsonObject()
export class UssdSession extends CacheAccessor {
  actorInput: string;
  @JsonProperty()
  data: SessionData;
  @JsonProperty()
  lastState: string;
  @JsonProperty()
  ussdCode: string;
  @JsonProperty()
  version: number;

  constructor(cacheClient: Redis, cacheKey: string, serializer: JsonSerializer, UssdSessionObject: UssdSessionObject) {
    super(cacheClient, cacheKey, serializer);
    this.actorInput = UssdSessionObject.actorInput;
    this.data = UssdSessionObject.data;
    this.lastState = UssdSessionObject.lastState;
    this.ussdCode = UssdSessionObject.ussdCode;
    this.version = UssdSessionObject.version;
  }

  async create(serializer: JsonSerializer, ussdSession: UssdSession, expiration = 180) {
    await this.cacheJSONData(serializer.serialize(ussdSession), expiration);
  }

  async get(cache: Redis, cacheKey: string, serializer: JsonSerializer) {
    const serializedSession = await this.getCacheJSONData();
    if (serializedSession) {
      return serializer.deserialize(serializedSession, UssdSession);
    } else {
      return serializedSession;
    }
  }

  async update(cache: Redis, cacheKey: string, serializer: JsonSerializer, ussdSession: UssdSession) {
    await this.cacheJSONData(serializer.serialize(ussdSession));
  }
}
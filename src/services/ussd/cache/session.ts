import { randomUUID } from 'crypto';

import Redis from 'ioredis';
import {
  JsonObject,
  JsonProperty,
  JsonSerializer
} from 'typescript-json-serializer';

import { createPointer } from '../../../helpers/pointer';
import {
  cacheJSONData,
  getCacheJSONData
} from '../../../helpers/redis';
import { createSessionId, ussdSalt } from '../../../helpers/ussd';


@JsonObject()
export class Session {
  actorInput: string;
  @JsonProperty()
  data: Record<string, string | number>;
  @JsonProperty()
  state: string;
  @JsonProperty()
  ussdCode: string;
  @JsonProperty()
  version: number;

  constructor(actorInput: string, data: Record<string, string | number>, state: string, ussdCode: string, version: number) {
    this.actorInput = actorInput;
    this.data = data;
    this.state = state;
    this.ussdCode = ussdCode;
    this.version = version;
  }

  static async create(cache: Redis, cacheKey: string, serializer: JsonSerializer, ussdSession: Session, expiration = 180) {
    const serializedSession = serializer.serialize(ussdSession);
    await cacheJSONData(cache, cacheKey, serializedSession, expiration);
  }

  static async get(cache: Redis, cacheKey: string, serializer: JsonSerializer) {
    const serializedSession = await getCacheJSONData(cache, cacheKey);
    if (serializedSession) {
      return serializer.deserialize(serializedSession, Session);
    } else {
      return serializedSession;
    }
  }

  static async update(cache: Redis, cacheKey: string, serializer: JsonSerializer, ussdSession: Session) {
    await cacheJSONData(cache, cacheKey, serializer.serialize(ussdSession));
  }

}

@JsonObject()
export class SessionTracker {
  @JsonProperty()
  phoneNumber: string
  @JsonProperty()
  tracker: string

  constructor(phoneNumber: string, tracker: string) {
    this.phoneNumber = phoneNumber
    this.tracker = tracker
  }



  /**
   * It takes a Redis cache, a cache key, a JSON serializer, and a session tracker,
   * and then it serializes the session tracker and stores it in the cache
   * @param {Redis} cache - Redis - The Redis client
   * @param {string} cacheKey - The key to store the session tracker in the cache.
   * @param {JsonSerializer} serializer - JsonSerializer - This is a class that can
   * serialize and deserialize objects to and from JSON.
   * @param {SessionTracker} sessionTracker - The session tracker object that you
   * want to store in the cache.
   */
  static async create(cache: Redis, cacheKey: string, serializer: JsonSerializer, sessionTracker: SessionTracker) {
    const serializedSessionTracker = serializer.serialize(sessionTracker);
    await cacheJSONData(cache, cacheKey, serializedSessionTracker);
  }


  /**
   * > It gets a JSON object from the cache, and if it exists, it deserializes it
   * into a SessionTracker object
   * @param {Redis} cache - Redis - The Redis client
   * @param {string} cacheKey - The key to use to store the session tracker in the
   * cache.
   * @param {JsonSerializer} serializer - JsonSerializer - This is the serializer
   * that will be used to serialize and deserialize the object.
   * @returns The serializedSessionTracker is being returned.
   */
  static async get(cache: Redis, cacheKey: string, serializer: JsonSerializer) {
    const serializedSessionTracker = await getCacheJSONData(cache, cacheKey);
    if (serializedSessionTracker) {
      return serializer.deserialize(serializedSessionTracker, SessionTracker);
    } else {
      return serializedSessionTracker;
    }
  }

  /**
   * It takes a Redis cache, a cache key, a JSON serializer, and a session tracker,
   * and then it updates the cache with the serialized session tracker
   * @param {Redis} cache - Redis - The Redis client
   * @param {string} cacheKey - The key to store the session tracker in the cache.
   * @param {JsonSerializer} serializer - JsonSerializer - This is a class that is
   * used to serialize and deserialize the session tracker.
   * @param {SessionTracker} sessionTracker - The session tracker object that you
   * want to store in the cache.
   */
  static async update(cache: Redis, cacheKey: string, serializer: JsonSerializer, sessionTracker: SessionTracker) {
    await cacheJSONData(cache, cacheKey, serializer.serialize(sessionTracker));
  }
}

/**
 * It returns a session tracker for a given phone number
 * @param {Redis} cache - Redis - The redis instance
 * @param {string} phoneNumber - The phone number of the user
 * @param {JsonSerializer} serializer - This is the serializer that will be used to
 * serialize and deserialize the session tracker.
 * @returns The session tracker
 */
export async function getSessionTracker(cache: Redis, phoneNumber: string, serializer: JsonSerializer) {
  const sessionTrackerKey = createPointer([phoneNumber, ussdSalt.SESSION_TRACKER])
  const sessionTracker = await SessionTracker.get(cache, sessionTrackerKey, serializer) as SessionTracker
  if (sessionTracker) {
    const sessionId = await createSessionId(phoneNumber, sessionTracker.tracker)
    const session = await Session.get(cache, sessionId, serializer)
    if (session !== undefined && session !== null) {
      return sessionTracker.tracker
    } else{
      return await createTracker(cache, phoneNumber, serializer, sessionTrackerKey)
    }
  } else {
    return await createTracker(cache, phoneNumber, serializer, sessionTrackerKey)
  }
}

/**
 * It creates a new session tracker for a phone number and stores it in Redis
 * @param {Redis} cache - The Redis cache instance
 * @param {string} phoneNumber - The phone number of the user
 * @param {JsonSerializer} serializer - This is the serializer that will be used to
 * serialize and deserialize the session tracker.
 * @param {string} sessionTrackerKey - The key to use to store the session tracker
 * in Redis.
 * @returns A new tracker
 */
async function createTracker(cache : Redis, phoneNumber : string, serializer : JsonSerializer, sessionTrackerKey: string) {
  const newTracker = randomUUID()
  await SessionTracker.create(cache, sessionTrackerKey, serializer, new SessionTracker(phoneNumber, newTracker))
  return newTracker
}

import Redis from 'ioredis';
import JSONCache from 'redis-json';
import { config } from "@src/config";
import { JsonSerializer } from "typescript-json-serializer";



/**
 * It creates a new Redis client and returns it
 * @returns A new Redis client
 */
export function createRedisClient() {
  return new Redis(
    config.REDIS.PORT,
    config.REDIS.HOST,
    {
      db: config.REDIS.DATABASE,
    }
  );
}

/* This class exposes functions to cache and retrieve data from Redis.
* @Class CacheAccessor
* @member {Redis} cacheClient - The Redis client.
* @member {string} cacheKey - The unique key pointing to data in cache.
* @member {JsonSerializer} serializer - The serializer instance to convert objects to JSON.
* */
export class CacheAccessor {
  cacheClient: Redis
  cacheKey: string
  serializer: JsonSerializer

  constructor(cache: Redis, cacheKey: string, serializer: JsonSerializer) {
    this.cacheClient = cache
    this.cacheKey = cacheKey
    this.serializer = serializer
  }

  /**
 * Takes a Redis client instance, a cache key, data, and an optional expiration time,
 * and then sets the data in the cache with the given expiration time if present.
 * @param {string | number} data - The data to be cached.
 * @param {number} [expiration] - The number of seconds the data should be cached
 * for.
 */
  async cacheData(data: string | number, expiration?: number) {
      if (expiration) {
      await this.cacheClient.set(this.cacheKey, data, 'EX', expiration);
    } else {
      await this.cacheClient.set(this.cacheKey, data);
    }
  }

  /**
 * Caches JSON data in Redis.
 * @param data - The data you want to cache.
 * @param {number} [expiration] - The number of seconds to cache the data for.
 */
  async cacheJSONData(data: unknown, expiration?: number) {
    const jsonCache = new JSONCache(this.cacheClient);
    if (expiration){
      await jsonCache.set(this.cacheKey, data);
      await this.cacheClient.expire(this.cacheKey, expiration);
    } else {
      await jsonCache.set(this.cacheKey, data);
    }
  }

  /**
 * Retrieves data from the cache.
 * @returns A promise that resolves to the value in cache associated with the cacheKey.
 */
  async getCacheData() {
    return this.cacheClient.get(this.cacheKey);
  }

  /**
    * Retrieves JSON data from the cache.
    * @param {string[]} [keys] - An array of keys to get from the cache. If you don't
    * pass in any keys, it will return the entire cache.
    * @returns A promise that resolves to the JSON object in cache associated with the cacheKey.
  */
  async getCacheJSONData(keys?: string[]) {
    const jsonCache = new JSONCache(this.cacheClient);
    if (keys) {
      return await jsonCache.get(this.cacheKey, ...keys);
    } else {
      return await jsonCache.get(this.cacheKey);
    }
  }
}
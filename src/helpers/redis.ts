import Redis from 'ioredis';
import { Redis as RedisType } from 'ioredis';
import JSONCache from 'redis-json';

import config from '../config/config';

/**
 * It creates a new Redis client and returns it
 * @returns A new Redis client
 */
export function createRedisClient() {
  return new Redis(
    config.get('redis.port'),
    config.get('redis.host'),
    {
      db: config.get('redis.database'),
    }
  );
}


/**
 * It takes a Redis cache, a cache key, some data, and an optional expiration time,
 * and then sets the data in the cache with the given expiration time
 * @param {Redis} cache - Redis - The Redis client
 * @param {string} cacheKey - The key to store the data under.
 * @param {string | number} data - The data to be cached.
 * @param {number} [expiration] - The number of seconds the data should be cached
 * for.
 */
export async function cacheData(cache: RedisType, cacheKey: string, data: string | number, expiration?: number) {
  if (expiration) {
    await cache.set(cacheKey, data, 'EX', expiration);
  } else {
    await cache.set(cacheKey, data);
  }
}

/**
 * It caches JSON data in Redis.
 * @param {Redis} cache - Redis - The Redis client
 * @param {string} cacheKey - The key to store the data under
 * @param data - The data you want to cache.
 * @param {number} [expiration] - The number of seconds to cache the data for.
 */
export async function cacheJSONData(cache: RedisType, cacheKey: string, data: unknown, expiration?: number) {
  const jsonCache = new JSONCache(cache);
  if (expiration){
    await jsonCache.set(cacheKey, data);
    await cache.expire(cacheKey, expiration);
  } else {
    await jsonCache.set(cacheKey, data);
  }
}

/**
 * It gets data from the cache
 * @param {Redis} cache - Redis - This is the Redis client that we created in the
 * previous step.
 * @param {string} cacheKey - The key to use to store the data in the cache.
 * @returns A promise that resolves to the value of the cacheKey
 */
export async function getCacheData(cache: RedisType, cacheKey: string) {
  return cache.get(cacheKey);
}


/**
 * "Get the JSON data from the cache."
 *
 * The function takes three parameters:
 *
 * * cache: The Redis cache.
 * * cacheKey: The cache key.
 * * keys: The keys to get from the cache
 * @param {Redis} cache - Redis - The Redis client
 * @param {string} cacheKey - The key to the cache
 * @param {string[]} [keys] - An array of keys to get from the cache. If you don't
 * pass in any keys, it will return the entire cache.
 * @returns A promise that resolves to the value of the cache key.
 */
export async function getCacheJSONData(cache: RedisType, cacheKey: string, keys?: string[]) {
  const jsonCache = new JSONCache(cache);
  if (keys) {
    return await jsonCache.get(cacheKey, ...keys);
  } else {
    return await jsonCache.get(cacheKey);
  }
}

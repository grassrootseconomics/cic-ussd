import { Redis as RedisClient } from "ioredis";
import JSONCache from "redis-json";

/**
 * A class for accessing a Redis cache and performing common cache operations.
 */
export class Cache {
  /**
   * The Redis client instance to use for cache operations.
   */
  client: RedisClient

  /**
   * The cache key to use for cache operations.
   */
  key: string

  /**
   * Creates a new Cache instance with the specified Redis client and cache key.
   * @param {RedisClient} client - The Redis client instance to use for cache operations.
   * @param {string} key - The cache key to use for cache operations.
   * @constructor
   */
  constructor (client: RedisClient, key: string) {
    this.client = client
    this.key = key
  }

  /**
   * Caches data in Redis using the specified expiration time.
   * @param {string | number} data - The data to cache.
   * @param {number} expiration - The number of seconds to cache the data for.
   * @returns {Promise<void>} A promise that resolves when the data has been successfully cached.
   */
  async set (data: string | number, expiration?: number): Promise<void> {
    if (expiration) {
      await this.client.set(this.key, data, 'EX', expiration)
    } else {
      await this.client.set(this.key, data)
    }
  }

  /**
   * Retrieves data from the cache.
   * @returns {Promise<string | null>} A promise that resolves to the data in cache associated with the cache key.
   */
  async get (): Promise<string | null> {
    return this.client.get(this.key);
  }

  /**
   * Deletes data from the cache.
   * @returns {Promise<void>} A promise that resolves when the data has been successfully deleted from the cache.
   */
  async del (): Promise<void> {
    await this.client.del(this.key)
  }

  /**
   * Caches JSON data in Redis using the specified expiration time.
   * @param {unknown} data - The data to cache.
   * @param {number} [expiration] - The number of seconds to cache the data for.
   * @returns {Promise<void>} A promise that resolves when the data has been successfully cached.
   */
  async setJSON (data: unknown, expiration?: number): Promise<void> {
    const cache = new JSONCache(this.client)
    if (expiration) {
      await cache.set(this.key, data, { expire: expiration })
    } else {
      await cache.set(this.key, data)
    }
  }

  /**
   * Retrieves JSON data from the cache.
   * @param {string[]} [keys] - An array of keys to retrieve from the JSON object in cache. If not provided, the entire JSON object will be returned.
   * @returns {Promise<unknown>} A promise that resolves to the JSON data in cache associated with the cache key.
   */
  async getJSON (keys?: string[]): Promise<unknown> {
    const cache = new JSONCache(this.client)
    if (keys) {
      return await cache.get(this.key, ...keys)
    } else {
      return await cache.get(this.key)
    }
  }

  /**
   * Updates a JSON object in the cache by merging it with the provided data.
   * @param {unknown} data - The data to merge with the JSON object in cache.
   */
  async updateJSON (data: unknown): Promise<void> {
    const cache = new JSONCache(this.client)
    await cache.set(this.key, data)
  }
}

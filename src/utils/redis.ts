import { Redis as RedisClient } from 'ioredis';
import JSONCache from 'redis-json';

export class Cache<T> {
  client: RedisClient
  key: string

  constructor(client: RedisClient, key: string) {
    this.client = client
    this.key = key
  }

  async setJSON(data: T, expiration?: number): Promise<void> {
    const cache = new JSONCache<T>(this.client)
    if (expiration) {
      await cache.set(this.key, data, { expire: expiration })
    } else {
      await cache.set(this.key, data)
    }
  }

  async getJSON<K extends keyof T>(keys?: K[]): Promise<T | Pick<T, K>  | null> {
    const cache = new JSONCache<T>(this.client)
    if (keys) {
      const result = await cache.get(this.key, ...keys.map(key => key.toString()))
      return result ? result as Pick<T, K> : null
    } else {
      const result = await cache.get(this.key)
      return result ? result as T : null
    }
  }

  async updateJSON(data: Partial<T>) {
    const cache = new JSONCache<Partial<T>>(this.client)
    await cache.set(this.key, data)
    return await this.getJSON()
  }
}
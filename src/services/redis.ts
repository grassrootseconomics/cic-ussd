import { Redis as RedisClient } from 'ioredis';
import JSONCache from 'redis-json';
import { DeepPartial } from 'ts-essentials';

export class CacheService<T> {
  client: RedisClient
  key: string

  constructor(client: RedisClient, key: string) {
    this.client = client
    this.key = key
  }

  async set(data: Partial<T>, expiration?: number): Promise<void> {
    const cache = new JSONCache<Partial<T>>(this.client);
    if (expiration) {
      await cache.set(this.key, data, { expire: expiration });
    } else {
      await cache.set(this.key, data);
    }
  }

  async get<K extends keyof T>(keys?: K[]) {
    const cache = new JSONCache<T>(this.client);
    if (keys) {
      return await cache.get(this.key, ...keys.map(key => key.toString())) as  Pick<T, K>;
    }
    return await cache.get(this.key) as T;
  }

  async update(data: DeepPartial<T>) {
    const cache = new JSONCache<DeepPartial<T>>(this.client)
    await cache.set(this.key, data)
    return await this.get() as T
  }
}
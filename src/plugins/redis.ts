import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    e_redis: Redis
    p_redis: Redis
  }
}

interface RedisPluginOptions {
  ephemeralDsn: string
  persistentDsn: string
}

const redisPlugin: FastifyPluginAsync<RedisPluginOptions> = async (fastify, opts) => {
  const { ephemeralDsn, persistentDsn } = opts
  const configs = {
    autoResubscribe: true,
    connectionTimeout: 10000,
    connectionTimeoutMillis: 10000,
    dropBufferSupport: true,
    enableAutoPipelining: true,
    enableOfflineQueue: true,
    enableReadyCheck: true,
    family: 4,
    keepAlive: 1000,
    lazyConnect: true,
    maxRetriesPerRequest: 5
  }

  const ephemeralClient = new Redis(ephemeralDsn, {
    connectionName: "ephemeral",
    keyPrefix: "cic-ussd-e:",
    ...configs
  })
  const persistentClient = new Redis(persistentDsn, {
    keyPrefix: "cic-ussd-p:",
    ...configs
  })

  fastify.decorate('e_redis', ephemeralClient)
  fastify.log.debug('Ephemeral redis client connected.')
  fastify.decorate('p_redis', persistentClient)
  fastify.log.debug('Persistent redis client connected.')

  // gracefully kill redis connection
  fastify.addHook('onClose', async (_) => {
    ephemeralClient.quit()
    persistentClient.quit()
  })
}

export default fp(redisPlugin, {
  fastify: '4.x',
  name: 'redis'
})

import {FastifyPluginAsync} from "fastify";
import fp from "fastify-plugin";
import Redis from "ioredis";
import {config} from "@src/config";

declare module 'fastify' {
  interface FastifyInstance {
    e_redis: Redis
    p_redis: Redis
  }
}

interface RedisPluginOptions {

  host: string
  port: number
}

const redisPlugin: FastifyPluginAsync<RedisPluginOptions> = async (fastify, opts) => {
  const { host, port } = opts

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

  const ephemeralClient = new Redis(port, host, {
    connectionName: "ephemeral",
    db: config.REDIS.EPHEMERAL_DATABASE,
    keyPrefix: "cic-ussd-e:",
    ...configs
  })
  const persistentClient = new Redis(port, host, {
    db: config.REDIS.PERSISTENT_DATABASE,
    keyPrefix: "cic-ussd-p:",
    ...configs
  })

  fastify.decorate('e_redis', ephemeralClient)
  fastify.decorate('p_redis', persistentClient)

  // gracefully kill redis connection
  fastify.addHook('onClose', async (instance) => {
    ephemeralClient.quit()
    persistentClient.quit()
  })
}

export default fp(redisPlugin, {
  fastify: '4.x',
  name: 'redis'
})

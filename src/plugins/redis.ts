import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import Redis from "ioredis";

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}

/**
 * Interface for RedisPlugin options.
 * @interface RedisPluginOptions
 * @property {string} host - The Redis host.
 * @property {number} port - The Redis port.
 */
interface RedisPluginOptions {
  host: string
  port: number
}

/**
 * Fastify plugin that creates a Redis client instance and decorates it onto the fastify instance.
 * Also adds a hook to destroy the Redis client instance on server close.
 * @param fastify - The Fastify instance.
 * @param opts - The plugin options.
 */
const redisPlugin: FastifyPluginAsync<RedisPluginOptions> = async (fastify, opts) => {
  const { host, port } = opts
  const redisClient = new Redis(port, host)

  fastify.decorate('redis', redisClient)

  // gracefully kill redis connection
  fastify.addHook('onClose', async (instance) => {
    redisClient.quit()
  })
}

export default fp(redisPlugin, {
  fastify: '4.x',
  name: 'redis'
})

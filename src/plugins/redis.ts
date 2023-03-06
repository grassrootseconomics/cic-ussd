import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import Redis from "ioredis";

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis
  }
}


/**
 * Description placeholder
 *
 * @interface RedisPluginOptions
 * @typedef {RedisPluginOptions}
 */
interface RedisPluginOptions {
  /**
   * Description placeholder
   *
   * @type {string}
   */
  host: string
  /**
   * Description placeholder
   *
   * @type {number}
   */
  port: number
}


/**
 * Description placeholder
 *
 * @async
 * @param {*} fastify
 * @param {*} opts
 * @returns {*}
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

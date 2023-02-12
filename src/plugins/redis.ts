import { FastifyPluginAsync } from "fastify";
import { createRedisClient } from "@utils/redis";
import fp from "fastify-plugin";

const redisPlugin: FastifyPluginAsync = async (fastify, options) => {
  const redisClient = createRedisClient()

  fastify.decorate('redis', redisClient)

  // gracefully kill redis connection
  fastify.addHook('onClose', async (instance) => {
    redisClient.disconnect(false)
  })

}

export default fp(redisPlugin, {
  fastify : "4.x",
  name: "redis"
})
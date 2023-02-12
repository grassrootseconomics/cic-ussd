import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import fp from "fastify-plugin";

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify, options) => {

  const prisma = new PrismaClient()

  await prisma.$connect()

  fastify.decorate('prisma', prisma)

  // gracefully kill db connnection
  fastify.addHook('onClose', async (instance) => {
    await prisma.$disconnect()
  })

}

export default fp(prismaPlugin, {
  fastify: '4.x',
  name: 'prisma'
});

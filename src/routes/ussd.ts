import { ATOnRequestHook, ATPreHandlerHook, ATRequestBody } from '@services/africasTalking';
import { FastifyInstance } from 'fastify';
import { sessionHandler } from '@services/session';

export default async function ussdRoutes (fastify: FastifyInstance) {
  fastify.route<{
    Body: typeof ATRequestBody
  }>({
    handler: sessionHandler,
    method: 'POST',
    onRequest: ATOnRequestHook,
    preHandler: ATPreHandlerHook,
    schema: {
      body: ATRequestBody
    },
    url: '/africasTalking'
  })

  fastify.route({
    method: 'POST',
    url: '/debug',
    handler: async (request, reply) => {
      reply.send({
        endpoint: 'debug'
      })
    }
  })
}

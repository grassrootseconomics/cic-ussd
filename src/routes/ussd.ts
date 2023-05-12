import { ATOnRequestHook, ATPreHandlerHook, ATRequestBody } from '@services/africasTalking';
import { FastifyInstance } from 'fastify';
import { sessionHandler } from '@services/session';
import { config } from '@/config';
import { systemGuardiansHandler, systemGuardiansPreHandler } from '@services/systemGuardian';

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
    url: `/${config.AT.USSD_ENDPOINT_SECRET}`
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

  fastify.route<{ Body: { phoneNumber: string } }>({
    method: ['DELETE', 'POST'],
    url: '/system-guardians',
    handler: systemGuardiansHandler,
    preHandler: systemGuardiansPreHandler,
    schema:{
      body: {
        type: 'object',
        properties: {
          phoneNumber: { type: 'string' }
        },
        required: ['phoneNumber']
      },
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/system-guardians',
    handler: systemGuardiansHandler,
    preHandler: systemGuardiansPreHandler,
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      }
    }
  })
}

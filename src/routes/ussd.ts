import {ATOnRequestHook, ATPreHandlerHook, ATRequestBody} from '@src/services/africasTalking'
import {sessionHandler} from '@src/services/session'

import {FastifyInstance} from 'fastify'

/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {FastifyInstance} fastify
 * @returns {*}
 */
export default async function ussdRoutes (fastify: FastifyInstance) {
  // add route to handle AT ussd requests.
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

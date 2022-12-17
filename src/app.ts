import fastifyCors from '@fastify/cors'
import formBody from '@fastify/formbody'
import fastifySensible from '@fastify/sensible'
import fastify, { FastifyInstance } from 'fastify'
import { config } from './config'
import africasTalking from './handlers/ussd/africasTalking'

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      COUNTRY_CODE: string
    }
    ussdMachine: string
  }
}

const build = (): FastifyInstance => {
  const app = fastify({
    disableRequestLogging: true,
    logger: {
      base: null,
      level: config.LOG.LEVEL,
    },
  })
  app.register(fastifyCors, {
    origin: config.FRONTEND.HOST,
  })
  app.register(formBody)
  app.register(fastifySensible)

  app.decorate('config', {
    COUNTRY_CODE: config.USSD.COUNTRY_CODE,
  })
  app.decorate('ussdMachine', 'new ussdMachineClassHere()')

  app.register(africasTalking, { prefix: `/ussd/${config.USSD.ROUTE_SECRET}` })

  app.setErrorHandler<Error>(function (error, request, reply) {
    app.log.error({ error: error.toString(), request: request })

    reply.status(500).send({
      statusCode: 500,
      error: 'INTERNAL',
      message: 'Internal server error',
    })
  })

  return app
}

export default build

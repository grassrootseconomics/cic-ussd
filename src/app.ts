import fastifyCors from '@fastify/cors'
import formBody from '@fastify/formbody'
import fastifySensible from '@fastify/sensible'
import fastify, { FastifyInstance } from 'fastify'
import { config } from './config'
import qs from 'qs';
import * as dotenv from 'dotenv'


const build = (): FastifyInstance => {
  // TODO: [Philip] - Whereas this shifts from convict to dotenv, is it ideal for externally defined variables like ones stored in vault?
  dotenv.config()
  const app = fastify({
    disableRequestLogging: true,
    logger: {
      base: null,
      level: config.LOG.LEVEL,
    },
  })

  app.register(formBody, {
    parser: str => qs.parse(str)
  })
  app.register(fastifyCors, { origin: true })
  app.register(fastifySensible)

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
import fastifyCors from '@fastify/cors'
import formBody from '@fastify/formbody'
import fastifySensible from '@fastify/sensible'
import fastify, { FastifyServerOptions } from "fastify";
import { config } from './config'
import qs from 'qs';
import * as dotenv from 'dotenv'
import prismaPlugin from '@plugins/db'
import natsPlugin from '@plugins/nats'
import redisPlugin from '@plugins/redis'
import { fastifyServerDevOptions } from "@dev/debug";
import ussdRoutes from "@routes/ussd";


const build = async () => {
  // TODO: [Philip] - Whereas this shifts from convict to dotenv, is it ideal for externally defined variables like ones stored in vault?
  dotenv.config()

  // set up fastify server options.
  let serverOptions: FastifyServerOptions = {
    disableRequestLogging: config.SERVER.DISABLE_REQUEST_LOGGING,
    logger: {
      base: null,
      level: config.LOG.LEVEL,
    },
    trustProxy: config.SERVER.TRUST_PROXY_ENABLED
  }

  // load dev configs if in development mode.
  if (config.DEV) {
    console.log('Running in development mode.')
    serverOptions = fastifyServerDevOptions
  }

  // create fastify app.
  const app = fastify(serverOptions)

  // register third-party plugins.
  app.register(formBody, {
    parser: str => qs.parse(str)
  })
  app.register(fastifyCors, { origin: true })
  app.register(fastifySensible)

  // register custom plugins
  app.register(natsPlugin)
  app.register(prismaPlugin)
  app.register(redisPlugin)

  // register routes.
  app.register(ussdRoutes, { prefix: `/${config.API.VERSION}/ussd` })

  // set up error handler.
  app.setErrorHandler<Error>(function(error, request, reply) {
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
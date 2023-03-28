import { fastifyServerDevOptions } from '@dev/debug';
import fastifyCors from '@fastify/cors';
import formBody from '@fastify/formbody';
import fastifyPostgres from '@fastify/postgres';
import fastifySensible from '@fastify/sensible';
import ethPlugin from '@plugins/eth';
import graphqlPlugin from '@plugins/graphql';
import natsPlugin from '@plugins/nats';
import redisPlugin from '@plugins/redis';
import ussdRoutes from '@routes/ussd';

import * as dotenv from 'dotenv';
import fastify, { FastifyServerOptions } from 'fastify';
import qs from 'qs';

import { config } from './config';

// TODO: [Philip] - Whereas this shifts from convict to dotenv, is it ideal for externally defined variables like ones stored in vault?
dotenv.config()

let serverOptions: FastifyServerOptions = {
  disableRequestLogging: config.SERVER.DISABLE_REQUEST_LOGGING,
  logger: {
    base: null,
    level: config.LOG.LEVEL
  },
  trustProxy: config.SERVER.TRUST_PROXY_ENABLED
}

// load dev configs if in development mode.
if (config.DEV) {
  console.debug('Running in development mode.')
  serverOptions = fastifyServerDevOptions
}

const app = fastify(serverOptions)

// register third-party plugins.
app.register(formBody, {
  parser: (str) => qs.parse(str)
})
app.register(fastifyCors, { origin: true })
app.register(fastifySensible)
app.register(fastifyPostgres, { connectionString: config.DATABASE.URL })

// register custom plugins
app.register(ethPlugin, { endpoint: config.RPC.ENDPOINT })
app.register(graphqlPlugin, {
  endpoint: config.CIC_GRAPH.GRAPHQL_ENDPOINT,
  secret: config.CIC_GRAPH.HASURA_ADMIN_SECRET
})
app.register(natsPlugin, {
  connOpts: {
    name: config.NATS.CLIENT_NAME,
    servers: [config.NATS.URL],
  },
  subjects: [ config.NATS.CHAIN.SUBJECTS ]
})
app.register(redisPlugin, { host: config.REDIS.HOST, port: config.REDIS.PORT })

// register routes.
app.register(ussdRoutes, { prefix: `/${config.API.VERSION}/ussd` })


// set up error handler.
app.setErrorHandler<Error>(function (error, request, reply) {
  app.log.error({ error: error.toString(), request })

  reply.status(500).send({
    error: 'INTERNAL',
    message: 'Internal server error',
    statusCode: 500
  })
})

export default app

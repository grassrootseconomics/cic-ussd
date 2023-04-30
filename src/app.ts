import fastifyCors from '@fastify/cors';
import formBody from '@fastify/formbody';
import fastifyPostgres from '@fastify/postgres';
import fastifySensible from '@fastify/sensible';
import ethPlugin from '@plugins/eth';
import graphqlPlugin from '@plugins/graphql';
import natsPlugin from '@plugins/nats';
import redisPlugin from '@plugins/redis';
import ussdRoutes from '@routes/ussd';
import fastify, { FastifyServerOptions } from 'fastify';
import qs from 'qs';

import { config } from '@/config';
import pino from 'pino';
import moment from 'moment-timezone';

export const logger = pino({
  name: config.LOG.NAME,
  level: config.LOG.LEVEL,
  ignore: 'pid,hostname',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: () => `,"time":"${moment(new Date(Date.now())).tz(config.TIMEZONE).format("DD-MM-YYYY HH:mm A")}"`,
})

let serverOptions: FastifyServerOptions = {
  disableRequestLogging: config.SERVER.DISABLE_REQUEST_LOGGING,
  logger: logger,
  trustProxy: config.SERVER.TRUST_PROXY_ENABLED
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
app.register(ethPlugin, { endpoint: config.CIC.RPC })
app.register(graphqlPlugin, {
  endpoint: `${config.CIC.GRAPH}/v1/graphql`,
  secret: config.CIC.GRAPH_SECRET
})
app.register(natsPlugin, {
  durableName: config.NATS.DURABLE_NAME,
  server: config.NATS.SERVER,
  streamName: config.NATS.STREAM_NAME,
  subject: config.NATS.SUBJECT,
})
app.register(redisPlugin, {
  ephemeralDsn: config.REDIS.EPHEMERAL_DSN,
  persistentDsn: config.REDIS.PERSISTENT_DSN,
})

// register routes.
app.register(ussdRoutes, { prefix: `/${config.API.VERSION}/ussd` })


// set up error handler.
app.setErrorHandler<Error>(function (error, request, reply) {
  app.log.error({ error: error.toString(), request })

  reply.status(500).send({
    error: 'INTERNAL',
    message: 'Internal server error.',
    statusCode: 500
  })
})

export default app

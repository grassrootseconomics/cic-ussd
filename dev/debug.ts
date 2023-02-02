import { FastifyServerOptions } from "fastify";
import { ConnectionOptions } from "nats";

export const fastifyServerDevOptions: FastifyServerOptions = {
  disableRequestLogging: false,
  logger: {
    base: null,
    level: 'debug'
  },
  trustProxy: true
}

export const natsConnectionDevOptions: ConnectionOptions = {
  debug: true,
  verbose: true
}
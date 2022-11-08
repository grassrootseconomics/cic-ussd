import { FastifyInstance } from 'fastify';

import config from './config/config'
import server from './server';


/**
 * It starts the server and listens on all interfaces
 * @param {FastifyInstance} fastify - FastifyInstance - the fastify instance
 */
async function initialize(fastify: FastifyInstance) {
  try {
    await fastify.ready();
    await fastify.listen({
      port: config.get('server.port'),
      host: '::',
    }); // listen on all interfaces
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

/* Starting the server and listening on all interfaces. */
initialize(server);

import Autoload from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import formBody from '@fastify/formbody';
import fastifySensible from '@fastify/sensible';
import fastify from 'fastify';

import config from './config/config';
import { createRedisClient } from './helpers/redis';
import { createJsonSerializer } from './helpers/serializer';
import logger from './tools/logger';

/* Creating a new instance of the fastify server. */
const server = fastify({
  logger: logger,
  trustProxy: true
});

/* Registering the plugins. */
server.register(fastifySensible);
server.register(fastifyCors, { origin: true });
server.register(formBody)

/* Registering the routes. */
server.register(Autoload, {
  dir: __dirname + '/api/routes',
  options: {
    cache: createRedisClient(),
    serializer: createJsonSerializer(),
    prefix: `/api/${config.get('api.version')}`,
  }
});

export default server

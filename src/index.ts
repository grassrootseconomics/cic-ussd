import app from "./app";
import { config } from "./config";
import { FastifyInstance } from "fastify";

/**
 * Description placeholder
 * @date 3/3/2023 - 10:43:49 AM
 *
 * @async
 * @param {FastifyInstance} fastify
 * @returns {*}
 */
async function init(fastify: FastifyInstance) {
  fastify.ready((error) => {
    if (error) {
      fastify.log.error(error);
      process.exit(1);
    }

    if (config.DEV) {
      fastify.log.debug(`Server routes: ${fastify.printRoutes()}`);
    }
  });

  fastify.listen({ host: config.SERVER.HOST, port: config.SERVER.PORT },
    (error) => {
      if (error) {
        fastify.log.error(error);
        process.exit(1);
      }
  });

  fastify.log.info('Starting server...')

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      app.log.info('Gracefully shutting down.')
      await app.close()
      return process.exit(0)
    })
  }
}

init(app)

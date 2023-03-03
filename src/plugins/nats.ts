import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ConnectionOptions, connect, NatsError, Msg } from "nats";
import { config } from "@src/config";
import { natsConnectionDevOptions } from "@dev/debug";
import { processMessage } from "@lib/natsHandler";

/**
 * Interface for NatsPlugin options.
 * @interface NatsPluginOptions
 */
interface NatsPluginOptions {
  connOpts: ConnectionOptions;
  subject: string;
}

/**
 * A Fastify plugin to connect to NATS messaging system.
 *
 * @param fastify - Fastify instance.
 * @param options - NatsPluginOptions.
 * @throws Error if NATS server URL is not specified.
 */
const natsPlugin: FastifyPluginAsync<NatsPluginOptions> = async (fastify, options) => {

  let { connOpts, subject } = options;

  if (connOpts.servers.length === 0) {
    throw new Error("NATS server URL not specified.");
  }


  if(config.DEV) {
    connOpts = { ...connOpts, ...natsConnectionDevOptions }
  }

  const nc = await connect( connOpts);
  fastify.log.info(`Connected to NATS server at ${connOpts.servers[0]}`);

  const handler = async (err: NatsError, msg: Msg) => {
    if (err) {
      fastify.log.error(err);
      return;
    }
    await processMessage(fastify.pg, fastify.graphql, msg, fastify.provider, fastify.redis)
  }

  if (subject) {
    fastify.log.info(`Subscribing to subject ${subject}`);
    nc.subscribe(subject, {
      callback: handler,
    });
  }

  fastify.addHook("onClose", async (instance) => {
    await nc.drain();
    await nc.close();
  })

}


export default fp(natsPlugin, {
  fastify: '4.x',
  name: 'nats-plugin'
})

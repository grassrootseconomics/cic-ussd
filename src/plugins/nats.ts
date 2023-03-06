import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ConnectionOptions, connect, NatsError, Msg } from "nats";
import { config } from "@src/config";
import { natsConnectionDevOptions } from "@dev/debug";
import { processMessage } from "@lib/natsHandler";

/**
 * Description placeholder
 *
 * @interface NatsPluginOptions
 * @typedef {NatsPluginOptions}
 */
interface NatsPluginOptions {
  /**
   * Description placeholder
   *
   * @type {ConnectionOptions}
   */
  connOpts: ConnectionOptions;
  /**
   * Description placeholder
   *
   * @type {string}
   */
  subject: string;
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:50:42 AM
 *
 * @async
 * @param {*} fastify
 * @param {*} options
 * @returns {*}
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

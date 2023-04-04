import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { connect, ConnectionOptions, Msg, NatsError } from 'nats';
import { processMessage } from '@lib/natsHandler';


interface NatsPluginOptions {
  connOpts: ConnectionOptions;
  subjects: string[];
}

const natsPlugin: FastifyPluginAsync<NatsPluginOptions> = async (fastify, options) => {

  let { connOpts, subjects } = options;

  if (connOpts.servers?.length === 0) {
    throw new Error("NATS server URL not specified.");
  }

  const nc = await connect( connOpts);
  fastify.log.debug(`Connected to NATS server at ${connOpts?.servers?[0]: []}.`);

  const handler = async (err: NatsError | null, msg: Msg) => {
    if (err) {
      fastify.log.error(err);
      return;
    }
    await processMessage(fastify.pg, fastify.graphql, msg, fastify.provider, fastify.p_redis)
  }

  for (const subject of subjects) {
    fastify.log.debug(`Subscribing to subject ${subject}.`);
    nc.subscribe(subject, {
      callback: handler,
    });
  }

  fastify.addHook("onClose", async (_) => {
    await nc.drain();
    await nc.close();
  })

}


export default fp(natsPlugin, {
  fastify: '4.x',
  name: 'nats-plugin'
})

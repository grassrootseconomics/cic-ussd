import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AckPolicy, connect, consumerOpts, DeliverPolicy, JsMsg, NatsError, ReplayPolicy } from 'nats';
import { processMessage } from '@lib/nats';
import { config } from '@/config';

interface NatsPluginOptions {
  durableName: string;
  server: string;
  streamName: string;
  subject: string;
}

const natsPlugin: FastifyPluginAsync<NatsPluginOptions> = async (fastify, options) => {
  const natsConnection = await connect({ debug: config.DEV, servers: [options.server] });
  fastify.log.debug(`Connected to NATS server at: ${options.server}`);
  const jetStreamManager = await natsConnection.jetstreamManager();
  const jetStreamClient = natsConnection.jetstream();

  const consumerConfig = {
    ack_policy: AckPolicy.Explicit,
    deliver_subject: `deliver-${options.durableName}`,
    durable_name: options.durableName,
    deliver_policy: DeliverPolicy.All,
    replay_policy: ReplayPolicy.Instant
  };

  await jetStreamManager.consumers.add(options.streamName, consumerConfig);

  const opts = consumerOpts(consumerConfig);

  opts.bind(options.streamName, options.durableName)
  opts.callback(async (error: NatsError | null, message: JsMsg | null) => {

    if (!message) return;

    if (error) {
      fastify.log.error(`Nats error occurred: ${error.message}`);
    }

    if(message) {
      try {
        await processMessage(fastify.pg, fastify.graphql, message, fastify.provider, fastify.p_redis, fastify.atNotifier);
        message.ack()
      } catch (error: any) {
        fastify.log.error(`Error processing NATS message: ${error.message}`);
        message.nak(50000);
      }
    }
  });

  const subscription = await jetStreamClient.subscribe(`${options.streamName}.${options.subject}`, opts)

  fastify.addHook('onClose', async (_) => {
    await subscription.drain();
    subscription.unsubscribe();
    await natsConnection.drain();
    await natsConnection.close();
  });
};

export default fp(natsPlugin, {
  fastify: '4.x',
  name: 'nats-plugin',
});

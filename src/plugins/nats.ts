import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AckPolicy, connect, consumerOpts, DeliverPolicy } from 'nats';
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
  };

  await jetStreamManager.consumers.add(options.streamName, consumerConfig);

  const opts = consumerOpts(consumerConfig);

  opts.bind(options.streamName, options.durableName)

  const subscription = await jetStreamClient.subscribe(`${options.streamName}.${options.subject}`, opts)
  let processing = true;

  const done = async () => {
    for await (const message of subscription) {
      if (!processing) break;

      try {
        await processMessage(fastify.pg, fastify.graphql, message, fastify.provider, fastify.p_redis);
        message.ack();
      } catch (error: any) {
        fastify.log.error(`Error processing NATS message: ${error.message}`);
        message.nak(50000);
      }
    }
  };

  done().catch((err) => {
    fastify.log.error(`Error processing NATS message: ${err.message}`);
  });

  fastify.addHook('onClose', async (_) => {
    processing = false;
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

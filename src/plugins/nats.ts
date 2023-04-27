import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AckPolicy, connect, consumerOpts, DeliverPolicy, JsMsg } from 'nats';
import { processMessage } from '@lib/nats';
import { config } from '@/config';

interface NatsPluginOptions {
  durableName: string;
  server: string;
  streamName: string;
  subject: string;
}

async function handleMessage(fastify: any, message: JsMsg | null) {
  if(message){
      try {
      await processMessage(fastify.pg, fastify.graphql, message, fastify.provider, fastify.p_redis);
    } catch (error: any) {
      fastify.log.error(`Error processing NATS message: ${error.message}`);
      // requeue message after 50 seconds
      message.nak(50000);
    }
  }
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

  opts.callback((error, msg) => {
    if (error) {
      fastify.log.error(`Error processing NATS message: ${error.message}`);
      msg?.nak();
    } else {
      handleMessage(fastify, msg);
    }
  });

  opts.bind(options.streamName, options.durableName)

  await jetStreamClient.subscribe(`${options.streamName}.${options.subject}`, opts)

  fastify.addHook("onClose", async (instance) => {
    await natsConnection.drain();
    await natsConnection.close();
  })

};

export default fp(natsPlugin, {
  fastify: '4.x',
  name: 'nats-plugin',
});

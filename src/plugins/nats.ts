import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { config } from "@src/config";
import { connect, ConnectionOptions, NatsConnection } from "nats";


declare module 'fastify' {
  interface FastifyInstance {
    natsConnection: NatsConnection;
  }
}
const natsService: FastifyPluginAsync = async (fastify, options) => {
  let natsOptions: ConnectionOptions = {
    name: config.NATS.CLIENT_NAME,
    servers: [config.NATS.URL],
  }

   if (config.DEV) {
     natsOptions.debug = true;
     natsOptions.verbose = false;
   }

   if (natsOptions.servers === undefined || natsOptions.servers === null || natsOptions.servers.length < 1) {
     throw new Error(`Must specify NATS Server/s URL.`)
  }
   // handle connection to nats.
   await initConnectionToNats(fastify, natsOptions);
}

async function initConnectionToNats(fastify: FastifyInstance, natsOptions: ConnectionOptions) {

   // initiate nats connection
   let natsConnection: NatsConnection;

  try {
    fastify.log.info(`Connecting to NATS server: ${config.NATS.URL}.`);
    natsConnection = await connect(natsOptions);

    // pass the connection to the fastify instance
    fastify.decorate("natsConnection", natsConnection);
  } catch (error) {
    fastify.log.error(`Failed to connect to NATS server: ${config.NATS.URL}.`);
    throw error;
  }

  // make sure to gracefully drain the client in the event of server shutdown.
  // TODO: [Philip x Sohail] - What happens when a pod is killed/deleted?
  //  Does this get called?
  //  If so, should we track the last block processed and resume from there?
  //  How do we do that?
  fastify.addHook("onClose", async (instance) => {
    if (config.NATS.DRAIN_ON_SHUTDOWN) {
      fastify.log.info("Draining NATS connection.");
      await natsConnection.drain();
    } else {
      fastify.log.info("Flushing NATS connection.");
      await natsConnection.flush();
      await natsConnection.close();
    }
  });
}

export default fp(natsService, {
  fastify: "4.x",
  name: "chain-events-handler",
});
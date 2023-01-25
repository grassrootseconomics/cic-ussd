// create subscription to nats
import { FastifyInstance } from "fastify";
import { config } from "@src/config";
import { Codec, JSONCodec, Msg } from "nats";


interface TransferEvent {
  block: number;
  from: string;
  success: boolean;
  to: string;
  tokenAddress: string;
  transactionHash: string;
  transactionIndex: number;
  value: number;
}

export async function initChainEventsHandler(fastify: FastifyInstance){

  // initialize subscription.
  fastify.log.info(`Subscribing to NATS subject: ${config.NATS.SUBJECT}.`);
  const subscription = fastify.natsConnection.subscribe(config.NATS.SUBJECT, {

  });

  // create codec for decoding messages.
  const codec = JSONCodec<TransferEvent>();

  // iterate over subscription.
  for await (const msg of subscription) {
    await processMessage(codec, fastify, msg);
  }
}

async function processMessage(codec: Codec<TransferEvent>, fastify: FastifyInstance, msg: Msg) {

  // TODO: [Philip] - Implement message formatting for porting to Jessamy.
  let message: TransferEvent | null = null;
  switch(msg.subject){
     case "CHAIN.mintTo":
       message = codec.decode(msg.data);
       fastify.log.info(`MintedTo ${message.value} ${message.tokenAddress} to ${message.to}.`);
       break;
     case "CHAIN.transfer":
       message = codec.decode(msg.data);
       fastify.log.info(`Transferred ${message.value} ${message.tokenAddress} to ${message.to}.`);
       break;
     case "CHAIN.transferFrom":
       message = codec.decode(msg.data);
       fastify.log.info(`TransferredFrom ${message.value} ${message.tokenAddress} to ${message.to}.`);
       break;
     default:
        fastify.log.warn(`Message subject: ${msg.subject} not recognized. Ignoring message`);
        break;
  }
}
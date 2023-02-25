import { FastifyReply, FastifyRequest } from "fastify";
import { UssdContext } from "@utils/context";
import { processRequest } from "@services/stateMachine/service";
import { findAccountByPhoneNumber } from "@db/models/account";
import L from "@lib/i18n/i18n-node"
import { supportedLanguages } from "@services/stateMachine/aux/guards/languages";
import { Locales } from "@lib/i18n/i18n-types";


export interface UssdSessionRequest extends FastifyRequest {
  ussdContext: UssdContext | {};
}

declare module "fastify" {
  interface FastifyRequest {
    ussdContext: UssdContext | {};
  }
}

export async function ussdSessionHandler(request: UssdSessionRequest, reply: FastifyReply) {
  const client = await request.server.pg.connect();
  const redis = request.server.redis;

  try {
    // get the ussd context from the request
    const ussdContext = request.ussdContext as UssdContext;

    // update ussd context with db and redis clients
    ussdContext.db = client;

    // update the account in the ussd context
    ussdContext.account = await findAccountByPhoneNumber(client, ussdContext.phoneNumber) ?? null;

    // process the request
    const response = await processRequest(client, redis, ussdContext);

    // send the response
    reply.send(response);

  } catch (error) {
    console.error(`Error processing request: ${error}.`)
    reply.send(error);
  }

}
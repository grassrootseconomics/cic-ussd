import { FastifyReply, FastifyRequest } from "fastify";
import { UssdContext } from "@utils/context";


export interface UssdSessionRequest extends FastifyRequest {
  ussdContext: UssdContext | {};
}

declare module "fastify" {
  interface FastifyRequest {
    ussdContext: UssdContext | {};
  }
}

export async function ussdSessionHandler(request: UssdSessionRequest, reply: FastifyReply) {
  reply.send({
    "CON": "Welcome to the USSD session"
  })
}
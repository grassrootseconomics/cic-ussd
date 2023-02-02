import { FastifyInstance } from "fastify";
import { ussdSessionHandler } from "@src/services/ussdSession";
import { ATOnRequestHook, ATPreHandlerHook, ATRequestBody } from "@src/services/africasTalking";

export default async function ussdRoutes(fastify: FastifyInstance, options: any) {

  // add route to handle AT ussd requests.
  // TODO[Philip]: Does this constrain the hooks to only be used for this route?
  fastify.route({
    method: "POST",
    url: "/africasTalking",
    onRequest: ATOnRequestHook,
    preHandler: ATPreHandlerHook,
    handler: ussdSessionHandler,
    schema: {
      body: ATRequestBody
    }
  });

  fastify.route({
    method: "POST",
    url: "/debug",
    handler: async (request, reply) => {
      reply.send({
        endpoint: "debug",
      })
    }
  });
}

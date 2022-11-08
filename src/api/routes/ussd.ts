import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { JsonSerializer } from 'typescript-json-serializer';

import { getErrors } from '../../helpers/errors';
import { translate } from '../../helpers/translation';
import { UssdRequestHandler } from '../../services/handlers/ussdRequestHandler';
import { MachineService } from '../../services/ussd/stateManager';


export default async function ussd(fastify: FastifyInstance, options: { cache: Redis, serializer: JsonSerializer }) {
  fastify.post(
    '/ussd',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const contextObject = await new UssdRequestHandler(request).handle(options.cache, options.serializer);
        const machineService = new MachineService(contextObject);
        const state = await machineService.handleUssdRequest();
        const response = await translate("en", state, { balance: '100' });
        return reply.send(response);
      } catch (e: unknown) {
        const error = getErrors(e);
        return reply.status(500).send({message : error});
      }
    }
  );
}

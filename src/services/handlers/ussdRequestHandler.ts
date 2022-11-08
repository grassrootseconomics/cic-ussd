import { FastifyRequest } from 'fastify';
import { Redis } from 'ioredis';
import { JsonSerializer } from 'typescript-json-serializer';

import config from '../../config/config';
import { UssdContext } from '../../helpers/context';
import {
  AfricasTalkingRequest,
  NexahRequest
} from '../interfaces/telcoRequest';

import { AfricasTalkingRequestHandler } from './africasTalkingRequest';
import { NexahRequestHandler } from './nexahRequest';


export class UssdRequestHandler {
  request: FastifyRequest

  constructor(request: FastifyRequest) {
    this.request = request;
  }

  async handle(cache: Redis, serializer: JsonSerializer): Promise<UssdContext> {
    let requestHandler;
    if (config.get('africasTalking.validIps').includes(this.request.ip)) {
      requestHandler = new AfricasTalkingRequestHandler(this.request.body as AfricasTalkingRequest, this.request.headers['content-type'] as string);
    } else if (config.get('nexah.validIps').includes(this.request.ip)) {
      requestHandler = new NexahRequestHandler(cache, this.request.body as NexahRequest, this.request.headers['content-type'] as string, serializer);
    } else {
      throw new Error(`Invalid IP address: ${this.request.ip}`);
    }
    return requestHandler.parse();
  }

}

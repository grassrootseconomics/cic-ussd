import { FastifyReply, FastifyRequest } from 'fastify';
import { config } from '@/config';
import { PostgresDb } from '@fastify/postgres';
import { Redis as RedisClient } from 'ioredis';
import { CacheService } from '@services/redis';
import { SystemGuardian } from '@db/models/guardian';
import { SystemError } from '@lib/errors';
import { logger } from '@/app';
import { handleResults, sanitizePhoneNumber } from '@lib/ussd';

export async function systemGuardiansHandler(request: FastifyRequest, reply: FastifyReply){
  // handle retrieving system guardians
  if (request.method === 'GET'){
    try {
      const systemGuardians = await new SystemGuardianService(request.server.pg, request.server.p_redis).getAllGuardians() || [];
      reply.code(200).send({
        message: 'Success',
        success: true,
        data: systemGuardians
      })
    } catch (error: any){
      logger.error(error);
      reply.code(500).send({
        message: error.message,
        success: false
      })
    }
  }

  // handle adding system guardians
  if (request.method === 'POST'){
    try {
      const { phoneNumber } = request.body as { phoneNumber: string };
      await new SystemGuardianService(request.server.pg, request.server.p_redis).addGuardian(phoneNumber);
      reply.code(200).send({
        message: 'Success',
        success: true
      })
    } catch (error: any){
      logger.error(`Error adding system guardian: ${error.message}. Stack: ${error.stack}`);
      reply.code(500).send({
        message: error.message,
        success: false
      })
    }
  }

  // handle removing system guardians
  if (request.method === 'DELETE'){
    try {
      const { phoneNumber } = request.body as { phoneNumber: string };
      await new SystemGuardianService(request.server.pg, request.server.p_redis).removeGuardian(phoneNumber);
      reply.code(200).send({
        message: 'Success',
        success: true
      })
    } catch (error: any){
      logger.error(`Error removing system guardian: ${error.message}. Stack: ${error.stack}`);
      reply.code(500).send({
        message: error.message,
        success: false
      })
    }
  }
}

export async function systemGuardiansPreHandler(request: FastifyRequest, reply: FastifyReply){
  const auth = request.headers.authorization;
  if(!auth){
    reply.code(401).send({
      message: 'Unauthorized',
      success: false
    })
  } else {
    const secret = auth.replace('Bearer ', '');
    if (secret !== config.SYSTEM.SECRET){
      reply.code(401).send({
        message: 'Unauthorized',
        success: false
      })
    }

    // sanitize phone number
    if (request.method === 'POST' || request.method === 'DELETE'){
      const { phoneNumber } = request.body as { phoneNumber: string };
      if(!phoneNumber){
        reply.code(400).send({
          message: 'Bad Request',
          success: false
        })
      } else {
        try {
          const sanitized = sanitizePhoneNumber(phoneNumber, "KE");
          return request.body = { phoneNumber: sanitized };
        } catch (error: any) {
          reply.code(400).send({
            message: error.message,
            success: false
          })
        }
      }
    }
  }
}

export class SystemGuardianService {

  private readonly cacheService;

  constructor(private db: PostgresDb, private redis: RedisClient) {
    this.cacheService = new CacheService<string[]>(redis, 'system-guardians');
  }

  public async addGuardian(phoneNumber: string) {
    const systemGuardians = await this.getAllGuardians() || [];
    if(systemGuardians.includes(phoneNumber)){
      throw new SystemError(`Guardian: ${phoneNumber} already exists.`);
    }
    const updated = [...systemGuardians, phoneNumber];
    const results = await Promise.allSettled([
      new SystemGuardian(this.db).insertGuardian(phoneNumber),
      this.cacheService.set(updated)
    ]);
    await handleResults(results);
  }

  public async removeGuardian(phoneNumber: string) {
    const systemGuardians = await this.getAllGuardians() || [];
    if(!systemGuardians.includes(phoneNumber)){
      throw new SystemError(`Guardian: ${phoneNumber} does not exist.`);
    }
    const updated = systemGuardians.filter((guardian) => guardian !== phoneNumber);
    const results = await Promise.allSettled([
      new SystemGuardian(this.db).deleteGuardian(phoneNumber),
      this.cacheService.set(updated)
    ]);
    await handleResults(results);
  }

  public async getAllGuardians() {
  try {
    const cachedSystemGuardians = await this.cacheService.get() || [];
    if (cachedSystemGuardians.length > 0) {
      return cachedSystemGuardians;
    }

    const systemGuardians = await new SystemGuardian(this.db).selectAllGuardians();
    if (systemGuardians && systemGuardians.length > 0) {
      await this.cacheService.set(systemGuardians);
      return systemGuardians;
    }

    logger.debug(`No system guardians found`);
    return [];
  } catch (error: any) {
    logger.error('Error getting guardians:', error.message);
  }
}

  public async isSystemGuardian(phoneNumber: string) {
    const systemGuardians = await this.getAllGuardians() || [];
    return systemGuardians.includes(phoneNumber);
  }

}
import { PostgresDb } from '@fastify/postgres';
import { Redis as RedisClient } from 'ioredis';
import { Session, SessionInterface, SessionType } from '@db/models/session';
import { CacheService } from '@services/redis';
import { handleResults, Ussd } from '@lib/ussd';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SystemError } from '@lib/errors';
import { Connections } from '@machines/utils';
import { UserService } from '@services/user';
import { buildResponse, MachineContext } from '@services/machine';
import { fallbackLanguage, tHelpers } from '@i18n/translators';
import { logger } from '@/app';

declare module 'fastify' {
  interface FastifyRequest {
    uContext: {  }
  }
}

export interface SessionRequest extends FastifyRequest {
  uContext: {
    ussd?: Ussd
  }
}

export async function handleUser(connections: Connections, phoneNumber: string) {
  const { db, graphql, provider, redis} = connections

  const userService = new UserService(phoneNumber, redis.persistent)

  let user = await userService.get(undefined, db, graphql, provider)
  if(!user) {
    return null
  }

  // update active voucher's balance
  if (user.account?.activated_on_ussd && user.vouchers?.active) {
    return await userService.updateBalance(
      user.account.address,
      user.vouchers.active.address,
      provider
    )
  }

  return user
}

async function buildContext(request: SessionRequest): Promise<MachineContext> {

  // define connection object
  const connections: Connections =  {
    db: request.server.pg,
    graphql: request.server.graphql,
    provider: request.server.provider,
    redis: {
      ephemeral: request.server.e_redis,
      persistent: request.server.p_redis
    }
  }

  // extract ussd object from request
  if(!request.uContext?.ussd){
    throw new SystemError("An error may have occurred while parsing the ussd request. No ussd 'uContext' object found in SessionRequest")
  }
  const ussd = request.uContext.ussd

  let context = {
    connections,
    data: {},
    errorMessages: [],
    ussd
  }

  // define user context object depending on user object and status
  let user = await handleUser(connections, ussd.phoneNumber)
  if (!user){
    return context
  }
  return {...context, user}
}

export async function sessionHandler(request: SessionRequest, reply: FastifyReply){
  try {
    const context = await buildContext(request)
    const sessionService = new SessionService(context.connections.db, context.ussd.requestId, context.connections.redis.ephemeral)
    let session = await sessionService.get() as SessionInterface
    if(!session){
      session = await sessionService.create({
        extId: context.ussd.requestId,
        inputs: [context.ussd.input],
        phoneNumber: context.ussd.phoneNumber,
        serviceCode: context.ussd.serviceCode,
        sessionType: SessionType.INITIAL,
        version: 1
      })
    }
    if (session.data && Object.keys(session.data).length > 0){
      context.data = session.data
    }
    const response = await buildResponse(context, session)
    reply.send(response)
  } catch (error: any){
    logger.error(`EXIT LEVEL ERROR: ${error.message} STACK: ${error.stack}`)
    const response = tHelpers("systemError", fallbackLanguage())
    reply.send(response)
  }
}

export class SessionService {

  private cache: CacheService<SessionInterface>

  constructor(private db: PostgresDb, private extId: string, private redis: RedisClient) {
    this.cache = new CacheService<SessionInterface>(redis, extId)
  }

  public async create(data: Partial<SessionInterface>) {
    const results = await Promise.allSettled([
      new Session(this.db).insertSession(data),
      this.cache.set(data, 180)
    ])
    const [dbResult] = handleResults(results)
    return dbResult
  }

  public async get() {
    return await this.cache.get()
  }

  public async update(data: Partial<SessionInterface>) {
    const results = await Promise.allSettled([
      new Session(this.db).setSession(data),
      this.cache.update(data)
    ])
    handleResults(results)
  }
}

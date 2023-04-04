import { findPhoneNumber } from '@db/models/account';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Redis as RedisClient } from 'ioredis';
import { machineService } from '@services/machine';
import { Cache } from '@utils/redis';
import { PostgresDb } from '@fastify/postgres';
import { Provider } from 'ethers';
import { BaseContext, User, Ussd } from '@machines/utils';
import { retrieveWalletBalance } from '@lib/ussd/account';
import { fallbackLanguage, tHelpers } from '@i18n/translators';
import { MissingProperty, SystemError } from '@lib/errors';
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

export async function validateCacheUser(user: Pick<User, 'account' | 'vouchers'>) {
  if (!user.account) {
    throw new MissingProperty(`User object is missing 'account' property`)
  }
  if (!user.vouchers.active){
    throw new MissingProperty(`User object is missing 'vouchers.active' property`)
  }

  return user
}

export async function updateBalance(provider: Provider, user: Pick<User, 'account' | 'vouchers'>){
  const { account, vouchers } = await validateCacheUser(user)
  if(!vouchers.active){
    throw new MissingProperty(`User object is missing 'vouchers.active' property`)
  }
  return await retrieveWalletBalance(account.address, vouchers.active.address, provider)
}


async function loadUser(db: PostgresDb, redis: RedisClient, phoneNumber: string, provider: Provider) {
  const cache = new Cache<User>(redis, phoneNumber);
  let user = await cache.getJSON()

  if (!user) {
    return null;
  }

  if (!user?.account) {
    const account = await findPhoneNumber(db, phoneNumber);
    if (!account) {
      return null;
    }
    user = { ...user, account };
  }

  if (user.account?.activated_on_chain) {
    const balance = await updateBalance(provider, user);
    return await cache.updateJSON({
      vouchers: {
        ...(user.vouchers || {}),
        active: {
          ...(user.vouchers.active),
          balance
        }
      },
    });

  }

  return user;
}


export async function sessionHandler (request: SessionRequest, reply: FastifyReply) {

  if(!request.uContext?.ussd){
    throw new SystemError("An error may have occurred while parsing the ussd request. No ussd 'uContext' object found in SessionRequest")
  }

  const { pg: db, graphql, provider, e_redis, p_redis } = request.server
  const resources = { db, graphql, provider, e_redis, p_redis }
  const user = await loadUser(db, p_redis, request.uContext?.ussd.phoneNumber, provider) as User
  const context: BaseContext = { data: {}, resources, ussd: request.uContext?.ussd, user }

  try {
    const response = await  machineService(context)
    reply.send(response)
  } catch (error:any) {
    logger.error(`EXIT LEVEL ERROR: ${error.message} STACK: ${error.stack}`)
    const language = user?.account?.language || fallbackLanguage()
    const response = tHelpers("systemError", language)
    reply.send(response)
  }
}

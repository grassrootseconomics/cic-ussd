import { findPhoneNumber } from '@db/models/account';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Redis as RedisClient } from 'ioredis';
import { machineService } from '@services/machine';
import { Cache } from '@utils/redis';
import { PostgresDb } from '@fastify/postgres';
import { Provider } from 'ethers';
import { User, Ussd } from '@machines/utils';
import { retrieveWalletBalance } from '@lib/ussd/account';
import { tHelpers } from '@src/i18n/translator';
import { supportedLanguages } from '@lib/ussd/utils';

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

async function updateBalance(provider: Provider, user: Partial<User>){
  const { account: { address }, vouchers: { active: { address: contract } } } = user
  return await retrieveWalletBalance(address, contract, provider)
}


async function loadUser(db: PostgresDb, redis: RedisClient, phoneNumber: string, provider: Provider) {
  const cache = new Cache(redis, phoneNumber)
  let user = await cache.getJSON<User>()

  if (!user) {
    user = await findPhoneNumber(db, phoneNumber)
    if (user) {
      await cache.setJSON(user)
    }
    return user
  }
  if (user.account.activated_on_chain === true) {
    const balance = await updateBalance(provider, user)
    await cache.updateJSON({
      vouchers: {
        ...(user.vouchers || {}),
        active: {
          balance
        }
      }
    })
  }
  return user
}

export async function sessionHandler (request: SessionRequest, reply: FastifyReply) {
  const { pg: db, graphql, provider, e_redis, p_redis } = request.server
  request.uContext["resources"] = { db, graphql, provider, e_redis, p_redis }
  const user = await loadUser(db, p_redis, request.uContext.ussd.phoneNumber, provider)
  request.uContext["user"] = user
  try {
    const response = await machineService(request.uContext)
    reply.send(response)
  } catch (error) {
    const language = user?.account?.language || Object.values(supportedLanguages.fallback)[0]
    const response = await tHelpers("systemError", language)
    reply.send(response)
  }
}

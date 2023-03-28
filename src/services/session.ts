import { findPhoneNumber } from '@db/models/account';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Redis as RedisClient } from 'ioredis';
import { machineService } from '@services/machine';
import { Cache } from '@utils/redis';
import { PostgresDb } from '@fastify/postgres';
import { Provider } from 'ethers';
import { User } from '@machines/utils';
import { retrieveWalletBalance } from '@lib/ussd/account';

declare module 'fastify' {
  interface FastifyRequest {
    uContext: {  }
  }
}

export interface SessionRequest extends FastifyRequest {
  uContext: { }
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



async function processRequest (context) {
  const { resources: { db, p_redis, provider  }, ussd: { phoneNumber } } = context
  context["user"] = await loadUser(db, p_redis, phoneNumber, provider)
  return await machineService(context)
}

export async function sessionHandler (request: SessionRequest, reply: FastifyReply) {
  const { pg: db, graphql, provider, e_redis, p_redis } = request.server
  request.uContext["resources"] = { db, graphql, provider, e_redis, p_redis }
  try {
    const response = await processRequest(request.uContext)
    reply.send(response)
  } catch (error) {
    reply.send(error)
  }
}

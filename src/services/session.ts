import {Account, findPhoneNumber} from "@db/models/account";
import {retrieveWalletBalance} from "@lib/ussd/account";
import {ActiveVoucher, getVouchers, VoucherMetadata} from "@lib/ussd/voucher";

import {Provider} from "ethers";
import {FastifyReply, FastifyRequest} from "fastify";
import {Redis as RedisClient} from "ioredis";
import {machineService} from "@services/machine";
import {Cache} from "@utils/redis";
import {PostgresDb} from "@fastify/postgres";
import {Address, getTransactionTag} from "@lib/ussd/utils";
import {getProfile} from "@lib/graph/user";

declare module 'fastify' {
  interface FastifyRequest {
    uContext: {  }
  }
}

export interface SessionRequest extends FastifyRequest {
  uContext: { }
}

async function getActiveVoucher (address: Address, provider: Provider, redis: RedisClient) {
  try {
    const voucher = await getVouchers<ActiveVoucher>(address, redis, VoucherMetadata.ACTIVE)
    const balance = await retrieveWalletBalance(address, voucher.address, provider) || voucher.balance
    return {
      address: voucher.address,
      balance,
      symbol: voucher.symbol
    }
  } catch (error) {
    console.error(`CAUGHT ERROR: ${error}`)
    throw new Error('Account present but not properly set up on ussd.')
  }
}

async function loadAccount(db: PostgresDb, redis: RedisClient, phoneNumber: string) {
  const cache = new Cache(redis, phoneNumber)
  let account = await cache.getJSON()
  if (account === undefined) {
    console.debug(`Loaded account from db: ${phoneNumber}`)
    account = await findPhoneNumber(db, phoneNumber)
    if (account !== undefined && account !== null) {
      await cache.setJSON(account)
    }
  }
  return account
}

async function processRequest (context) {
  const { resources: { db, graphql, provider, p_redis  }, ussd: { phoneNumber } } = context
  const account = await loadAccount(db, p_redis, phoneNumber)
  if (account) {
    const { address, id } = account
    context["user"] = {}
    context.user.account = account
    context.user.activeVoucher = await getActiveVoucher(address, provider, p_redis)
    context.user.graph = await getProfile(address, graphql, id, p_redis)
    context.user.transactionTag = await getTransactionTag(address, p_redis) || phoneNumber
  }
  return await machineService(context)
}

export async function sessionHandler (request: SessionRequest, reply: FastifyReply) {
  const { pg: db, graphql, provider, e_redis, p_redis } = request.server
  request.uContext["resources"] = { db, graphql, provider, e_redis, p_redis }
  try {
    const response = await processRequest(request.uContext)
    reply.send(response)
  } catch (error) {
    console.error(`EXIT STACK TRACE: ${error.stack} `)
    reply.send(error)
  }
}

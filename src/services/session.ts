import { findPhoneNumber } from "@db/models/account";
import { retrieveWalletBalance, loadProfile } from "@lib/ussd/account";
import { ActiveVoucher, getVouchers, VoucherMetadata } from "@lib/ussd/voucher";

import { Provider } from "ethers";
import { FastifyReply, FastifyRequest } from "fastify";
import { Redis as RedisClient } from "ioredis";
import { machineService } from "@services/machine";

declare module 'fastify' {
  interface FastifyRequest {
    uContext: {  }
  }
}

export interface SessionRequest extends FastifyRequest {
  uContext: { }
}

async function getActiveVoucher (address: string, provider: Provider, redis: RedisClient) {
  try {
    const voucher = await getVouchers(redis, VoucherMetadata.ACTIVE, address) as ActiveVoucher
    const balance = await retrieveWalletBalance(address, voucher.address, provider) || voucher.balance
    return {
      address: voucher.address,
      balance,
      symbol: voucher.symbol
    }
  } catch (error) {
    console.error(error.stackTrace)
    throw new Error('Account present but not properly set up on ussd.')
  }
}

async function processRequest (context) {
  const { resources: { db, graphql, provider, redis  }, ussd: { phoneNumber } } = context
  const account = await findPhoneNumber(db, phoneNumber)
  context["user"] = {}
  if (account) {
    context.user.account = account
    context.user.activeVoucher = await getActiveVoucher(account.address, provider, redis)
    await loadProfile(account, db, graphql, redis)
  }
  return await machineService(context, redis)
}

/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {SessionRequest} request
 * @param {FastifyReply} reply
 * @returns {*}
 */
export async function sessionHandler (request: SessionRequest, reply: FastifyReply) {
  const { pg: db, graphql, provider, redis } = request.server
  request.uContext["resources"] = { db, graphql, provider, redis }
  try {
    const response = await processRequest(request.uContext)
    reply.send(response)
  } catch (error) {
    console.error(error.stackTrace)
    reply.send(error)
  }
}

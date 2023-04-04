import { Redis as RedisClient } from 'ioredis';
import { GraphQLClient } from 'graphql-request';
import { getVouchersByAddress } from '@lib/graph/voucher';
import { Address, handleResults } from '@lib/ussd/utils';
import { Cache } from '@utils/redis';

export interface ActiveVoucher {
  address: string
  balance: number
  symbol: string
}

export async function getVoucherSymbol(contractAddress: Address, graphql: GraphQLClient, redis: RedisClient): Promise<string> {
  let symbol = await redis.get(`address-symbol-${contractAddress}`)

  if (!symbol) {
    const voucher = await getVouchersByAddress(graphql, contractAddress)
    if (!voucher) {
      throw new Error(`Could not find voucher with address ${contractAddress}`)
    }
    symbol = voucher.symbol
    const cache = new Cache(redis, contractAddress)
    const results = await Promise.allSettled([
      await redis.set(`address-symbol-${contractAddress}`, symbol),
      await cache.setJSON(voucher)
    ])
    handleResults(results)
  }
  return symbol
}

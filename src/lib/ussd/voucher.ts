import { Cache } from '@utils/redis';
import { Redis as RedisClient } from 'ioredis';
import { GraphQLClient } from 'graphql-request';
import { getVouchersByAddress } from '@lib/graph/voucher';
import { Address, Symbol } from '@lib/ussd/utils';

export interface ActiveVoucher {
  address: string
  balance: number
  symbol: Symbol
}

export async function getVoucherSymbol(contractAddress: Address, graphql: GraphQLClient, redis: RedisClient): Promise<Symbol> {
  const cache = new Cache(redis, `address-symbol-${contractAddress}`)
  let symbol = await cache.get()

  if (!symbol) {
    const voucher = await getVouchersByAddress(graphql, contractAddress)
    if (voucher) {
      symbol = voucher.symbol
      await cache.set(symbol)
    } else {
      throw new Error(`Voucher with contract address ${contractAddress} not recognized.`)
    }
  }
  return symbol
}

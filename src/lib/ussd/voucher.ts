import {Cache} from "@utils/redis";
import {Redis as RedisClient} from "ioredis";
import {pointer} from "@lib/ussd/session";
import {GraphQLClient} from "graphql-request";
import {getVouchersByAddress} from "@lib/graph/voucher";
import {Address, Symbol} from "@lib/ussd/utils";

export enum VoucherMetadata {
  ACTIVE = 'ACTIVE',
  DIRECTORY = 'DIRECTORY',
  HELD = 'HELD',
  LAST_RECEIVED = 'LAST_RECEIVED',
  LAST_SENT = 'LAST_SENT',
}

export interface ActiveVoucher {
  address: string
  balance: number
  symbol: Symbol
}

export interface VoucherDirectory  extends ActiveVoucher {
  phoneNumber: string
  product: string
}

export async function setVouchers<T>(key: Address | Symbol, redis: RedisClient, voucher: ActiveVoucher | ActiveVoucher[] | VoucherDirectory | VoucherDirectory[], salt?: string) {
  const identifier = salt ? [key, salt] : [key];
  const cache = new Cache(redis, pointer(identifier));
  await cache.setJSON(voucher);
}

export async function getVouchers<T>(key: Address | Symbol, redis: RedisClient, salt?: string) {
  const identifier = salt ? [key, salt] : key;
  const cache = new Cache(redis, pointer(identifier));
  return await cache.getJSON();
}

export async function getVoucherSymbol(contractAddress: Address, graphql: GraphQLClient, redis: RedisClient): Promise<Symbol> {
  const cache = new Cache(redis, `address-symbol:${contractAddress}`)
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

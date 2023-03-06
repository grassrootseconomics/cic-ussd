import { GraphQLClient } from "graphql-request";
import { Redis as RedisClient } from "ioredis";
import { config } from "@src/config";
import { Cache } from "@utils/redis";
import { getActiveVouchers } from "@lib/graph/voucher";

export const supportedLanguages = {
  1: {
    en: 'English'
  },
  2: {
    sw: 'Swahili'
  },
  3: {
    kam: 'Kamba'
  },
  4: {
    kik: 'Kikuyu'
  },
  5: {
    miji: 'Mijikenda'
  },
  6: {
    luo: 'Luo'
  },
  7: {
    bor: 'Borana'
  },
  8: {
    fr: 'French'
  },
  fallback: {
    fb: 'sw'
  }
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:47:51 AM
 *
 * @export
 * @param {string} amount
 * @returns {number}
 */
export function cashRounding (amount: string): number {
  const dp = amount.indexOf('.')
  const fmtAmount = parseFloat(amount)
  if (dp > 8) {
    throw new Error('Precision too high.')
  }
  const truncatedAmount = Math.trunc(fmtAmount * 100) / 100
  return parseFloat(truncatedAmount.toFixed(2))
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:47:51 AM
 *
 * @export
 * @async
 * @param {GraphQLClient} graphql
 * @param {RedisClient} redis
 * @returns {unknown}
 */
export async function loadSysVouchers (graphql: GraphQLClient, redis: RedisClient) {
  console.debug('Loading system vouchers...')
  redis.select(config.REDIS.PERSISTENT_DATABASE)
  const vouchers = await getActiveVouchers(graphql)

  const cacheData = vouchers.reduce((acc, voucher) => {
    console.debug(`Preparing voucher ${voucher.symbol}...`)
    acc[voucher.symbol] = voucher
    return acc
  }, {})

  const cachePromises = Object.entries(cacheData).map(async ([key, data]) => {
    const cache = new Cache(redis, key)
    return await cache.setJSON(data)
  })

  return await Promise.all(cachePromises)
}
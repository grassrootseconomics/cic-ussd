import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { Cache } from '@utils/redis';
import { getActiveVouchers } from '@lib/graph/voucher';
import { getPersonalInformation } from '@lib/graph/user';

export type Address = `0x${string & { length: 42 }}`
export type Symbol = `Uppercase<${string}>`


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

export function cashRounding (amount: string): number {
  const dp = amount.indexOf('.')
  const fmtAmount = parseFloat(amount)
  if (dp > 8) {
    throw new Error('Precision too high.')
  }
  const truncatedAmount = Math.trunc(fmtAmount * 100) / 100
  return parseFloat(truncatedAmount.toFixed(2))
}

export async function loadSystemVouchers (graphql: GraphQLClient, redis: RedisClient) {
  console.debug('Loading system vouchers...')
  const vouchers = await getActiveVouchers(graphql)

  const CHUNK_SIZE = 50 // batch size
  const chunks = Array.from({ length: Math.ceil(vouchers.length / CHUNK_SIZE) }, (_, i) => vouchers.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE))

  const cacheDataPromises = await Promise.all(chunks.map(async (chunk) => {
    const cacheSetPromises = chunk.map((voucher) => {
      console.debug(`Preparing voucher ${voucher.symbol}...`)
      const cache = new Cache(redis, voucher.voucher_address)
      return cache.setJSON(voucher)
    })
    return await Promise.all(cacheSetPromises)
  }))

  const cacheMapPromises = await Promise.all(chunks.map(async (chunk) => {
    const cacheSetPromises = chunk.map((voucher) => {
      const cache = new Cache(redis, `address-symbol-${voucher.voucher_address}`)
      return cache.set(voucher.symbol)
    })
    return await Promise.all(cacheSetPromises)
  }))

  const results = await Promise.allSettled([...cacheDataPromises, ...cacheMapPromises])

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Promise ${index} failed with error: ${result.reason}`)
    } else {
      console.debug(`Promise ${index} succeeded with value: ${result.value}`)
    }
  })
  console.debug('System vouchers loaded.')
}

export async function getTag(phoneNumber: string, redis: RedisClient) {
  const cache = new Cache(redis, phoneNumber)
  return await cache.getJSON(['tag'])
}

export async function generateTag(address: Address, graphql: GraphQLClient, phoneNumber) {
  const personalInformation = await getPersonalInformation(address, graphql)
  const tag = `${personalInformation?.given_names ?? ''} ${personalInformation?.family_name ?? ''}`.trim()
  return tag ? `${tag} ${phoneNumber}` : phoneNumber
}
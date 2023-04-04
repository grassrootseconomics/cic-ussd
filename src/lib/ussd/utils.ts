import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { Cache } from '@utils/redis';
import { getActiveVouchers } from '@lib/graph/voucher';
import { getPersonalInformation } from '@lib/graph/user';
import { logger } from '@/app';
import { User } from '@machines/utils';
import { Locales } from '@i18n/i18n-types';
import { SystemError } from '@lib/errors';

export type Address = `0x${string & { length: 42 }}`

type SupportedLanguages = Record<Locales, string>

export const supportedLanguages: SupportedLanguages = {
  en: 'English',
  sw: 'Swahili'
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
  const vouchers = await getActiveVouchers(graphql)

  const CHUNK_SIZE = 50 // batch size
  const chunks = Array.from({ length: Math.ceil(vouchers.length / CHUNK_SIZE) }, (_, i) => vouchers.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE))

  const cacheDataPromises = await Promise.all(chunks.map(async (chunk) => {
    const cacheSetPromises = chunk.map((voucher) => {
      const cache = new Cache(redis, voucher.voucher_address)
      return cache.setJSON(voucher)
    })
    return await Promise.all(cacheSetPromises)
  }))

  const cacheMapPromises = await Promise.all(chunks.map(async (chunk) => {
    const cacheSetPromises = chunk.map((voucher) => {
      redis.set(`address-symbol-${voucher.voucher_address}`, voucher.symbol)
    })
    return await Promise.all(cacheSetPromises)
  }))

  const results = await Promise.allSettled([...cacheDataPromises, ...cacheMapPromises])
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error(`Error loading system voucher ${index}: ${result.reason}`)
    }
  })
}

export async function getTag(phoneNumber: string, redis: RedisClient) {
  const cache = new Cache<User>(redis, phoneNumber)
  const tag = await cache.getJSON(['tag'])
  return tag?.tag || phoneNumber
}

export async function generateTag(address: Address, graphql: GraphQLClient, phoneNumber: string) {
  const personalInformation = await getPersonalInformation(address, graphql)
  const tag = `${personalInformation?.given_names ?? ''} ${personalInformation?.family_name ?? ''}`.trim()
  return tag ? `${tag} ${phoneNumber}` : phoneNumber
}

export function handleResults(results: PromiseSettledResult<any>[]) {
  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => result.reason)

  if (errors.length) {
    throw new AggregateError(errors)
  }

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    throw new SystemError(`Error: ${result.reason}`);
  });
}

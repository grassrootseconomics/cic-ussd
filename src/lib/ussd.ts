import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { getActiveGraphVouchers, getGraphVoucherByAddress, Voucher } from '@lib/graph/voucher';
import { BaseMachineError, MachineError, SystemError } from '@lib/errors';
import { logger } from '@/app';
import { CacheService } from '@services/redis';
import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';
import { ethers, Provider } from 'ethers';
import moment from 'moment-timezone';
import { config } from '@/config';
import { getGraphAddressFromTill, getGraphAddressFromVpa } from '@lib/graph/user';

export interface CachedVoucher {
  address: string
  balance: number
  symbol: string
}

export interface Notifier {
  send(message: string, recipients: string[]): Promise<void>;
}

export interface Ussd {
  countryCode: CountryCode,
  input: string,
  phoneNumber: string,
  requestId: string,
  responseContentType: string,
  serviceCode: string,
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

export async function formatDate (date: Date): Promise<string> {
  return moment(date).tz(config.TIMEZONE).format('DD-MM-YYYY HH:mm A')
}

export async function getCountryCode (phoneNumber: string) {
  const formattedNumber = sanitizePhoneNumber(phoneNumber)
  const parsedPhoneNumber = parsePhoneNumber(formattedNumber)
  if (parsedPhoneNumber) {
    return parsedPhoneNumber.country
  } else {
    throw new Error(
      `Could not retrieve country code phone number: ${phoneNumber}`
    )
  }
}

export async function getSinkAddress(address: string, graphql: GraphQLClient, redis: RedisClient){
  try {
    const voucher = await getGraphVoucherByAddress(graphql, address)
    if (!voucher) {
      logger.error(`Could not find voucher with address ${address}`)
      return null
    }
    return voucher.sink_address
  } catch (error) {
    logger.error(`Error getting voucher: ${error}`)
    return null
  }
}

export async function getVoucherByAddress(address: string, graphql: GraphQLClient, redis: RedisClient){
  try {
    const cache = new CacheService<Voucher>(redis, address)
    const cachedVoucher = await cache.get()
    if (cachedVoucher) {
      return cachedVoucher
    }
    const voucher = await getGraphVoucherByAddress(graphql, address)
    if (!voucher) {
      logger.error(`Could not find voucher with address ${address}`)
      return null
    }
    return voucher
  } catch (error) {
    logger.error(`Error getting voucher: ${error}`)
    return null
  }
}

export async function getVoucherSymbol(address: string, graphql: GraphQLClient, redis: RedisClient): Promise<string | null> {
  try {
    let symbol = await redis.get(`address-symbol-${address}`)
    if (!symbol) {
      const voucher = await getGraphVoucherByAddress(graphql, address)
      if (!voucher) {
        logger.error(`Could not find voucher with address ${address}`)
        return null
      }
      symbol = voucher.symbol
      const cache = new CacheService<Voucher>(redis, address)
      const results = await Promise.allSettled([
        await redis.set(`address-symbol-${address}`, symbol),
        await cache.set(voucher)
      ])
      await handleResults(results)
    }
    return symbol
  } catch (error){
    logger.error(`Error getting voucher symbol: ${error}`)
    return null
  }
}

export async function getAddressFromTill(graphql: GraphQLClient, redis: RedisClient, till: string) {
  const cachedAddress =  await redis.get(`till-address-${till}`)
  if(cachedAddress) {
    return cachedAddress
  }
  const address = await getGraphAddressFromTill(graphql, till)
  if(!address) {
    return null
  }
  await redis.set(`till-address-${till}`, address)
  return address
}

export async function getAddressFromVpa(graphql: GraphQLClient, redis: RedisClient, vpa: string) {
  const cachedAddress =  await redis.get(`vpa-address-${vpa}`)
  if(cachedAddress) {
    return cachedAddress
  }
  const address = await getGraphAddressFromVpa(graphql, vpa)
  if(!address) {
    return null
  }
  await redis.set(`vpa-address-${vpa}`, address)
  return address
}

export async function handleResults<T = any>(results: PromiseSettledResult<any>[]) {
  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => result.reason);

  if (errors.length) {
    const errorMessage = errors
      .map((error, index) => `Error ${index + 1}: ${error.message || error}`)
      .join('\n');
    throw new SystemError(`Multiple errors may have occurred:\n${errorMessage}`);
  }

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value as T;
    }
    //TODO[Philip]: Emit error to Sentry
    throw new SystemError(`Error: ${result.reason}`);
  });
}

export async function loadSystemVouchers (graphql: GraphQLClient, redis: RedisClient) {
  try {
    const vouchers = await getActiveGraphVouchers(graphql)

    if (!vouchers.length) {
      logger.info('No active vouchers found.')
      return
    }

    const CHUNK_SIZE = 50
    const chunks = Array.from({ length: Math.ceil(vouchers.length / CHUNK_SIZE) }, (_, i) => vouchers.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE))
    const promises: Promise<any>[] = []
    chunks.forEach((chunk) => {
      chunk.forEach((voucher) => {
        const cache = new CacheService<Voucher>(redis, voucher.voucher_address)
        promises.push(cache.set(voucher))
        promises.push(redis.set(`address-symbol-${voucher.voucher_address}`, voucher.symbol))
      })
    })
    const results = await Promise.allSettled(promises)
    await handleResults(results)
  } catch (error) {
    logger.error(`Error loading system vouchers: ${error}`)
  }
}

export async function menuPages(list: any[], placeholder: string): Promise<string[]> {
  const pages = [];
  for (let i = 0; i < list.length; i += 3) {
    pages.push(list.slice(i, i + 3));
  }
  while (pages.length < 3) {
    pages.push([]);
  }
  return pages.map((group) => {
    if (group.length === 0) {
      return placeholder;
    } else {
      return group.join("\n");
    }
  });
}

export async function retrieveWalletBalance (address: string, contract: string, provider: Provider) {
  const erc20Contract = new ethers.Contract(
    contract,
    ['function balanceOf(address owner) view returns (uint256)'],
    provider
  )
  const wei = await erc20Contract.balanceOf(address)
  return cashRounding(ethers.formatUnits(wei, 6))
}

export function sanitizePhoneNumber (phoneNumber: string, countryCode?: CountryCode) {
  phoneNumber = phoneNumber.trim()
  if (!phoneNumber.startsWith('+')) {
    try {
      const parsedPhoneNumber = parsePhoneNumber(phoneNumber, countryCode)
      phoneNumber = parsedPhoneNumber.number
    } catch (err) {
      throw new Error(`Could not parse phone number: ${phoneNumber}`)
    }
  }
  return phoneNumber
}

export function sendSMS(message: string, notifier: Notifier, recipient: string[]) {
  return notifier.send(message, recipient)
}

export function validatePhoneNumber(countryCode: CountryCode, phoneNumber: string, ) {
  try {
    return sanitizePhoneNumber(phoneNumber, countryCode);
  } catch (error) {
    throw new MachineError(BaseMachineError.INVALID_PHONE_NUMBER, "Invalid phone number.")
  }
}
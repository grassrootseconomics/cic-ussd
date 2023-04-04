import { PostgresDb } from '@fastify/postgres';

import { Redis as RedisClient } from 'ioredis';
import { Cache } from '@utils/redis';
import { Address, handleResults } from '@lib/ussd/utils';
import { SystemError } from '@lib/errors';
import { Locales } from '@i18n/i18n-types';
import { logger } from '@/app';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
  PENDING = 'PENDING',
  RESETTING_PASSWORD = 'RESETTING_PASSWORD',
}

export interface Account {
  activated_on_chain: boolean
  activated_on_ussd: boolean
  address: Address
  guardians?: string[]
  id: number
  language: Locales
  pin: string
  phone_number: string
  pin_attempts: number
  status: AccountStatus
}

export async function findPhoneNumber (db: PostgresDb, phoneNumber: string) {
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'SELECT * FROM accounts WHERE phone_number = $1',
      [phoneNumber]
    )
    return rows[0]
  } finally {
    client.release()
  }
}

export async function createAccount (account: Pick<Account, 'address' | 'language' | 'phone_number'>, db: PostgresDb, redis: RedisClient): Promise<{ id: number }> {
  logger.debug(`Creating account for phone number: ${account.phone_number}`)
  const { address, language, phone_number } = account
  const client = await db.connect()
  const cache = new Cache(redis, phone_number)

  const results = await Promise.allSettled([
    client.query(`
      INSERT INTO accounts (address, language, phone_number) VALUES ($1, $2, $3) RETURNING id`,
      [address, language, phone_number]
    ),
    cache.setJSON({
      account: {
        activated_on_chain: false,
        activated_on_ussd: false,
        address: address,
        language: language,
        phone_number: phone_number,
        status: AccountStatus.PENDING,
      }
    }),
    redis.set(`address-phone-${address}`, phone_number)
  ])
  const [dbResult] = handleResults(results)

  client.release()
  return dbResult.rows[0]
}

export async function activateOnChain (address: string, db: PostgresDb, redis: RedisClient){
  logger.debug(`Marking account: ${address} activated on chain.`)
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_chain = true WHERE address = $1 RETURNING phone_number',
      [address]
    )

    const cache = new Cache(redis, rows[0].phone_number)
    await cache.updateJSON({ account: { activated_on_chain: true } })

  } catch (error) {
    client.release()
    throw new SystemError(`Error marking account: ${address} activated on chain.`)
  }
}

export async function activateOnUssd (db: PostgresDb, pin: string, phoneNumber: string, redis: RedisClient) {
  logger.debug(`Marking account: ${phoneNumber} activated on ussd.`)
  const client = await db.connect()
  const cache = new Cache(redis, phoneNumber)
  try {

    const [activatedOnUssd, status] = [true, AccountStatus.ACTIVE]
    await Promise.all([
      client.query(
      'UPDATE accounts SET activated_on_ussd = $1, pin = $2, status = $3 WHERE phone_number = $4',
      [activatedOnUssd, pin, status, phoneNumber]),

      cache.updateJSON({
        account: { activated_on_ussd: activatedOnUssd, pin, status }
      })
    ])

  } catch (error) {
    client.release()
    throw new SystemError(`Error marking account: ${phoneNumber} activated on ussd.`)
  }
}

export async function blockOnUssd (db: PostgresDb, phoneNumber: string, redis: RedisClient) {
  logger.debug(`Blocking account: ${phoneNumber} on ussd.`)
  const cache = new Cache(redis, phoneNumber)
  const client = await db.connect()

  try {
    const [activatedOnUssd, status] = [false, AccountStatus.BLOCKED]
    const results = await Promise.allSettled([
      client.query(
        'UPDATE accounts SET activated_on_ussd = $1, status = $2 WHERE phone_number = $3',
        [activatedOnUssd, status, phoneNumber]),
      cache.updateJSON({ account: { activated_on_ussd: activatedOnUssd, status } })
    ])
    handleResults(results)
  } catch(error) {
    client.release()
    throw new SystemError(`Error blocking account: ${phoneNumber} on ussd.`)
  }

}

export async function updatePinAttempts (db: PostgresDb, phoneNumber: string,  pinAttempts: number, redis: RedisClient) {
  logger.debug(`Updating pin attempts for account: ${phoneNumber}.`)
  const cache = new Cache(redis, phoneNumber)
  const client = await db.connect()

  try {
    const results = await Promise.allSettled([
      client.query(
        'UPDATE accounts SET pin_attempts = $1 WHERE phone_number = $2',
        [pinAttempts, phoneNumber]
      ),
      cache.updateJSON({ account: { pin_attempts: pinAttempts } })
    ])
    handleResults(results)
  } catch (error) {
    client.release()
    throw new SystemError(`Error updating pin attempts for account: ${phoneNumber}.`)
  }
}

export async function updateLanguage(db: PostgresDb, phoneNumber: string, language: string, redis: RedisClient) {
  logger.debug(`Updating language for account: ${phoneNumber}.`)
  const cache = new Cache(redis, phoneNumber)
  const client = await db.connect()

  try {
    const results = await Promise.allSettled([
      client.query(
        'UPDATE accounts SET language = $1 WHERE phone_number = $2',
        [language, phoneNumber]),
      cache.updateJSON({ account: { language } })
    ])
    handleResults(results)
  } catch (error) {
    client.release()
    throw new SystemError(`Error updating language for account: ${phoneNumber}.`)
  }
}

export async function resetAccount(db: PostgresDb, phoneNumber: string, redis: RedisClient) {
  logger.debug(`Resetting account: ${phoneNumber}.`)
  const cache = new Cache(redis, phoneNumber)
  const client = await db.connect()

  try {
    const [pin, pinAttempts, status] = [null, 0, AccountStatus.PENDING]
    const results = await Promise.allSettled([
      client.query(
        'UPDATE accounts SET pin = $1, pin_attempts = $2, status = $3 WHERE phone_number = $4',
        [pin, pinAttempts, status, phoneNumber]
      ),
      cache.updateJSON( { account: { pin, pin_attempts: pinAttempts, status } })
    ])
    handleResults(results)
  } catch (error) {
    client.release()
    throw new SystemError(`Error resetting account: ${phoneNumber}.`)
  }
}

export async function updatePin (db: PostgresDb, pin: string, phoneNumber: string, redis: RedisClient) {
  logger.debug(`Updating pin for account: ${phoneNumber}.`)
  const cache = new Cache(redis, phoneNumber)
  const client = await db.connect()

  try {
    const results = await Promise.allSettled([
      client.query(
        'UPDATE accounts SET pin = $1 WHERE phone_number = $2',
        [pin, phoneNumber]
      ),

      cache.updateJSON( { account: { pin } })
    ])
    handleResults(results)
  } catch (error) {
    client.release()
    throw new SystemError(`Error updating pin for account: ${phoneNumber}.`)
  }
}
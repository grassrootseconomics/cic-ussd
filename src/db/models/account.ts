import { PostgresDb } from '@fastify/postgres';

import { Redis as RedisClient } from 'ioredis';
import { Cache } from '@utils/redis';
import { Address } from '@lib/ussd/utils';

/**
 * Enum for account status
 * @enum {string}
 */
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
  language: string
  pin: string
  phone_number: string
  pin_attempts: number
  status: AccountStatus
}

/**
 * Find account by address
 * @param {fastifyPostgres.PostgresDb} db - database connection.
 * @param {string} phoneNumber - phone number of account.
 * @returns {Promise<any>} - account object. see {@link Account}
 */
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

/**
 * Creates an account
 * @param {fastifyPostgres.PostgresDb} db - database connection.
 * @param {Partial<Account>} account - account object.
 * @param redis
 * @returns {Promise<any>} - account object. see {@link Account}
 */
export async function createAccount (
  account: Partial<Account>,
  db: PostgresDb,
  redis: RedisClient
) {
  console.debug(`Creating account for: ${account.address} ...`)
  const client = await db.connect()
  try {
    const { rows } = await client.query(`
        INSERT INTO accounts (address, language, phone_number) VALUES ($1, $2, $3) RETURNING *`,
    [account.address, account.language, account.phone_number])

    // create a redis user object
    const result = rows[0]
    const cacheAccount = {
      activated_on_chain: result.activated_on_chain,
      activated_on_ussd: result.activated_on_ussd,
      address: result.address,
      language: result.language,
      phone_number: result.phone_number,
      pin: result.pin,
      pin_attempts: result.pin_attempts,
      status: result.status
    }
    const user = {
      account: cacheAccount,
    }
    const cache = new Cache(redis, account.phone_number)
    await cache.setJSON(user)

    return result
  } catch (error) {
    client.release()
  }
}

export async function activateOnChain (
  address: string,
  db: PostgresDb,
  redis: RedisClient,
): Promise<Account> {
  console.debug(`Marking: ${address} as activated on chain ...`)
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_chain = true WHERE address = $1 RETURNING *',
      [address]
    )
    // activate in redis record as well
    const cache = new Cache(redis, rows[0].phone_number)
    await cache.updateJSON({
      account: { activated_on_chain: true }
    })
    return rows[0]
  } catch (error) {
    client.release()
  }
}

export async function activateOnUssd (db: PostgresDb, pin: string, phoneNumber: string) {
  console.debug(`Marking: ${phoneNumber} as activated on ussd ...`)
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_ussd = true, pin = $1, status = $2 WHERE phone_number = $3 RETURNING activated_on_ussd, pin, status',
      [pin, AccountStatus.ACTIVE, phoneNumber]
    )
    return rows[0]
  } catch (error) {
    client.release()
  }
}

export async function blockOnUssd (db: PostgresDb, phoneNumber: string, redis: RedisClient) {
  console.debug(`Marking: ${phoneNumber} as blocked on ussd ...`)
  const cache = new Cache(redis, phoneNumber)
  const cu = cache.updateJSON({
    account: { activated_on_ussd: false, status: AccountStatus.BLOCKED }
  })

  const du = db.connect().then(async (client) => {
    const { rows } = await client.query(
      'UPDATE accounts SET status = $1, activated_on_ussd = false WHERE phone_number = $2 RETURNING *',
      [AccountStatus.BLOCKED, phoneNumber]
    )
    return rows[0]
  })

  const [_, dr] = await Promise.all([cu, du])

  return dr
}

export async function updatePinAttempts (db: PostgresDb, phoneNumber: string,  pinAttempts: number, redis: RedisClient) {
  console.debug(`Updating pin attempts for: ${phoneNumber} ...`)
  const cache = new Cache(redis, phoneNumber)

  const cu = cache.updateJSON({
    account: { pin_attempts: pinAttempts }
  })

  const du = db.connect().then(async (client) => {
    const { rows } = await client.query(
      'UPDATE accounts SET pin_attempts = $1 WHERE phone_number = $2 RETURNING *',
      [pinAttempts, phoneNumber]
    )
    return rows[0]
  })

  await Promise.all([cu, du])
}

export async function updateLanguage(db: PostgresDb, phoneNumber: string, language: string, redis: RedisClient) {
  console.debug(`Updating language to: ${language} for: ${phoneNumber} ...`)
  const cache = new Cache(redis, phoneNumber)

  const cu = cache.updateJSON({
    account: { language }
  })

  const du = db.connect().then(async (client) => {
    const { rows } = await client.query(
      'UPDATE accounts SET language = $1 WHERE phone_number = $2 RETURNING *',
      [language, phoneNumber]
    )
    return rows[0]
  })

  await Promise.all([cu, du])
}

export async function findById (db: PostgresDb, id: number) {
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'SELECT * FROM accounts WHERE id = $1',
      [id]
    )
    return rows[0]
  } finally {
    client.release()
  }
}

export async function resetAccount(db: PostgresDb, phoneNumber: string, redis: RedisClient) {
  // reset account in db and redis
  const cache = new Cache(redis, phoneNumber)
  const cu = cache.updateJSON({
    account: {
      activated_on_ussd: false,
      pin_attempts: 0,
      status: AccountStatus.RESETTING_PASSWORD,
      pin: null
    }
  })

  const du = db.connect().then(async (client) => {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_ussd = false, pin_attempts = 0, status = $1, pin = null WHERE phone_number = $2 RETURNING *',
      [AccountStatus.RESETTING_PASSWORD, phoneNumber]
    )
    return rows[0]
  })

  await Promise.all([cu, du])
}

export async function updatePin (db: PostgresDb, pin: string, phoneNumber: string, redis: RedisClient) {
  console.debug(`Updating pin for: ${phoneNumber} ...`)
  const cache = new Cache(redis, phoneNumber)
  const cu = cache.updateJSON({
    account: { pin }
  })

  const du = db.connect().then(async (client) => {
    const { rows } = await client.query(
      'UPDATE accounts SET pin = $1 WHERE phone_number = $2',
      [pin, phoneNumber]
    )
    return rows[0]
  })

  await Promise.all([cu, du])
}
import {PostgresDb} from "@fastify/postgres";

import {Redis as RedisClient} from "ioredis";
import {Cache} from "@utils/redis";
import {Address} from "@lib/ussd/utils";

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
  password: string
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

    // create a redis record for the account
    const cache = new Cache(redis, account.phone_number)
    await cache.setJSON(rows[0])

    return rows[0]
  } catch (error) {
    client.release()
  }
}

export async function activateOnChain (
  address: string,
  db: PostgresDb,
  redis: RedisClient,
) {
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
      activated_on_chain: true
    })
    return rows[0]
  } catch (error) {
    client.release()
  }
}

export async function activateOnUssd (db: PostgresDb, password: string, phoneNumber: string) {
  console.debug(`Marking: ${phoneNumber} as activated on ussd ...`)
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_ussd = true, password = $1, status = $2 WHERE phone_number = $3 RETURNING activated_on_ussd, password, status',
      [password, AccountStatus.ACTIVE, phoneNumber]
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
    activated_on_ussd: false,
    status: AccountStatus.BLOCKED
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
    pin_attempts: pinAttempts
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
    language
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
    activated_on_ussd: false,
    pin_attempts: 0,
    status: AccountStatus.RESETTING_PASSWORD,
    password: null
  })

  const du = db.connect().then(async (client) => {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_ussd = false, pin_attempts = 0, status = $1, password = null WHERE phone_number = $2 RETURNING *',
      [AccountStatus.RESETTING_PASSWORD, phoneNumber]
    )
    return rows[0]
  })

  await Promise.all([cu, du])
}

export async function updatePin (db: PostgresDb, password: string, phoneNumber: string, redis: RedisClient) {
  console.debug(`Updating pin for: ${phoneNumber} ...`)
  const cache = new Cache(redis, phoneNumber)
  const cu = cache.updateJSON({
    password
  })

  const du = db.connect().then(async (client) => {
    const { rows } = await client.query(
      'UPDATE accounts SET password = $1 WHERE phone_number = $2',
      [password, phoneNumber]
    )
    return rows[0]
  })

  await Promise.all([cu, du])
}
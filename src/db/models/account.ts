import { PostgresDb } from "@fastify/postgres";

import { PoolClient } from "pg";

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

/**
 * Interface for account object in database
 * @interface
 * @property {number} id - account id
 * @property {boolean} activated_on_chain - whether account is activated on chain
 * @property {boolean} activated_on_ussd - whether account is activated on ussd
 * @property {string} address - account address
 * @property {string} language - account language
 * @property {string} password - account password
 * @property {string} phone_number - account phone number
 * @property {number} pin_attempts - number of pin attempts
 * @property {AccountStatus} status - account status
 */
export interface Account {
  id: number
  activated_on_chain: boolean
  activated_on_ussd: boolean
  address: string
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
 * @returns {Promise<any>} - account object. see {@link Account}
 */
export async function createAccount (
  db: PostgresDb,
  account: Partial<Account>
) {
  const client = await db.connect()
  try {
    const { rows } = await client.query(`
        INSERT INTO accounts (address, language, phone_number) VALUES ($1, $2, $3) RETURNING *`,
    [account.address, account.language, account.phone_number])
    return rows[0]
  } catch (error) {
    client.release()
  }
}

export async function activateOnChain (
  db: PostgresDb,
  address: string
) {
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_chain = true WHERE address = $1 RETURNING *',
      [address]
    )
    return rows[0]
  } catch (error) {
    client.release()
  }
}

export async function activateOnUssd (db: PostgresDb, password: string, phoneNumber: string) {
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'UPDATE accounts SET activated_on_ussd = true, password = $1 WHERE phone_number = $2 RETURNING *',
      [password, phoneNumber]
    )
    return rows[0]
  } catch (error) {
    client.release()
  }
}

export function blockOnUssd (db: PostgresDb, address: string) {
  db.connect(onConnect)

  function onConnect (err: Error, client: PoolClient, release) {
    if (err) {
      throw err
    }
    client.query(
      'UPDATE accounts SET activated_on_ussd = $1, status = $2 WHERE address = $3',
      [false, AccountStatus.BLOCKED, address],
      function onResult (err) {
        console.error(err)
        release()
      }
    )
  }
}

export function updatePinAttempts (db: PostgresDb, address: string, pinAttempts: number) {
  db.connect(onConnect)

  function onConnect (err: Error, client: PoolClient, release) {
    if (err) {
      throw err
    }
    client.query(
      'UPDATE accounts SET pin_attempts = $1 WHERE address = $2',
      [pinAttempts, address],
      function onResult (err) {
        console.error(err)
        release()
      }
    )
  }
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

export async function resetAccount(db: PostgresDb, phoneNumber: string) {
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'UPDATE accounts SET status = $1, pin_attempts = $2 WHERE phone_number = $3',
      [AccountStatus.RESETTING_PASSWORD, 0, phoneNumber]
    )
  } finally {
    client.release()
  }
}
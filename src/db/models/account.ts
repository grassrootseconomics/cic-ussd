import { PostgresDb } from '@fastify/postgres'

import { PoolClient } from 'pg'

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
  PENDING = 'PENDING',
  RESETTING_PASSWORD = 'RESETTING_PASSWORD',
}

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

export async function findAccountByPhoneNumber (db: PostgresDb, phoneNumber: string) {
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

export async function createDBAccount (
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

export function activateOnUssd (db: PostgresDb, password: string, phoneNumber: string) {
  db.connect(onConnect)
  function onConnect (err: Error, client: PoolClient, release) {
    if (err) {
      throw err
    }
    client.query(
      `UPDATE accounts
       SET password = $1,
           activated_on_ussd = true,
           status = $2
       WHERE phone_number = $3`,
      [password, AccountStatus.ACTIVE, phoneNumber],
      function onResult (err) {
        console.error(err)
        release()
      }
    )
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

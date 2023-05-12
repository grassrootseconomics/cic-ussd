import { Locales } from '@i18n/i18n-types';
import { PostgresDb } from '@fastify/postgres';
import { logger } from '@/app';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
  PENDING = 'PENDING',
  RESETTING_PIN = 'RESETTING_PIN',
}

export interface AccountInterface {
  active_voucher_address: string
  activated_on_chain: boolean
  activated_on_ussd: boolean
  address: string
  guardian: string // probably should be part of a different interface
  guardians?: string[]
  id: number
  language: Locales
  pin: string
  phone_number: string
  pin_attempts: number
  status: AccountStatus
}

export class Account {

  constructor(private db: PostgresDb) { }

  public async findByAddress(address: string) {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query<AccountInterface>(`
        SELECT * FROM accounts WHERE address = $1`,
        [address]
      )
      return rows[0]
    } catch (error: any) {
      logger.error(`Error finding account by address: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async findByPhoneNumber(phoneNumber: string) {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query<AccountInterface>(`
        SELECT * FROM accounts WHERE phone_number = $1`,
        [phoneNumber]
      )
      return rows[0]
    } catch (error: any) {
      logger.error(`Error finding account by phone number: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async findAccountAndGuardians(phoneNumber: string) {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query<AccountInterface>(`
                  SELECT accounts.*, guardians.guardian
                  FROM accounts
                           LEFT JOIN guardians ON accounts.phone_number = guardians.account_phone_number
                  WHERE accounts.phone_number = $1`,
        [phoneNumber]
      )
      const account = rows[0]
      if (account) {
        account.guardians = rows.filter(row => row.guardian).map(row => row.guardian)
        return account
      }
      return null
    } catch (error: any) {
      logger.error(`Error finding account and guardians: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async insertAccount(data: Pick<AccountInterface, 'address' | 'language' | 'phone_number'>) {
    const { address, language, phone_number } = data
    const client = await this.db.connect()
    try {
      const { rows } = await client.query(`
      INSERT INTO accounts (address, language, phone_number) VALUES ($1, $2, $3) RETURNING id`,
        [address, language, phone_number]
      )
      return rows[0].id
    } catch (error: any) {
      logger.error(`Error inserting account: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async setActivityOnChain(activeVoucherAddress: string, phoneNumber: string) {
    const client = await this.db.connect()
    try {
      await client.query(`
      UPDATE accounts SET active_voucher_address = $1, activated_on_chain = true WHERE phone_number = $2`,
        [activeVoucherAddress, phoneNumber]
      )
    } catch (error: any) {
      logger.error(`Error updating account activity on chain: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async setActivityOnUssd(activity: boolean, phoneNumber: string, status: AccountStatus, pin?: string, pinAttempts?: number) {
    const client = await this.db.connect();
    try {
      let query = 'UPDATE accounts SET activated_on_ussd = $1, status = $2';
      const params: (boolean | number | string)[] = [activity, status, phoneNumber];

      if (pin) {
        query += ', pin = $4';
        params.push(pin);
      }
      if (pinAttempts) {
        query += ', pin_attempts = $5';
        params.push(pinAttempts);
      }

      query += ' WHERE phone_number = $3';

      await client.query(query, params);
    } catch (error: any) {
      logger.error(`Error updating account activity on ussd: ${error.message}, stack: ${error.stack}.`);
    } finally {
      client.release();
    }
  }

  public async setLanguage(phoneNumber: string, language: string) {
    const client = await this.db.connect()
    try {
      await client.query(`
        UPDATE accounts SET language = $1 WHERE phone_number = $2`,
        [language, phoneNumber]
      )
    } catch (error: any) {
      logger.error(`Error updating language: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }

  }

  public async setPin(phoneNumber: string, pin: string) {
    const client = await this.db.connect()
    try {
      await client.query(`
        UPDATE accounts SET pin = $1 WHERE phone_number = $2`,
        [pin, phoneNumber]
      )
    } catch (error: any) {
      logger.error(`Error updating pin: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async setPinAttempts(attempts: number, phoneNumber: string) {
    const client = await this.db.connect()
    try {
      await client.query(`
        UPDATE accounts SET pin_attempts = $1 WHERE phone_number = $2`,
        [attempts, phoneNumber]
      )
    } catch (error: any) {
      logger.error(`Error updating pin attempts: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }
}
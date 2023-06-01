import { PostgresDb } from '@fastify/postgres';
import { logger } from '@/app';

interface GuardianInterface {
  account_phone_number: string
  guardian: string
}

export interface SystemGuardianInterface {
  phone_number: string
}

export class Guardian {

  constructor(private db: PostgresDb) { }

  public async deleteGuardian(guardian: string, phoneNumber: string) {
    const client = await this.db.connect()
    try {
      await client.query(
        `DELETE FROM guardians WHERE account_phone_number = $1 AND guardian = $2`,
        [phoneNumber, guardian]
      )
    } catch (error: any) {
      logger.error(`Error deleting guardian: ${error.message}, stack: ${error.stack}`)
    } finally {
      client.release()
    }
  }

  public async insertGuardian(guardian: string, phoneNumber: string) {
    const client = await this.db.connect()
    try {
      await client.query(
        `INSERT INTO guardians (account_phone_number, guardian)
            VALUES ($1, $2)`,
        [phoneNumber, guardian]
      )
    } catch (error: any) {
      logger.error(`Error inserting guardian: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async selectGuardian(guardian: string, phoneNumber: string) {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query(
        `SELECT guardian FROM guardians WHERE account_phone_number = $1 AND guardian = $2`,
        [phoneNumber, guardian]
      )
      return rows.length > 0 ? rows[0].guardian : null;
    } catch (error: any){
      logger.error(`Error selecting guardian: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async selectAllGuardians(phoneNumber: string){
    const client = await this.db.connect()
    try {
      const { rows } = await client.query<GuardianInterface>(
        `SELECT guardian FROM guardians WHERE account_phone_number = $1`,
        [phoneNumber]
      )
      return rows.map((row: GuardianInterface) => row.guardian)
    } catch (error: any) {
      logger.error(`Error selecting all guardians: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }
}

export class SystemGuardian {

  constructor(private db: PostgresDb) { }

  deleteGuardian = async (phoneNumber: string) => {
    const client = await this.db.connect()
    try {
      await client.query(
        `DELETE FROM system_guardians WHERE phone_number = $1`,
        [phoneNumber]
      )
    } catch (error: any) {
      logger.error(`Error deleting system guardian: ${error.message}, stack: ${error.stack}`)
    } finally {
      client.release()
    }
  }

  insertGuardian = async (phoneNumber: string) => {
    const client = await this.db.connect()
    try {
      await client.query(
        `INSERT INTO system_guardians (phone_number)
            VALUES ($1)`,
        [phoneNumber]
      )
    } catch (error: any) {
      logger.error(`Error inserting system guardian: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  selectGuardian = async (phoneNumber: string) => {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query<SystemGuardianInterface>(
        `SELECT phone_number FROM system_guardians WHERE phone_number = $1`,
        [phoneNumber]
      )
      return rows.length > 0 ? rows[0].phone_number : null;
    } catch (error: any) {
      logger.error(`Error selecting system guardian: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  selectAllGuardians = async () => {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query<SystemGuardianInterface>(
        `SELECT phone_number FROM system_guardians`
      )
      return rows.map((row: SystemGuardianInterface) => row.phone_number)
    } catch (error: any) {
      logger.error(`Error selecting all system guardians: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }
}
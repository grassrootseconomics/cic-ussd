import { PostgresDb } from '@fastify/postgres';
import { logger } from '@/app';

interface GuardianInterface {
  account_phone_number: string
  guardian: string
}

export class Guardian {

  constructor(private db: PostgresDb) {}

  public async deleteGuardian(guardian: string, phoneNumber: string) {
    const client = await this.db.connect()
    try {
      await client.query(
        `DELETE FROM guardians WHERE account_phone_number = $1 AND guardian = $2`,
        [phoneNumber, guardian]
      )
    } catch (error) {
      client.release()
      logger.error(`Error deleting guardian: ${error}`)
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
    } catch (error) {
      client.release()
      logger.error(`Error inserting guardian: ${error}`)
    }
  }

  public async selectGuardian(guardian: string, phoneNumber: string) {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query(
        `SELECT guardian FROM guardians WHERE account_phone_number = $1 AND guardian = $2`,
        [phoneNumber, guardian]
      )
      console.log(rows)
      return rows.length > 0 ? rows[0].guardian : null;
    } finally {
      client.release()
    }
  }

  public async selectAllGuardians(phoneNumber: string): Promise<string[]> {
    const client = await this.db.connect()
    try {
      const { rows } = await client.query<GuardianInterface>(
        `SELECT guardian FROM guardians WHERE account_phone_number = $1`,
        [phoneNumber]
      )
      return rows.map((row: GuardianInterface) => row.guardian)
    } finally {
      client.release()
    }
  }
}
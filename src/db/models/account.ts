import { PoolClient } from "pg";


export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
  PENDING = 'PENDING',
  RESETTING_PASSWORD = 'RESETTING_PASSWORD'
}

export interface Account {
  blockchain_address: string;
  phone_number: string;
  preferred_language: string;
  activatedOnChain: boolean;
  activatedOnUssd: boolean;
  status: AccountStatus
}

export async function findAccountByPhoneNumber(db: PoolClient, phoneNumber: string) {
  try {
    const { rows } = await db.query(
      `SELECT * FROM accounts WHERE phone_number = $1`,
      [phoneNumber]
    );
    return rows[0];
  } finally {
    db.release();
  }
}

export async function createDBAccount(db: PoolClient, account: Partial<Account>) {
  try {
    const { rows } = await db.query(
      `INSERT INTO accounts (blockchain_address, phone_number, preferred_language) VALUES ($1, $2, $3) RETURNING *`,
      [account.blockchain_address, account.phone_number, account.preferred_language]
    );
    return rows[0];
  } catch (error) {
    db.release();
  }
}
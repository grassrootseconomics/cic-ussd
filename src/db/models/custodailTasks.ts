import { PoolClient } from "pg";

export enum CustodialTaskType {
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  TRANSFER = 'TRANSFER',
  BALANCE_QUERY = 'BALANCE_QUERY'
}

export interface CustodialTask {
  blockchain_address: string;
  task_type: CustodialTaskType;
  task_reference: string;
}


export async function createTracker(db: PoolClient, custodialTask: CustodialTask) {
  try {
    const { rows } = await db.query(
      `INSERT INTO custodial_tasks (blockchain_address, task_type, task_reference) VALUES ($1, $2, $3) RETURNING *`,
      [custodialTask.blockchain_address, custodialTask.task_type, custodialTask.task_reference]
    );
    return rows[0];
  } catch (error) {
    db.release();
  }
}
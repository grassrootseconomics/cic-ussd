import { PostgresDb } from '@fastify/postgres'

export enum CustodialTaskType {
  REGISTER = 'REGISTER',
  TRANSFER = 'TRANSFER',
  QUERY_BALANCE = 'QUERY_BALANCE',
}

export interface CustodialTask {
  address: string
  task_reference: string
  task_type: CustodialTaskType
}

export async function createTracker (db: PostgresDb, custodialTask: CustodialTask) {
  const client = await db.connect()
  try {
    const { rows } = await client.query(
      'INSERT INTO custodial_tasks (address, task_reference, task_type) VALUES ($1, $2, $3) RETURNING *',
      [custodialTask.address, custodialTask.task_reference, custodialTask.task_type]
    )
    return rows[0]
  } catch (error) {
    client.release()
  }
}

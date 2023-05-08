import { PostgresDb } from '@fastify/postgres';

import { logger } from '@/app';

export enum TaskType {
  REGISTER = 'REGISTER',
  TRANSFER = 'TRANSFER'
}

export interface CustodialTask {
  address: string
  task_reference: string
  task_type: TaskType
}

export async function createTracker(db: PostgresDb, custodialTask: CustodialTask) {
  const client = await db.connect()
  try {
    const { rows } = await client.query<CustodialTask>(
      'INSERT INTO custodial_tasks (address, task_reference, task_type) VALUES ($1, $2, $3) RETURNING *',
      [custodialTask.address, custodialTask.task_reference, custodialTask.task_type]
    )
    return rows[0]
  } catch (error) {
    logger.error(`Error custodial task: ${error}`)
  } finally {
    client.release()
  }
}

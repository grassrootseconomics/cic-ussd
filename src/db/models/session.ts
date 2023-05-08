import { PostgresDb } from '@fastify/postgres';
import { MachineId } from '@machines/utils';
import { logger } from '@/app';

export enum SessionType {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  INITIAL = 'INITIAL'
}

export interface SessionInterface {
  data?: Record<string, any>
  extId: string
  id?: number
  inputs?: string[]
  machineId?: MachineId
  machineState?: string
  machines?: string[]
  phoneNumber: string
  responses?: string[]
  sessionType: SessionType
  serviceCode: string
  version: number
}

export class Session {
  constructor(private db: PostgresDb) {}

  public async insertSession(data: Partial<SessionInterface>) {
    const client = await this.db.connect()
    try {
      const { rows } =  await client.query<SessionInterface>(
        `INSERT INTO sessions (ext_id, inputs, phone_number, session_type, service_code, version)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
  [data.extId, data.inputs, data.phoneNumber, data.sessionType, data.serviceCode, data.version]
      )
      return rows[0]
    } catch (error: any) {
      logger.error(`Error inserting session: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }

  public async setSession(data: Partial<SessionInterface>) {
    const client = await this.db.connect()
    try {
      await client.query(
        `UPDATE sessions SET inputs = $1, machine_state = $2, machines = $3, responses = $4, session_type = $5, version = $6 WHERE ext_id = $7`,
        [data.inputs, data.machineState, data.machines, data.responses, data.sessionType, data.version, data.extId]
      )
    } catch (error: any) {
      logger.error(`Error updating session: ${error.message}, stack: ${error.stack}.`)
    } finally {
      client.release()
    }
  }
}
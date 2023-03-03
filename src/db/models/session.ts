import { PostgresDb } from '@fastify/postgres'
import { SessionInterface } from '@lib/ussd/session'

export async function upsertSession (db: PostgresDb, session: SessionInterface) {
  const client = await db.connect()
  try {
    await client.query(
      `INSERT INTO sessions(ext_id, inputs, machine_state, phone_number, responses, service_code, version) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7) 
                    ON CONFLICT (ext_id) 
                    DO UPDATE SET version = excluded.version, machine_state = excluded.machine_state, inputs = excluded.inputs, responses = excluded.responses
                    WHERE excluded.version > sessions.version`,
      [session.id, session.history.inputs, session.machineState, session.phoneNumber, session.history.responses, session.serviceCode, session.version]
    )
  } finally {
    client.release()
  }
}

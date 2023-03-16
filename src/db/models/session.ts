import {PostgresDb} from '@fastify/postgres'
import {SessionInterface} from '@lib/ussd/session'

export async function setSession (db: PostgresDb, session: Partial<SessionInterface>) {
  const client = await db.connect()
    try {
    await client.query(
            `UPDATE sessions SET inputs = $1, machine_state = $2, machines = $3, responses = $4, version = $5 WHERE ext_id = $6`,
            [session.history.inputs, session.state, session.history.machines, session.history.responses, session.version, session.id]
        )
    } finally {
        client.release()
    }
}
export async function insertSession (db: PostgresDb, session: Partial<SessionInterface>) {
  const client = await db.connect()
  try {
    await client.query(
      `INSERT INTO sessions(ext_id, inputs, machine_state, machines, phone_number, responses, service_code, version) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [session.id, session.history.inputs, session.state, session.history.machines, session.phoneNumber, session.history.responses, session.serviceCode, session.version]
    )
  } finally {
    client.release()
  }
}

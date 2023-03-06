import { PostgresDb } from "@fastify/postgres";

export async function addWard(db: PostgresDb, phoneNumber: string,  wards: string[]){
  const client = await db.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO guardians (account_phone_number, wards) VALUES ($1, $2)`,
      [phoneNumber, wards]
    );
    return rows;
  } finally {
    client.release();
  }
}

export async function getWard(db: PostgresDb, guardian: string, ward: string){
  const client = await db.connect();
  try {
    const { rows } = await client.query(
      `SELECT wards FROM guardians WHERE account_phone_number = $1 AND wards @> ARRAY [$2]`,
      [guardian, ward]
    );
    return rows[0];
  } finally {
    client.release();
  }
}

export async function addGuardian(db: PostgresDb, guardian: string, ward: string){
  const client = await db.connect();
  try {
    await client.query(`
      INSERT INTO guardians (account_phone_number, wards) 
      VALUES ($1, ARRAY [$2]) 
      ON CONFLICT (account_phone_number) DO UPDATE SET
        wards = array_append(guardians.wards, $2)`,
      [guardian, ward]
    )
  } finally {
    client.release();
  }
}

export async function getGuardians(db: PostgresDb, phoneNumber: string){
  const client = await db.connect();
  try {
    const { rows } = await client.query(
      `SELECT account_phone_number FROM guardians WHERE wards @> ARRAY [$1]`,
      [phoneNumber]
    );
    return rows;
  } finally {
    client.release();
  }
}

export async function removeGuardian(db: PostgresDb, guardian: string, ward: string){
  const client = await db.connect();
  try {
    await client.query(`
      UPDATE guardians SET wards = array_remove(wards, $2) WHERE account_phone_number = $1`,
      [guardian, ward]
    )

  } finally {
    client.release();
  }
}
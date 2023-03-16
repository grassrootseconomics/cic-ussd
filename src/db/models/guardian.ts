import {PostgresDb} from "@fastify/postgres";
import {Redis as RedisClient} from "ioredis";
import {Cache} from "@utils/redis";

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

export async function addGuardian(db: PostgresDb, guardian: string, redis: RedisClient, ward: string){
  const client = await db.connect();

  const queryText = `
    INSERT INTO guardians (account_phone_number, wards) 
    VALUES ($1, ARRAY [$2]) 
    ON CONFLICT (account_phone_number) DO UPDATE SET
      wards = array_append(guardians.wards, $2)
  `;
  const queryValues = [guardian, ward];

  try {
    await client.query("BEGIN");

    await client.query(queryText, queryValues);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  // update redis
  const cache = new Cache(redis, ward);
  const account = await cache.getJSON()
  const guardians = account.guardians || [];

  if (!guardians.includes(guardian)) {
    guardians.push(guardian);
    await cache.updateJSON({guardians});
  }
}

export async function removeGuardian(db: PostgresDb, guardian: string, redis: RedisClient, ward: string){
  const cache = new Cache(redis, ward);
  const account = await cache.getJSON()
  const guardians = account.guardians

  if(guardians.length === 0) {
    console.debug("No guardians to remove")
    return;
  }

  const index = guardians.indexOf(guardian);
  if (index > -1) {
    guardians.splice(index, 1);
  } else {
    console.debug("Guardian not found")
    return;
  }

  await cache.updateJSON({guardians});

  const client = await db.connect();
  const queryText = `
    UPDATE guardians SET wards = $1 WHERE account_phone_number = $2
  `;
  const queryValues = [guardians, ward];

  try {
    await client.query("BEGIN");

    await client.query(queryText, queryValues);

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

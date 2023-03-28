import { PostgresDb } from '@fastify/postgres';
import { Redis as RedisClient } from 'ioredis';
import { Cache } from '@utils/redis';
import { User } from '@machines/utils';

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
  const cache = new Cache(redis, ward)
  try {
    await Promise.all([
      client.query(
        `INSERT INTO guardians (account_phone_number, wards)
         VALUES ($1, ARRAY[$2])
         ON CONFLICT (account_phone_number) DO UPDATE SET wards = array_append(guardians.wards, $2::text)
         RETURNING *`,
        [guardian, ward]),
      cache.getJSON<User>()
        .then(user => {
          const guardians = user.guardians || [];
          if (!guardians.includes(guardian)) {
            guardians.push(guardian);
            return cache.updateJSON({guardians});
          }
        })
    ]);
  } finally {
    client.release();
  }
}


export async function removeGuardian(db: PostgresDb, guardian: string, redis: RedisClient, ward: string){
  const client = await db.connect();

  try {
    await client.query(
      `UPDATE guardians
       SET wards = array_remove(guardians.wards, $2)
       WHERE account_phone_number = $1
       RETURNING *`,
      [guardian, ward]
    );
  } finally {
    client.release();
  }

  const cache = new Cache(redis, ward);
  const user = await cache.getJSON<User>();
  const guardians = user.guardians || [];

  const index = guardians.indexOf(guardian);
  if (index !== -1) {
    guardians.splice(index, 1);
    await cache.updateJSON({ guardians });
  }
}

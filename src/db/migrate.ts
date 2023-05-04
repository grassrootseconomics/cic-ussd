import fs from 'fs';
import path from 'path';
import  { FastifyInstance } from 'fastify';
import { logger } from '@/app';
import { SystemError } from '@lib/errors';

export default async function migrate(fastify: FastifyInstance) {
  fastify.log.debug('Running migrations ...')
  const migrationsDir = path.join(path.join(__dirname, 'migrations'));
  const migrationFiles = fs.readdirSync(migrationsDir).sort();
  const client = await fastify.pg.connect()
  for (const file of migrationFiles) {
    const migrationScript = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    try {
      await client.query(migrationScript)
      fastify.log.debug(`Migration ${file} executed successfully.`);
    } catch (error: any) {
      logger.error(`Migration ${file} failed: ${error.message}`)
      client.release()
      throw new SystemError('Migration failed')
    }
  }
  client.release()
}
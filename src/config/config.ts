import convict from 'convict';

import logger from '../tools/logger';

import { schema } from './schema';

const config = convict(schema);

try {
  const configFile: string =
    'src/config/envs/' + process.env.NODE_ENV + '.json';
  config.loadFile(configFile);
  logger.debug(`Attempting to load config from ${configFile}`);
  config.validate({ allowed: 'strict' });
} catch (err) {
  console.error(err);
  process.exit(1);
}

export default config;

import * as convict from 'convict';


export interface ConfigSchema {
  api: {
    version: string;
  }
  server: {
    port: number;
  };
  database: {
    host: string;
    password: string;
    port: number;
    user: string;
  };
  redis: {
    database: number;
    host: string;
    port: number;
  };
  africasTalking: {
    validIps: string[];
  },
  nexah: {
    validIps: string[];
  },
  ussd: {
    session: {
      cacheTtl: number;
    }
  }
}

export const schema: convict.Schema<ConfigSchema> = {
  api: {
    version: {
      doc: 'The API version',
      format: String,
      default: 'v1',
      env: 'API_VERSION',
      arg: 'api-version',
    }
  },
  server: {
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 3000,
      env: 'PORT',
      arg: 'port',
    },
  },
  database: {
    host: {
      doc: 'The host to connect to.',
      format: String,
      default: 'localhost',
      env: 'DB_HOST',
      arg: 'db-host',
    },
    password: {
      doc: 'The password to connect to the database.',
      format: String,
      default: 'password',
      env: 'DB_PASSWORD',
      arg: 'db-password',
      sensitive: true,
    },
    port: {
      doc: 'The database port to connect to.',
      format: 'port',
      default: 5432,
      env: 'DB_PORT',
      arg: 'db-port',
    },
    user: {
      doc: 'The user to connect to the database.',
      format: String,
      default: 'postgres',
      env: 'DB_USER',
      arg: 'db-user',
    },
  },
  redis: {
    database: {
      doc: 'The redis database to use.',
      format: Number,
      default: 0,
      env: 'REDIS_DB',
      arg: 'redis-db',
    },
    host: {
      doc: 'The redis host to connect to.',
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
      arg: 'redis-host',
    },
    port: {
      doc: 'The redis port to connect to.',
      format: 'port',
      default: 6379,
      env: 'REDIS_PORT',
      arg: 'redis-port',
    },
  },
  africasTalking: {
    validIps: {
      doc: 'The valid IPs for Africa\'s Talking callbacks.',
      format: Array,
      default: [],
      env: 'AFRICA_STALKING_VALID_IPS',
      arg: 'africa-stalking-valid-ips'
    }
  },
  nexah: {
    validIps: {
      doc: 'The valid IPs for Nexah callbacks.',
      format: Array,
      default: [],
      env: 'NEXAH_VALID_IPS',
      arg: 'nexah-valid-ips'
    }
  },
  ussd: {
    session: {
      cacheTtl: {
        doc: 'The time to live for cached USSD sessions in seconds.',
        format: Number,
        default: 180,
        env: 'USSD_SESSION_CACHE_TTL',
        arg: 'ussd-session-cache-ttl'
      }
    }
  }
};

function stringToList (value : string|undefined) : string[] | void {
  if (value === undefined) {
    return
  } else {
  return value.split(',');
  }
}

export const config = {
  API: {
    VERSION: process.env.API_VERSION ?? 'v1'
  },
  AFRICASTALKING: {
    VALID_IPS: stringToList(process.env.AFRICASTALKING_VALID_IPS) ?? ['0.0.0.0']
  },
  CIC_CUSTODIAL:{
    BALANCE_ENDPOINT: process.env.CIC_CUSTODIAL_BALANCE_ENDPOINT ?? 'https://data-warehouse.sarafu.network/public/balances/',
    REGISTER_ENDPOINT: process.env.CIC_CUSTODIAL_REGISTER_ENDPOINT ?? 'http://192.168.0.103:5005/api/account/create',
    TRANSFER_ENDPOINT: process.env.CIC_CUSTODIAL_TRANSFER_ENDPOINT ?? 'http://192.168.0.103:5005/api/sign/transfer',
  },
  CIC_GRAPH: {
    GRAPHQL_ENDPOINT: process.env.CIC_GRAPH_GRAPHQL_ENDPOINT ?? 'http://localhost:6080/v1/graphql',
    HASURA_ADMIN_SECRET: process.env.CIC_GRAPH_HASURA_ADMIN_SECRET ?? 'admin',
  },
  DATABASE: {
    URL: process.env.DATABASE_URL
  },
  DEV: process.env.NODE_ENV !== 'production',
  LOG: {
    LEVEL: process.env.LOG_LEVEL ?? 'info'
  },
  NATS : {
    CLIENT_NAME: process.env.NATS_CLIENT_NAME ?? 'cic-ussd',
    DRAIN_ON_SHUTDOWN: process.env.NATS_DRAIN_ON_SHUTDOWN ?? true,
    SUBJECT: process.env.NATS_SUBJECT ?? 'CHAIN.*',
    URL: process.env.NATS_URL ?? 'nats://localhost:4222',
    VERBOSE: process.env.NATS_VERBOSE ?? false
  },
  REDIS: {
    DATABASE: parseInt(process.env.REDIS_DATABASE ?? '0'),
    HOST: process.env.REDIS_HOST ?? 'localhost',
    PASSWORD: process.env.REDIS_PASSWORD ?? 'xD',
    PORT: parseInt(process.env.REDIS_PORT ?? '6379')
  },
  SERVER: {
    DISABLE_REQUEST_LOGGING: !process.env.SERVER_DISABLE_REQUEST_LOGGING ?? false,
    HOST: process.env.SERVER_HOST ?? '192.168.0.100',
    PORT: parseInt(process.env.SERVER_PORT ?? '5000'),
    TRUST_PROXY_ENABLED: !process.env.TRUST_PROXY_ENABLED ?? true,
  }
}
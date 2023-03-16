/**
 * Description placeholder
 * @date 3/3/2023 - 10:43:35 AM
 *
 * @param {(string | undefined)} value
 * @returns {(string[] | void)}
 */
function stringToList (value: string | undefined): string[] | void {
  if (value === undefined) {
    throw new Error('Value is undefined')
  } else {
    return value.split(',')
  }
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:43:35 AM
 *
 * @type {({ AFRICASTALKING: { VALID_IPS: void | {}; }; API: { VERSION: any; }; CIC_CUSTODIAL: { BALANCE_ENDPOINT: any; REGISTER_ENDPOINT: any; TRANSFER_ENDPOINT: any; }; CIC_GRAPH: { GRAPHQL_ENDPOINT: any; HASURA_ADMIN_SECRET: any; }; ... 6 more ...; SERVER: { ...; }; })}
 */
export const config = {
  AFRICASTALKING: {
    VALID_IPS: stringToList(process.env.AFRICASTALKING_VALID_IPS) ?? [
      '0.0.0.0'
    ]
  },
  API: {
    VERSION: process.env.API_VERSION ?? 'v1'
  },
  CIC_CUSTODIAL: {
    BALANCE_ENDPOINT:
        process.env.CIC_CUSTODIAL_BALANCE_ENDPOINT ??
        'https://data-warehouse.sarafu.network/public/balances/',
    REGISTER_ENDPOINT:
        process.env.CIC_CUSTODIAL_REGISTER_ENDPOINT ??
        'http://192.168.0.103:5005/api/account/create',
    TRANSFER_ENDPOINT:
        process.env.CIC_CUSTODIAL_TRANSFER_ENDPOINT ??
        'http://192.168.0.103:5005/api/sign/transfer'
  },
  CIC_GRAPH: {
    GRAPHQL_ENDPOINT:
        process.env.CIC_GRAPH_GRAPHQL_ENDPOINT ??
        'http://localhost:6080/v1/graphql',
    HASURA_ADMIN_SECRET: process.env.CIC_GRAPH_HASURA_ADMIN_SECRET ?? 'admin'
  },
  DATABASE: {
    URL: process.env.DATABASE_URL
  },
  DEFAULT_VOUCHER: {
    ADDRESS: process.env.DEFAULT_VOUCHER_ADDRESS ?? "0xB92463E2262E700e29c16416270c9Fdfa17934D7",
    SYMBOL: process.env.DEFAULT_VOUCHER_SYMBOL ?? "TRN",
  },
  DEV: process.env.NODE_ENV !== 'production',
  LOG: {
    LEVEL: process.env.LOG_LEVEL ?? 'info'
  },
  NATS: {
    CHAIN: {
      STREAM_NAME: process.env.NATS_CHAIN_STREAM_NAME ?? 'CHAIN',
      SUBJECTS: process.env.NATS_CHAIN_SUBJECTS ?? 'CHAIN.*',
    },
    CLIENT_NAME: process.env.NATS_CLIENT_NAME ?? 'cic-ussd',
    DRAIN_ON_SHUTDOWN: process.env.NATS_DRAIN_ON_SHUTDOWN ?? true,
    URL: process.env.NATS_URL ?? 'nats://localhost:4222',
    VERBOSE: process.env.NATS_VERBOSE ?? false
  },
  REDIS: {
    EPHEMERAL_DATABASE: parseInt(process.env.REDIS_EPHEMERAL_DATABASE ?? '0'),
    HOST: process.env.REDIS_HOST ?? 'localhost',
    PASSWORD: process.env.REDIS_PASSWORD ?? 'xD',
    PERSISTENT_DATABASE: parseInt(process.env.REDIS_PERSISTENT_DATABASE ?? '1'),
    PORT: parseInt(process.env.REDIS_PORT ?? '6379')
  },
  RPC: {
    ENDPOINT: process.env.RPC_ENDPOINT ?? 'https://rpc.alfajores.celo.grassecon.net'
  },
  SERVER: {
    DISABLE_REQUEST_LOGGING:
        !process.env.SERVER_DISABLE_REQUEST_LOGGING ?? false,
    HOST: process.env.SERVER_HOST ?? '192.168.0.100',
    PORT: parseInt(process.env.SERVER_PORT ?? '5000'),
    TRUST_PROXY_ENABLED: !process.env.TRUST_PROXY_ENABLED ?? true
  }
}

import * as process from 'process';

function stringToList (value: string | undefined): string[] | void {
  if (value === undefined) {
    throw new Error('Value is undefined')
  } else {
    return value.split(',')
  }
}

export const config = {
  AT: {
    API_KEY: process.env.AT_API_KEY ?? 'x',
    SENDER_ID: process.env.AT_SENDER_ID ?? undefined,
    SMS_WEBHOOK_SECRET: process.env.AT_SMS_WEBHOOK_SECRET ?? 'xD',
    URL: process.env.AT_URL ?? 'https://api.sandbox.africastalking.com/version1/messaging',
    USERNAME: process.env.AT_USERNAME ?? 'x',
    USSD_ENDPOINT_SECRET: process.env.AT_USSD_ENDPOINT_SECRET ?? 'xE',
    VALID_IPS: stringToList(process.env.AT_VALID_IPS) ?? [
      '0.0.0.0',
      '127.0.0.1'
    ]
  },
  CIC: {
    CUSTODIAL: process.env.CIC_CUSTODIAL ?? 'http://localhost:5002',
    GRAPH: process.env.CIC_GRAPH ?? 'http://localhost:8082',
    GRAPH_SECRET: process.env.CIC_GRAPH_SECRET ?? 'admin',
    RPC: process.env.CIC_RPC ?? 'http://localhost:8545',
  },
  DATABASE: {
    URL: process.env.DATABASE_URL
  },
  DEFAULT_VOUCHER: {
    ADDRESS: process.env.DEFAULT_VOUCHER_ADDRESS ?? '0x1F2a419BDb18542b82Dc4fE26b9a3AFC3726B1bF',
    SYMBOL: process.env.DEFAULT_VOUCHER_SYMBOL ?? "TRN",
  },
  DEV: process.env.NODE_ENV !== 'production',
  KE: {
    SUPPORT_PHONE: process.env.SUPPORT_PHONE ?? '0757628885',
  },
  LOG: {
    LEVEL: process.env.LOG_LEVEL ?? 'info',
    NAME: process.env.LOG_NAME ?? 'cic-ussd',
  },
  NATS: {
    DURABLE_NAME: process.env.NATS_DURABLE_NAME ?? 'cic-ussd',
    SERVER: process.env.NATS_SERVER ?? 'nats://localhost:4222',
    STREAM_NAME: process.env.NATS_STREAM_NAME ?? 'CHAIN',
    SUBJECT: process.env.NATS_SUBJECTS ?? '*'
  },
  REDIS: {
    EPHEMERAL_DSN: process.env.REDIS_EPHEMERAL_DSN ?? 'redis://localhost:6379/3',
    PERSISTENT_DSN: process.env.REDIS_PERSISTENT_DSN ?? 'redis://localhost:6379/4',
  },
  SERVER: {
    DISABLE_REQUEST_LOGGING: !process.env.SERVER_DISABLE_REQUEST_LOGGING ?? false,
    HOST: process.env.SERVER_HOST ?? '127.0.0.1',
    PORT: parseInt(process.env.SERVER_PORT ?? '5000'),
    TRUST_PROXY_ENABLED: !process.env.TRUST_PROXY_ENABLED ?? true
  },
  TIMEZONE: process.env.TIMEZONE ?? 'Africa/Nairobi'
}

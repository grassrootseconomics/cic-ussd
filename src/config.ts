export const config = {
  USSD: {
    ROUTE_SECRET: process.env.USSD_ROUTE_SECRET ?? 'xD',
    COUNTRY_CODE: process.env.USSD_COUNTRY_CODE ?? 'KE',
  },
  DEV: process.env.NODE_ENV === 'production' ? false : true,
  LOG: {
    LEVEL: process.env.LOG_LEVEL ?? 'info',
  },
  SERVER: {
    HOST: process.env.SERVER_HOST ?? '127.0.0.1',
    PORT: Number(process.env.SERVER_PORT ?? 5000),
  },
  POSTGRES: {
    DSN: process.env.POSTGRES_DSN ?? 'postgresql://postgres:postgres@localhost:5432/cic_ussd',
  },
  FRONTEND: {
    HOST: process.env.FRONTEND_HOST ?? true,
  },
}

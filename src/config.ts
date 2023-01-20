export const config = {
  API: {
    VERSION: process.env.API_VERSION
  },
  AFRICAS_TALKING: {
    VALID_IPS: process.env.AFRICASTALKING_VALID_IPS
  },
  CIC_CUSTODIAL:{
    REGISTER_ENDPOINT: process.env.CIC_CUSTODIAL_REGISTER_ENDPOINT ?? 'http://localhost:5000/api/register',
    TRANSFER_ENDPOINT: process.env.CIC_CUSTODIAL_TRANSFER_ENDPOINT ?? 'http://localhost:5000/api/transfer',
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
    LEVEL: process.env.LOG_LEVEL
  },
  REDIS: {
    DATABASE: parseInt(process.env.REDIS_DATABASE ?? '0'),
    HOST: process.env.REDIS_HOST ?? 'localhost',
    PASSWORD: process.env.REDIS_PASSWORD ?? 'xD',
    PORT: parseInt(process.env.REDIS_PORT ?? '6379')
  },
  SERVER: {
    HOST: process.env.SERVER_HOST,
    PORT: parseInt(process.env.SERVER_PORT ?? '5000')
  }
}
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { GraphQLClient } from 'graphql-request';

declare module 'fastify' {
  interface FastifyInstance {
    graphql: GraphQLClient
  }
}

interface GraphQLPluginOptions {
  endpoint: string
  secret: string
}

const graphqlPlugin: FastifyPluginAsync<GraphQLPluginOptions> = async (fastify, opts) => {
  const { endpoint, secret } = opts
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: { 'x-hasura-admin-secret': secret }
  })
  fastify.log.debug(`GraphQL client created with endpoint ${endpoint}.`)

  fastify.decorate('graphql', graphQLClient)
}

export default fp(graphqlPlugin, {
  fastify: '4.x',
  name: 'graphql'
})

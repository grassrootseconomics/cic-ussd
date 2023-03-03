import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { GraphQLClient } from "graphql-request";

declare module 'fastify' {
  interface FastifyInstance {
    graphql: GraphQLClient
  }
}

/**
 * Interface for GraphQLPlugin options.
 * @interface GraphQLPluginOptions
 * @property {string} endpoint - The GraphQL endpoint to connect to.
 */
interface GraphQLPluginOptions {
  endpoint: string
  secret: string
}

/**
 * Plugin that creates a `GraphQLClient` and decorates the Fastify instance with it.
 * @param fastify - The Fastify instance.
 */
const graphqlPlugin: FastifyPluginAsync<GraphQLPluginOptions> = async (fastify, opts) => {
  const { endpoint, secret } = opts
  const graphQLClient = new GraphQLClient(endpoint, {
    headers: { 'x-hasura-admin-secret': secret }
  })
  fastify.log.debug(`GraphQL client created with endpoint ${endpoint}`)

  fastify.decorate('graphql', graphQLClient)
}

export default fp(graphqlPlugin, {
  fastify: '4.x',
  name: 'graphql'
})

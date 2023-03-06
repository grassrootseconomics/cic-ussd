import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { GraphQLClient } from "graphql-request";

declare module 'fastify' {
  interface FastifyInstance {
    graphql: GraphQLClient
  }
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:49:55 AM
 *
 * @interface GraphQLPluginOptions
 * @typedef {GraphQLPluginOptions}
 */
interface GraphQLPluginOptions {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:49:54 AM
   *
   * @type {string}
   */
  endpoint: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:49:54 AM
   *
   * @type {string}
   */
  secret: string
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:49:54 AM
 *
 * @async
 * @param {*} fastify
 * @param {*} opts
 * @returns {*}
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

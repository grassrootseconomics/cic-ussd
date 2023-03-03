import { ethers, Provider } from "ethers";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

/**
 * Extends the FastifyInstance interface to add the provider property.
 * This is required to avoid TypeScript errors when accessing the provider property.
 * @see https://www.fastify.io/docs/latest/TypeScript/#type-declaration-for-fastifyinstance
 */
declare module 'fastify' {
  interface FastifyInstance {
    provider: Provider
  }
}

/**
 * Interface for EthPlugin options.
 * @interface EthPluginOptions
 * @property {string} endpoint - The RPC endpoint to connect to.
 */
interface EthPluginOptions {
  endpoint: string
}

/**
 * Fastify plugin that creates an Ethers provider instance and decorates it onto the fastify instance.
 * Also adds a hook to destroy the provider instance on server close.
 * @param fastify - The Fastify instance.
 * @param {EthPluginOptions} opts - The eth plugin options.
 */
const ethPlugin: FastifyPluginAsync<EthPluginOptions> = async (fastify, opts) => {
  const { endpoint } = opts
  const rpcProvider = new ethers.JsonRpcProvider(endpoint)
  fastify.log.debug(`Ethers provider created with RPC endpoint ${endpoint}`)

  fastify.decorate('provider', rpcProvider)

  fastify.addHook('onClose', async (instance) => {
    await rpcProvider.destroy()
  })
}

export default fp(ethPlugin, {
  fastify: '4.x',
  name: 'eth'
})

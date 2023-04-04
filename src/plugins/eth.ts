import { ethers, Provider } from 'ethers';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';


declare module 'fastify' {
  interface FastifyInstance {
    provider: Provider
  }
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:49:36 AM
 *
 * @interface EthPluginOptions
 * @typedef {EthPluginOptions}
 */
interface EthPluginOptions {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:49:36 AM
   *
   * @type {string}
   */
  endpoint: string
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:49:36 AM
 *
 * @async
 * @param {*} fastify
 * @param {*} opts
 * @returns {*}
 */
const ethPlugin: FastifyPluginAsync<EthPluginOptions> = async (fastify, opts) => {
  const { endpoint } = opts
  const rpcProvider = new ethers.JsonRpcProvider(endpoint)
  fastify.log.debug(`Ethers provider created with RPC endpoint ${endpoint}.`)

  fastify.decorate('provider', rpcProvider)

  fastify.addHook('onClose', async (_) => {
    rpcProvider.destroy()
  })
}

export default fp(ethPlugin, {
  fastify: '4.x',
  name: 'eth'
})

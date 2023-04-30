import { ethers, Provider } from 'ethers';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';


declare module 'fastify' {
  interface FastifyInstance {
    provider: Provider
  }
}


interface EthPluginOptions {
  endpoint: string
}

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

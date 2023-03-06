import { Account } from "@db/models/account";
import { PostgresDb } from "@fastify/postgres";
import { getPI } from "@lib/graph/user";
import { config } from "@src/config";
import { Cache } from "@utils/redis";

import { GraphQLClient } from "graphql-request";
import { Redis as RedisClient } from "ioredis";
import { Provider, ethers } from "ethers";
import { cashRounding } from "@lib/ussd/utils";
import {pointer} from "@lib/ussd/session";

export enum AccountMetadata {
  GUARDIANS = ":cic.guardians",
  PROFILE = ":cic.profile",
  STATEMENT = ":cic.statement",

}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:44:47 AM
 *
 * @export
 * @async
 * @param {Partial<Account>} account
 * @param {PostgresDb} db
 * @param {GraphQLClient} graphqlClient
 * @param {RedisClient} redis
 * @returns {*}
 */
export async function loadProfile (account: Partial<Account>, db: PostgresDb, graphqlClient: GraphQLClient, redis: RedisClient) {
  redis.select(config.REDIS.PERSISTENT_DATABASE)
  const key = pointer([AccountMetadata.PROFILE, account.address])
  const cache = new Cache(redis, key)
  const meta = await cache.get()

  if (!meta) {
    try {
      console.debug(`Loading personal information from graph for: ${account.address}}`)
      const meta = await getPI(graphqlClient, account.id)
      if (meta) {
        await cache.setJSON(meta)
      }
    } catch (error) {
      console.error(error)
    }
  }
}

export async function getAccountMetadata (address: string, redis: RedisClient, salt: AccountMetadata) {
  redis.select(config.REDIS.PERSISTENT_DATABASE)
  const key = pointer([salt, address])
  const cache = new Cache(redis, key)
  return cache.getJSON()
}

export async function setAccountMetadata (address: string, redis: RedisClient, salt: AccountMetadata, data: unknown) {
  redis.select(config.REDIS.PERSISTENT_DATABASE)
  const key = pointer([salt, address])
  const cache = new Cache(redis, key)
  return cache.setJSON(data)
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:44:47 AM
 *
 * @export
 * @async
 * @param {string} address
 * @param {string} contract
 * @param {Provider} provider
 * @returns {unknown}
 */
export async function retrieveWalletBalance (address: string, contract: string, provider: Provider) {
  const erc20Contract = new ethers.Contract(
    contract,
    ['function balanceOf(address owner) view returns (uint256)'],
    provider
  )
  const wei = await erc20Contract.balanceOf(address)
  return cashRounding(ethers.formatUnits(wei, 6))
}

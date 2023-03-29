import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { Cache } from '@utils/redis';

export interface Marketplace {
  account: number;
  id: number;
  marketplace_name: string;
}


export async function upsertMarketplace(graphQlClient: GraphQLClient, marketplace: Partial<Marketplace>, phoneNumber: string,  redis: RedisClient): Promise<Partial<Marketplace>> {
  const query = `mutation UpsertMarketplace($marketplace: marketplaces_insert_input!) {
    insert_marketplaces_one(object: $marketplace, on_conflict: {constraint: marketplaces_account_key, update_columns: marketplace_name}) {
      id
      marketplace_name
    }
  }`

  const variables = {
    marketplace,
  }

  const data = await graphQlClient.request<{ insert_marketplaces_one: Partial<Marketplace> }>(query, variables)
  const { insert_marketplaces_one: updatedMarketplace } = data

  await updateCachedMarketPlace(phoneNumber, updatedMarketplace.marketplace_name, redis)
  return updatedMarketplace
}

export async function updateCachedMarketPlace(phoneNumber: string, name: string, redis: RedisClient){
  const cache = new Cache(redis, phoneNumber)
  await cache.updateJSON({
    graph: {
      marketplace: {
      marketplace_name: name
      }
    }
  })
}

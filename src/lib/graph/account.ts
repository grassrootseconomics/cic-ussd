import { GraphQLClient } from 'graphql-request';
import { graphUserFields } from '@lib/graph/user';

export enum GraphAccountTypes {
  CUSTODIAL_PERSONAL = 'CUSTODIAL_PERSONAL',
  CUSTODIAL_BUSINESS = 'CUSTODIAL_BUSINESS',
  CUSTODIAL_COMMUNITY = 'CUSTODIAL_COMMUNITY',
  CUSTODIAL_SYSTEM = 'CUSTODIAL_SYSTEM'
}

interface GraphAccount {
  account_type: string
  blockchain_address: string
  id?: number
  user_identifier: number
}

export const graphAccFields = `account_type blockchain_address id user ${graphUserFields}`

export async function createGraphAccount(graphQlClient: GraphQLClient, account: Partial<GraphAccount>): Promise<Partial<GraphAccount>> {
  const query = `mutation CreateAccount($account: accounts_insert_input!) {
    insert_accounts_one(object: $account) {id}
  }`

  const variables = {
    account,
  }
  const data = await graphQlClient.request<{ insert_accounts_one: Partial<GraphAccount>  }>(query, variables)
  return data.insert_accounts_one
}

import { GraphQLClient } from "graphql-request";
import { graphUserFields } from "@lib/graph/user";

/**
 * Enum for account types
 * @date 3/3/2023 - 10:29:28 AM
 *
 * @export
 * @enum {number}
 */
export enum GraphAccountTypes {
  CUSTODIAL_PERSONAL = 'CUSTODIAL_PERSONAL',
  CUSTODIAL_BUSINESS = 'CUSTODIAL_BUSINESS',
  CUSTODIAL_COMMUNITY = 'CUSTODIAL_COMMUNITY',
  CUSTODIAL_SYSTEM = 'CUSTODIAL_SYSTEM'
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:30:23 AM
 *
 * @interface GraphAccount
 * @typedef {GraphAccount}
 */
interface GraphAccount {
  account_type: string
  blockchain_address: string
  id?: number
  user_identifier: number
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:30:39 AM
 *
 * @type {string}
 */
export const graphAccFields = `account_type blockchain_address id user ${graphUserFields}`

/**
 * Description placeholder
 * @date 3/3/2023 - 10:30:47 AM
 *
 * @export
 * @async
 * @param {GraphQLClient} graphQlClient
 * @param {Partial<GraphAccount>} account
 * @returns {Promise<Partial<GraphAccount>>}
 */
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

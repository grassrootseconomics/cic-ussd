import { graphAccFields } from "@lib/graph/account";
import { GraphQLClient } from "graphql-request";

/**
 * Description placeholder
 * @date 3/3/2023 - 10:31:09 AM
 *
 * @export
 * @enum {number}
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:31:27 AM
 *
 * @type {string}
 */
export const pIFields = `
            family_name
            gender
            given_names
            location_name
            year_of_birth
          `

/**
 * Description placeholder
 * @date 3/3/2023 - 10:32:13 AM
 *
 * @type {string}
 */
export const graphUserFields = `id activated personal_information ${pIFields} ${graphAccFields}`



/**
 * Description placeholder
 * @date 3/3/2023 - 10:35:14 AM
 *
 * @export
 * @interface PI
 * @typedef {PI}
 */
export interface PI {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {string}
   */
  family_name: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {string}
   */
  gender: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {string}
   */
  geo: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {string}
   */
  given_names: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {string}
   */
  location_name: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {number}
   */
  user_identifier: number
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {number}
   */
  year_of_birth: number
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:32:34 AM
 *
 * @export
 * @interface GraphUser
 * @typedef {GraphUser}
 */
export interface GraphUser {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {boolean}
   */
  activated: boolean
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {number}
   */
  id: number
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {string}
   */
  interface_identifier: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {string}
   */
  interface_type: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:41:45 AM
   *
   * @type {PI}
   */
  personal_information: PI
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:32:46 AM
 *
 * @export
 * @async
 * @param {GraphQLClient} graphql
 * @param {number} id
 * @returns {Promise<PI>}
 */
export async function getPI(graphql: GraphQLClient, id: number): Promise<PI> {
  const query = `query getPI($id: Int!) {
    personal_information(where: {user_identifier: {_eq: $id}}) {
      ${pIFields}
    }
  }`
  const variables = {
    id,
  }
  const data = await graphql.request<{ personal_information: PI }>(query, variables)
  return data.personal_information
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:33:55 AM
 *
 * @export
 * @async
 * @param {GraphQLClient} graphql
 * @param {Partial<GraphUser>} user
 * @returns {Promise<Partial<GraphUser>>}
 */
export async function createGraphUser(graphql: GraphQLClient, user: Partial<GraphUser>): Promise<Partial<GraphUser>> {
  const query = `mutation CreateUser($user: users_insert_input!) {
    insert_users_one(object: $user) {id}
  }`
  const variables = {
    user,
  }
  const data = await graphql.request<{ insert_users_one: Partial<GraphUser> }>(query, variables)
  return data.insert_users_one
}

export async function updateGraphUser(graphql: GraphQLClient, id: number, user: Partial<GraphUser>): Promise<Partial<GraphUser>> {
  const query = `mutation UpdateUser($user: users_set_input!, $id: Int!) {
    update_users_by_pk(pk_columns: {id: $id}, _set: $user) {id}
  }`
  const variables = {
    user,
    id: id,
  }
  const data = await graphql.request<{ update_users_by_pk: Partial<GraphUser> }>(query, variables)
  return data.update_users_by_pk
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:34:23 AM
 *
 * @export
 * @async
 * @param {GraphQLClient} graphql
 * @param {Partial<PI>} pi
 * @returns {Promise<Partial<PI>>}
 */
export async function updatePI(graphql: GraphQLClient, pi: Partial<PI>): Promise<Partial<PI>> {
  const query = `mutation UpdatePI($pi: personal_information_set_input!, $id: Int!) {
    update_personal_information(where: {user_identifier: {_eq: $id}}, _set: $pi) 
    {affected_rows}
    returning {${pIFields}}
  }`
  const variables = {
    pi,
    id: pi.user_identifier,
  }
  const data = await graphql.request<{ update_personal_information: { affected_rows: number,  returning: Partial<PI> } }>(query, variables)
  return data.update_personal_information.returning
}

export async function upsertPI(graphql: GraphQLClient, pi: Partial<PI>): Promise<Partial<PI>> {
  const query = `mutation UpsertPI($pi: personal_information_insert_input!) {
    insert_personal_information_one(object: $pi, on_conflict: {constraint: personal_information_pkey, update_columns: [${pIFields}]}) {id}
  }`
  const variables = {
    pi,
  }
  const data = await graphql.request<{ insert_personal_information_one: Partial<PI> }>(query, variables)
  return data.insert_personal_information_one
}

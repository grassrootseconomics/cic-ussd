import {GraphQLClient} from "graphql-request";
import {Redis as RedisClient} from "ioredis";
import {AccountMetadata} from "@lib/ussd/account";
import {pointer} from "@lib/ussd/session";
import {Cache} from "@utils/redis";


export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export const personalInformationFields = `
 family_name
 gender
 given_names
 location_name
 year_of_birth`

export const graphUserFields = `
  id
  activated
  personal_information {
    ${personalInformationFields}
  }`



export interface PersonalInformation {
  family_name: string
  gender: string
  geo: string
  given_names: string
  location_name: string
  user_identifier: number
  year_of_birth: number
}


export interface GraphUser {
  activated: boolean
  id: number
  interface_identifier: string
  interface_type: string
  personal_information: PersonalInformation
}


function getRequestedFields(personalInformation: Partial<PersonalInformation>) {
  let requestedFields = '';

  for (const field of personalInformationFields.split('\n')) {
    const fieldName = field.trim();
    if (personalInformation.hasOwnProperty(fieldName)) {
      requestedFields += `${fieldName}\n`;
    }
  }

  return requestedFields.trim();
}

export async function getProfile(
  address: string,
  graphql: GraphQLClient,
  interface_identifier: number,
  redis: RedisClient
) {
  const cache = new Cache(redis, pointer([address, AccountMetadata.PROFILE]))
  let profile = await cache.getJSON()

  if (!profile) {
    const user = await getGraphUser(graphql, interface_identifier.toString())
    await cache.setJSON(user)
  }
  return profile
}

export async function getGraphUser(graphql: GraphQLClient, interface_identifier: string): Promise<Partial<GraphUser>> {
  const query = `query GetUser($interface_identifier: String!) {
    users(where: {interface_identifier: {_eq: $interface_identifier}}) {${graphUserFields}}}`

  const variables = {
    interface_identifier
  }

  const data = await graphql.request<{ users: Partial<GraphUser>[] }>(query, variables)
  return data.users[0]
}

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

// upsert only the provided fields in the personal information based on the user identifier
export async function upsertPersonalInformation(
  address: string,
  graphql: GraphQLClient,
  personal_information: Partial<PersonalInformation>,
  redis: RedisClient
) {
  const updatedFields = getRequestedFields(personal_information)
  const query = `mutation UpsertPersonalInformation(
  $personal_information: personal_information_insert_input!) {
    insert_personal_information_one(
    object: $personal_information, 
    on_conflict: {
      constraint: personal_information_user_identifier_key, 
      update_columns: [${updatedFields}]
      }) { ${updatedFields} } 
    }`

  const variables = {
    personal_information
  }

  const data = await graphql.request<{ insert_personal_information_one: Partial<PersonalInformation> }>(query, variables)
  const updatedPersonalInformation = data.insert_personal_information_one
  const cache = new Cache(redis, pointer([address, AccountMetadata.PROFILE]))
  cache.updateJSON({
    personal_information: updatedPersonalInformation
  })
  return updatedPersonalInformation
}

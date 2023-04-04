import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { Address } from '@lib/ussd/utils';
import { Cache } from '@utils/redis';


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
  gender: Gender
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
  personal_information: Partial<PersonalInformation>
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

export async function getPersonalInformation(address: Address, graphql: GraphQLClient){
  const query = `query GetPersonalInformation($address: String!) {
   personal_information(where: {user: {accounts: {blockchain_address: {_eq: $address}}}}) {${personalInformationFields}}}`

  const variables = {
    address
  }
  const data = await graphql.request<{ personal_information: Partial<PersonalInformation>[] }>(query, variables)
  return data.personal_information[0]
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

export async function updateGraphUser(id: number, graphql: GraphQLClient, user: Partial<GraphUser>): Promise<Partial<GraphUser>> {
  const query = `mutation UpdateUser($user: users_set_input!, $id: Int!) {
    update_users_by_pk(pk_columns: {id: $id}, _set: $user) {id}
  }`
  const variables = {
    user,
    id: id
  }
  const data = await graphql.request<{ update_users_by_pk: Partial<GraphUser> }>(query, variables)
  return data.update_users_by_pk
}

// upsert only the provided fields in the personal information based on the user identifier
export async function upsertPersonalInformation(
  address: string,
  graphql: GraphQLClient,
  personal_information: Partial<PersonalInformation>,
  phoneNumber: string,
  redis: RedisClient
) {
  const updatedFields = getRequestedFields(personal_information);
  const constraint = 'personal_information_user_identifier_key';
  const query = `
    mutation UpsertPersonalInformation($personal_information: personal_information_insert_input!) {
      insert_personal_information_one(
        object: $personal_information,
        on_conflict: { constraint: ${constraint}, update_columns: [${updatedFields}] }
      ) { ${updatedFields} }
    }`;

  const variables = { personal_information };
  const { insert_personal_information_one: updatedPersonalInformation } = await graphql.request<{ insert_personal_information_one: Partial<PersonalInformation> }>(query, variables);
  await updateCacheUser(updatedPersonalInformation, phoneNumber, redis);
}

export async function updateCacheUser(personalInformation: Partial<PersonalInformation>, phoneNumber: string, redis: RedisClient) {
  const cache = new Cache(redis, phoneNumber);
  const tag = personalInformation.given_names && personalInformation.family_name
    ? `${personalInformation.given_names} ${personalInformation.family_name} ${phoneNumber}`
    : phoneNumber;

  await cache.updateJSON({ graph: { personal_information: personalInformation }, tag });
}



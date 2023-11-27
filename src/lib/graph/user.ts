import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { UserService } from '@services/user';


export enum Gender { MALE = 'MALE', FEMALE = 'FEMALE' }

export enum GraphAccountTypes {
  CUSTODIAL_PERSONAL = 'CUSTODIAL_PERSONAL'
}

export const personalInformationFields = `
 family_name
 gender
 given_names
 language_code
 location_name
 year_of_birth`

export interface PersonalInformation {
  family_name: string
  gender: Gender
  geo: string
  given_names: string
  language_code: string
  location_name: string
  user_identifier: number
  year_of_birth: number
}

export interface GraphAccount {
  account_type: string
  blockchain_address: string
  id: number
  marketplace: GraphMarketplace
  tills: GraphTill[]
  vpas: GraphVpa[]
  user_identifier: number
}

export interface GraphMarketplace {
  account: number;
  id: number;
  marketplace_name: string;
}

export interface GraphTransaction {
  sender_address: string;
  date_block: number;
  recipient_address: string;
  tx_hash: string;
  tx_value: number;
  voucher_address: string;
}

export interface GraphIdentifier {
  account: GraphAccount
  id: number;
  linked_account: number;
}

export interface GraphTill extends GraphIdentifier {
  till: string;
}

export interface GraphVpa extends GraphIdentifier{
  vpa: string;
}


export interface GraphUser {
  activated: boolean
  accounts: GraphAccount[]
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

export async function createGraphUser(
  activated: boolean,
  graphql: GraphQLClient,
  interfaceIdentifier: string,
  interfaceType: string,
  languageCode: string): Promise<Partial<GraphUser>> {
  const query = `mutation CreateUser($activated: Boolean!, $interfaceIdentifier: String!, $interfaceType: interface_type_enum!, $languageCode: String!) {
    insert_users_one(object: {
      activated: $activated,
      interface_identifier: $interfaceIdentifier,
      interface_type: $interfaceType,
      personal_information: { 
        data: { language_code: $languageCode}
      }
    }) {id}
  }`
  const variables = { activated, interfaceIdentifier, interfaceType, languageCode }
  const data = await graphql.request<{ insert_users_one: Partial<GraphUser> }>(query, variables)
  return data.insert_users_one
}

export async function createGraphAccount(graphql: GraphQLClient, account: Partial<GraphAccount>): Promise<Partial<GraphAccount>> {
  const query = `mutation CreateAccount($account: accounts_insert_input!) {
    insert_accounts_one(object: $account) {id}
  }`

  const variables = {
    account,
  }
  const data = await graphql.request<{ insert_accounts_one: Partial<GraphAccount>  }>(query, variables)
  return data.insert_accounts_one
}

export async function createGraphMarketplace(graphql: GraphQLClient, marketplace: Partial<GraphMarketplace>, phoneNumber: string, redis: RedisClient) {
  const query = `mutation CreateMarketplace($marketplace: marketplaces_insert_input!) {
    insert_marketplaces_one(object: $marketplace) {id account marketplace_name}
  }`

  const variables = {
    marketplace,
  }
  const data = await graphql.request<{ insert_marketplaces_one: GraphMarketplace  }>(query, variables)
  await new UserService(phoneNumber, redis).update({
    graph: {
      account: {
        marketplace: data.insert_marketplaces_one
      }
    }
  })
  return data.insert_marketplaces_one
}

export async function createGraphPersonalInformation(
  address: string,
  graphql: GraphQLClient,
  personal_information: Partial<PersonalInformation>,
  phoneNumber: string,
  redis: RedisClient
) {
  const insertedFields = getRequestedFields(personal_information);
  const query = `
    mutation InsertPersonalInformation($personal_information: personal_information_insert_input!) {
      insert_personal_information_one(object: $personal_information) {
        ${insertedFields}
      }
    }`;

  const variables = { personal_information };
  const result = await graphql.request<{ insert_personal_information_one: Partial<PersonalInformation> }>(query, variables);
  await new UserService(phoneNumber, redis).update({
    graph: {
      personalInformation: result.insert_personal_information_one,
    }
  })
  return result.insert_personal_information_one;
}

export async function getGraphAddressFromTill(graphql: GraphQLClient, till: string) {
  const query = `query GetAddressFromTill($till: String!) {
    till(where: {till: {_eq: $till}}) {
      account {blockchain_address}
    }
  }`

  const variables = {
    till,
  }
  const data = await graphql.request<{ till: GraphTill[]}>(query, variables)
  return data.till[0].account.blockchain_address
}

export async function getGraphAddressFromVpa(graphql: GraphQLClient, vpa: string) {
  const query = `query GetAddressFromVpa($vpa: String!) {
      vpa(where: {vpa: {_eq: $vpa}}) {
        account {blockchain_address}
        }
    }`

  const variables = {
    vpa,
  }
  const data = await graphql.request<{ vpa: GraphVpa[] }>(query, variables)
  return data.vpa[0].account.blockchain_address
}

export async function getGraphPersonalInformation(address: string, graphql: GraphQLClient){
  const query = `query GetPersonalInformation($address: String!) {
   personal_information(where: {user: {accounts: {blockchain_address: {_eq: $address}}}}) {${personalInformationFields}}}`

  const variables = {
    address
  }
  const data = await graphql.request<{ personal_information: Partial<PersonalInformation>[] }>(query, variables)
  return data.personal_information[0]
}

export async function getFullGraphUserData(
  address: string,
  graphql: GraphQLClient,
  interfaceIdentifier: string,
  activated = true,
  transactionsLimit = 9,
  transactionSuccess = true){
  const query = `query retrieveFullUserGraphData($activated: Boolean!, $address: String!, $interfaceIdentifier: String!, $transactionSuccess: Boolean!, $transactionsLimit: Int!) {
    users(where: {interface_identifier: {_eq: $interfaceIdentifier}, activated: {_eq: $activated}, interface_type: {_eq: USSD}}) {
      id
      accounts(limit: 1){
        id
        marketplace { marketplace_name }
        tills { till }
        vpas { vpa }
      }
      personal_information{ ${personalInformationFields} }
    }
    transactions(where: {_or: [{recipient_address: {_eq: $address}}, {sender_address: {_eq: $address}}], success: {_eq: $transactionSuccess}}, limit: $transactionsLimit, order_by: {date_block: desc}) {
      recipient_address
      sender_address
      tx_type
      tx_value
      voucher_address
      date_block
      tx_hash
    }
  }`;

  const variables = {
    activated,
    address,
    interfaceIdentifier,
    transactionSuccess,
    transactionsLimit
  }
  return await graphql.request<{ users: GraphUser[], transactions: GraphTransaction[] }>(query, variables)
}

export async function updateGraphUser(graphql: GraphQLClient, id: number, user: Partial<GraphUser>): Promise<Partial<GraphUser>> {
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

export async function updateGraphMarketplace(
  id: number,
  graphql: GraphQLClient,
  marketplace: Partial<GraphMarketplace>,
  phoneNumber: string,
  redis: RedisClient){
  const query = `mutation UpdateMarketplace($marketplace: marketplaces_set_input!, $id: Int!) {
    update_marketplaces_by_pk(pk_columns: {id: $id}, _set: $marketplace) {marketplace_name}
  }`
  const variables = {
    marketplace,
    id: id
  }
  const data = await graphql.request<{ update_marketplaces_by_pk: Pick<GraphMarketplace, 'marketplace_name'> }>(query, variables)
  await new UserService(phoneNumber, redis).update({
    graph: {
      account: {
        marketplace: {
          marketplace_name: data.update_marketplaces_by_pk.marketplace_name
        }
      }
    }
  })
  return data.update_marketplaces_by_pk
}


export async function updateGraphPersonalInformation(
  address: string,
  graphql: GraphQLClient,
  personal_information: Partial<PersonalInformation>,
  phoneNumber: string,
  redis: RedisClient,
  user_identifier: number
) {
  const updatedFields = getRequestedFields(personal_information);
  const query = `
    mutation UpdatePersonalInformation($personal_information: personal_information_set_input!, $user_identifier: Int!) {
      update_personal_information(where: {user_identifier: {_eq: $user_identifier}}, _set: $personal_information) {
        returning { ${updatedFields} }
      }
    }`;

  const variables = { personal_information, user_identifier };
  const result = await graphql.request<{ update_personal_information: { returning: Partial<PersonalInformation>[] } }>(query, variables);
  const personalInformation = result.update_personal_information.returning[0]
  const tag = (personalInformation?.given_names && personalInformation?.family_name) ? `${personalInformation.given_names} ${personalInformation.family_name} ${phoneNumber}`: phoneNumber

  await new UserService(phoneNumber, redis).update({
    graph:{
      personalInformation
    },
    tag
  })
  return personalInformation;
}

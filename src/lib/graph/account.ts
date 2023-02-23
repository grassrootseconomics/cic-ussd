import { gql, GraphQLClient } from "graphql-request";
import { Account, accountFields } from "@lib/types/graph/account";
import { JSONToRawString } from "@utils/graphql";


export async function createAccount(graphqlClient: GraphQLClient, account: Account) {
  const mutation = gql`
    mutation createAccount{
      insert_accounts_one(object: ${JSONToRawString(account)}) {id}
    }`;
  const data = await graphqlClient.request(mutation);
  return data.insert_accounts_one;
}

export async function getAccounts(graphqlClient: GraphQLClient) {
    const query = gql`
      query {${accountFields}}`;
    return  await graphqlClient.request(query);
}


export async function getAccount(graphqlClient: GraphQLClient, id: number) {
    const query = gql`
      query {
        accounts_by_pk(id: ${id}) {${accountFields}}
      }`;
    return  await graphqlClient.request(query);
}

export async function getAccountByBlockchainAddress(graphqlClient: GraphQLClient, blockchainAddress: string) {
  const query = gql`
    query {
      accounts(where: {blockchain_address: {_eq: "${blockchainAddress}"}}) {${accountFields}}
      }`;
  return  await graphqlClient.request(query);
}

export async function updateAccount(graphqlClient: GraphQLClient, id: number, account: Account) {
  const mutation = gql`
    mutation updateAccount{
      update_accounts_by_pk(pk_columns: {id: ${id}}, _set: ${JSONToRawString(account)}) {
          ${accountFields}
      }
    }`;
  return await graphqlClient.request(mutation);
}

export async function deleteAccount(graphqlClient: GraphQLClient, id: number) {
  const mutation = gql`
    mutation deleteAccount{
      delete_accounts_by_pk(id: ${id}) {
          ${accountFields}
      }
    }`;
  return await graphqlClient.request(mutation);
}
import { gql, GraphQLClient } from "graphql-request";
import { JSONToRawString } from "@utils/graphql";
import {
  PersonalInformation,
  personalInformationFields,
  User,
  userAccountFields,
  userFields
} from "@lib/types/graph/user";


export async function createUser(graphqlClient: GraphQLClient, user: User) {
  const mutation = gql`
    mutation createUser{
      insert_users_one(object: ${JSONToRawString(user)}) {id}
    }`;
  const data = await graphqlClient.request(mutation);
  return data.insert_users_one;
}

export async function getUsers(graphqlClient: GraphQLClient) {
    const query = gql`
      query { users ${userFields}
      }`;
    return  await graphqlClient.request(query);
}

export async function getUser(graphqlClient: GraphQLClient, id: string) {
    const query = gql`
      query {
        users_by_pk(id: "${id}") {
            id
            created_at
            activated
            personal_information ${personalInformationFields}
            ${userAccountFields}
        }
      }`;
    return  await graphqlClient.request(query);
}

export async function addPersonalInformation(graphqlClient: GraphQLClient, personalInformation: PersonalInformation) {
  const mutation = gql`
    mutation addPersonalInformation{
      insert_personal_information_one(object: ${JSONToRawString(personalInformation)}) {
          ${personalInformationFields}
      }
    }`;
  return await graphqlClient.request(mutation);
}

export async function updatePersonalInformation(graphqlClient: GraphQLClient, user_identifier: number, personalInformation: PersonalInformation) {
  const mutation = gql`
    mutation updatePersonalInformation{
      update_personal_information(where: {user_identifier: {_eq: "${user_identifier}"}}, _set: ${JSONToRawString(personalInformation)}) {
          returning {
              ${personalInformationFields}
          }
      }
    }`;
  return await graphqlClient.request(mutation);
}


export async function deleteUser(graphqlClient: GraphQLClient, id: string) {
  const mutation = gql`
    mutation deleteUser{
      delete_users_by_pk(id: "${id}") {
          id
      }
    }`;
  return await graphqlClient.request(mutation);
}


export async function deletePersonalInformation(graphqlClient: GraphQLClient, user_identifier: number) {
  const mutation = gql`
    mutation deletePersonalInformation{
      delete_personal_information(where: {user_identifier: {_eq: "${user_identifier}"}}) {
          returning {
              user_identifier
          }
      }
    }`;
  return await graphqlClient.request(mutation);
}
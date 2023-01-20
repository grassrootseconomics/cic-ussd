import { GraphQLClient } from "graphql-request";
import { config } from "@src/config";
import {
  addPersonalInformation,
  createUser,
  deletePersonalInformation,
  deleteUser,
  getUser,
  getUsers,
  updatePersonalInformation
} from "@src/lib/graph/user";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  getAccountByBlockchainAddress,
  getAccount,
  updateAccount
} from "@lib/graph/account";
import { PersonalInformation, User } from "@lib/types/graph/user";
import { Account } from "@lib/types/graph/account";
import { getVoucherBySymbol, getVouchers } from "@lib/graph/voucher";

export class CicGraph {
  protected static readonly graphqlClient = new GraphQLClient(config.CIC_GRAPH.GRAPHQL_ENDPOINT, {
      headers: {
        "x-hasura-admin-secret": config.CIC_GRAPH.HASURA_ADMIN_SECRET
      },
    });

  static async createUser(user: User) {
    return await createUser(CicGraph.graphqlClient, user);
  }

  static async getAllUsers() {
    return await getUsers(CicGraph.graphqlClient);
  }

  static async getUserById(id: string) {
    return await getUser(CicGraph.graphqlClient, id);
  }

  static async deleteUser(id : string) {
    return await deleteUser(CicGraph.graphqlClient, id);
  }

  static async addUserPersonalInformation(personalInformation: PersonalInformation) {
    return await addPersonalInformation(CicGraph.graphqlClient, personalInformation);
  }

  static async updateUserPersonalInformation(user_identifier: number, personalInformation: PersonalInformation) {
    return await updatePersonalInformation(CicGraph.graphqlClient, user_identifier, personalInformation);
  }

  static async deleteUserPersonalInformation(user_identifier: number) {
    return await deletePersonalInformation(CicGraph.graphqlClient, user_identifier);
  }

  static async createAccount(account: Account) {
    return await createAccount(CicGraph.graphqlClient, account);
  }

  static async getAllAccounts() {
    return await getAccounts(CicGraph.graphqlClient);
  }

  static async getAccountById(id: number)
  {
    return await getAccount(CicGraph.graphqlClient, id);
  }

  static async getAccountByBlockchainAddress(blockchainAddress: string) {
    return await getAccountByBlockchainAddress(CicGraph.graphqlClient, blockchainAddress);
  }

  static async updateAccount(account: Account, id: number) {
    return await updateAccount(CicGraph.graphqlClient, id, account);
  }

  static async deleteAccount(id: number) {
    return await deleteAccount(CicGraph.graphqlClient, id);
  }

  static async getAllActiveVouchers() {
    return await getVouchers(CicGraph.graphqlClient);
  }

  static async getVoucherBySymbol(symbol: string) {
    return await getVoucherBySymbol(CicGraph.graphqlClient, symbol);
  }
}
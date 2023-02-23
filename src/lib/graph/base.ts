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

  graphqlClient: GraphQLClient;

  constructor() {
    this.graphqlClient = new GraphQLClient(config.CIC_GRAPH.GRAPHQL_ENDPOINT, {
      headers: {
        "x-hasura-admin-secret": config.CIC_GRAPH.HASURA_ADMIN_SECRET
      }
    });

  }

  async createUser(user: User) {
    return await createUser(this.graphqlClient, user);
  }

  async getAllUsers() {
    return await getUsers(this.graphqlClient);
  }

  async getUserById(id: string) {
    return await getUser(this.graphqlClient, id);
  }

  async deleteUser(id : string) {
    return await deleteUser(this.graphqlClient, id);
  }

  async addUserPersonalInformation(personalInformation: PersonalInformation) {
    return await addPersonalInformation(this.graphqlClient, personalInformation);
  }

  async updateUserPersonalInformation(user_identifier: number, personalInformation: PersonalInformation) {
    return await updatePersonalInformation(this.graphqlClient, user_identifier, personalInformation);
  }

  async deleteUserPersonalInformation(user_identifier: number) {
    return await deletePersonalInformation(this.graphqlClient, user_identifier);
  }

  async createAccount(account: Account) {
    return await createAccount(this.graphqlClient, account);
  }

  async getAllAccounts() {
    return await getAccounts(this.graphqlClient);
  }

  async getAccountById(id: number)
  {
    return await getAccount(this.graphqlClient, id);
  }

  async getAccountByBlockchainAddress(blockchainAddress: string) {
    return await getAccountByBlockchainAddress(this.graphqlClient, blockchainAddress);
  }

  async updateAccount(account: Account, id: number) {
    return await updateAccount(this.graphqlClient, id, account);
  }

  async deleteAccount(id: number) {
    return await deleteAccount(this.graphqlClient, id);
  }

  async getAllActiveVouchers() {
    return await getVouchers(this.graphqlClient);
  }

  async getVoucherBySymbol(symbol: string) {
    return await getVoucherBySymbol(this.graphqlClient, symbol);
  }
}
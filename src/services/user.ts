import { Redis as RedisClient } from 'ioredis';
import { CacheService } from '@services/redis';
import { DeepPartial } from 'ts-essentials';
import { PostgresDb } from '@fastify/postgres';
import { Account, AccountInterface } from '@db/models/account';
import { SystemError } from '@lib/errors';
import {
  getFullGraphUserData,
  getGraphPersonalInformation,
  GraphAccount,
  GraphTransaction,
  GraphUser,
  PersonalInformation
} from '@lib/graph/user';
import { GraphQLClient } from 'graphql-request';
import { generateStatement, generateSymbolMap, Transaction } from '@services/transfer';
import { Provider } from 'ethers';
import { CachedVoucher, getVoucherSymbol, retrieveWalletBalance } from '@lib/ussd';
import { logger } from '@/app';

export interface User {
  account: AccountInterface,
  graph: {
    account: Pick<GraphAccount, 'blockchain_address' | 'id' | 'marketplace' | 'tills' | 'vpas'>,
    personalInformation: PersonalInformation,
    user: Pick<GraphUser, 'id'>,
  },
  statement: Transaction[],
  tag: string,
  vouchers: {
    active: CachedVoucher,
    held: CachedVoucher[],
  }
}

async function generateHeldVouchers(address: string, provider: Provider, symbolMap: Map<string, string>){
  // check if symbol map is empty
  if (symbolMap.size === 0) {
    return []
  }

  const vouchers: CachedVoucher[] = []
  for (const [contractAddress, symbol] of symbolMap.entries()) {
    const balance = await retrieveWalletBalance(address, contractAddress, provider)
    vouchers.push({ balance, address: contractAddress, symbol })
  }
  return vouchers
}

export async function generateUserTag(address: string, graphql: GraphQLClient, phoneNumber: string): Promise<string> {
  const personalInformation = await getGraphPersonalInformation(address, graphql)
  const tag = `${personalInformation?.given_names ?? ''} ${personalInformation?.family_name ?? ''}`.trim()
  return tag ? `${tag} ${phoneNumber}` : phoneNumber
}

export async function getUserTag(phoneNumber: string, redis: RedisClient): Promise<string> {
  const tag = await new UserService(phoneNumber, redis).get(['tag'])
  return tag?.tag ?? phoneNumber
}

async function parseFullGraphUser(users: Partial<GraphUser>[]) {

  if (users.length === 0) {
    return null;
  }

  const user = users[0]
  const account = user.accounts?.[0]

  if (!account) {
    throw new SystemError(`Malformed user, no account found for graph user ${user.id}`)
  }

  const graph: DeepPartial<User['graph']> = {}
  graph.user = { id: user.id }
  graph.account = { id: account.id }

  if (account.marketplace) {
    graph.account.marketplace = account.marketplace
  }

  if (account.tills.length > 0) {
    graph.account.tills = account.tills
  }

  if (account.vpas.length > 0) {
    graph.account.vpas = account.vpas
  }

  return graph
}

class ReconstructionService {

  constructor(private account: AccountInterface, private graphql: GraphQLClient, private provider: Provider, private redis: RedisClient) {}

  async reconstructActiveVoucher(): Promise<CachedVoucher> {
    const symbol = await getVoucherSymbol(this.account.active_voucher_address, this.graphql, this.redis);
    if (!symbol) {
      throw new SystemError(`Could not find voucher symbol for ${this.account.active_voucher_address}`);
    }
    const balance = await retrieveWalletBalance(this.account.address, this.account.active_voucher_address, this.provider);
    return { balance, address: this.account.active_voucher_address, symbol };
  }

  async reconstructGraph():  Promise<[DeepPartial<User['graph']>, GraphTransaction[]]> {
    const fullGraphData = await getFullGraphUserData(this.account.address, this.graphql, this.account.phone_number)
    if(!fullGraphData) {
      throw new SystemError(`Failed to reconstruct graph data for user ${this.account.address}`)
    }
    const graph = await parseFullGraphUser(fullGraphData.users)
    if (!graph) {
      throw new SystemError(`Could not parse graph data for ${this.account.address}`);
    }
    return [graph, fullGraphData.transactions];
  }

  async reconstructIdentifierMappings(address: string, graph: DeepPartial<User['graph']>){
    if(graph?.account?.tills) {
      for (const till of graph.account.tills) {
        await this.redis.set(`till-address-${till?.till}`, address)
      }
    }

    if(graph?.account?.vpas) {
      for (const vpa of graph.account.vpas) {
        await this.redis.set(`vpa-address-${vpa?.vpa}`, address)
      }
    }
  }
  async reconstructStatement(db: PostgresDb, transactions: GraphTransaction[]){
    return await generateStatement(this.account.address, db, this.graphql, this.redis, transactions);
  }

  async reconstructVouchers(symbolMap: Map<string, string>): Promise<[CachedVoucher, CachedVoucher[]]> {
    let heldVouchers = await generateHeldVouchers(this.account.address, this.provider, symbolMap);

    let activeVoucher;
    if (heldVouchers.length > 0) {
      activeVoucher = heldVouchers.find((voucher) => voucher.address === this.account.active_voucher_address);
    } else {
      activeVoucher = await this.reconstructActiveVoucher();
      heldVouchers = [activeVoucher];
    }

    if (!activeVoucher) {
      throw new SystemError(`Could not reconstruct active voucher for ${this.account.address}`);
    }

    if (heldVouchers.length === 0) {
      throw new SystemError(`Could not reconstruct held vouchers for ${this.account.address}`);
    }

    return [activeVoucher, heldVouchers];
  }
}

export class UserService {

  private readonly cacheService: CacheService<User>;
  private readonly phoneNumber: string;

  constructor(phoneNumber: string, private readonly redis: RedisClient) {
    this.cacheService = new CacheService<User>(redis, phoneNumber);
    this.phoneNumber = phoneNumber;
    this.redis = redis;
  }

  async get(keys?: (keyof User)[], db?: PostgresDb, graphql?: GraphQLClient, provider?: Provider) {

    if(keys) {
      return await this.cacheService.get(keys);
    }
    const user = await this.cacheService.get();
    if(user) {
      return user;
    }

    logger.debug(`User: ${this.phoneNumber} not found in cache. Querying database.`)
    if(!db || !graphql || !provider) {
      throw new SystemError(`Cannot query database, missing connection parameters.`)
    }

    const account = await new Account(db).findAccountAndGuardians(this.cacheService.key)
    if (!account) {
      logger.debug(`User: ${this.phoneNumber} not found in database. Treating as new user.`)
      return null
    }

    logger.debug(`User: ${this.phoneNumber} found in database. Attempting to rebuild user in cache.`)
    try {
      return await this.rebuild(account, db, graphql, provider)
    } catch (error: any) {
      throw new SystemError(`Rebuild user in cache failed. ${error.message}: ${error.stack}`)
    }
  }

  public async rebuild(account: AccountInterface, db: PostgresDb, graphql: GraphQLClient, provider: Provider) {

    // reconstruct address-phone mapping
    await this.redis.set(`address-phone-${account.address}`, account.phone_number)

    const reconstructionService = new ReconstructionService(account, graphql, provider, this.redis);
    const [graph, transactions] = await reconstructionService.reconstructGraph();
    await reconstructionService.reconstructIdentifierMappings(account.address, graph);
    const symbolMap = await generateSymbolMap(graphql, this.redis, transactions);
    const [activeVoucher, heldVouchers] = await reconstructionService.reconstructVouchers(symbolMap);
    const statement = await reconstructionService.reconstructStatement(db, transactions);
    const tag = await getUserTag(account.phone_number, this.redis);

    let user: DeepPartial<User> = { account, graph, tag, vouchers: { active: activeVoucher, held: heldVouchers } }

    if(statement.length > 0) {
      user = { ...user, statement }
    }
    return await this.cacheService.update(user);
  }

  public async update(user: DeepPartial<User>) {
    return await this.cacheService.update(user);
  }

  public async updateBalance(address: string, contractAddress: string, provider: Provider) {
    const balance = await retrieveWalletBalance(address, contractAddress, provider)
    return await this.update({ vouchers: { active: { balance } } })
  }
}
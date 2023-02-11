import { config } from "@src/config";
import { CacheAccessor } from "@utils/redis";
import Redis from "ioredis";
import { JsonSerializer } from "typescript-json-serializer";
import { createPointer } from "@utils/encoding";

export interface RawBalance {
  symbol: string;
  balance: number;
}

type BalanceData = Record<string, number>;

export class BalancesManager extends CacheAccessor {
  serializer: JsonSerializer;

  constructor(address: string, cacheClient: Redis, serializer: JsonSerializer) {
    const cacheKey = createPointer([address, 'cic:balances'])
    super(cacheClient, cacheKey, serializer);
    this.serializer = serializer;
  }

  async get(){
     const cachedBalanceData = await this.getCacheJSONData();
      if (cachedBalanceData) {
        return cachedBalanceData;
      }
      console.error(`Failed to retrieve balances data at: ${this.cacheKey}`);
      return null;
  }

  async getByTokenSymbol(tokenSymbol: string) {
    const cachedBalanceData = await this.getCacheJSONData();
    if (cachedBalanceData) {
      return cachedBalanceData[tokenSymbol];
    }
    console.error(`Failed to retrieve balance for token: ${tokenSymbol} at: ${this.cacheKey}`);
    return null;
  }

  async update(rawBalances: RawBalance[]) {
    let balances: BalanceData = { }
    for (const rawBalance of rawBalances) {
      balances[`${rawBalance.symbol}`] = rawBalance.balance;
    }
    await this.cacheJSONData(balances);
  }

  async updateByTokenSymbol(balanceData: BalanceData) {
    await this.updateCacheJsonData(balanceData);
  }
}

export class BalanceRetriever {

  address: string;

  constructor(address: string) {
    this.address = address;
  }

  async custodialRetrieve() {
    const response = await fetch(config.CIC_CUSTODIAL.BALANCE_ENDPOINT + this.address, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Failed to retrieve balance.');
      throw new Error(`Failed to retrieve balance: ${response.status} ${response.statusText}`);
    }

    console.log('Successfully retrieved balance.')
    return await response.json();
  }

  async contractRetrieve() {
    //TODO[Philip]: Not implemented yet.
  }
}
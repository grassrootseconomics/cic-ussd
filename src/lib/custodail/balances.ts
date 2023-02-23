import { config } from "@src/config";
import { CacheAccessor } from "@utils/redis";
import Redis from "ioredis";
import { createPointer } from "@utils/encoding";

export interface RawBalance {
  symbol: string;
  balance: number;
}

type BalanceData = Record<string, number>;

export class BalancesManager extends CacheAccessor {

  constructor(address: string, cacheClient: Redis) {
    const cacheKey = createPointer([address, 'cic:balances'])
    super(cacheClient, cacheKey);
  }

  async get(){
     const cachedBalanceData = await this.getCacheJSONData();
      if (cachedBalanceData) {
        return cachedBalanceData;
      }
      console.error(`Failed to retrieve balances data at: ${this.cacheKey}`);
      return null;
  }

  async getByVoucherSymbol(voucherSymbol: string) {
    const cachedBalanceData = await this.getCacheJSONData();
    if (cachedBalanceData) {
      return cachedBalanceData[voucherSymbol];
    }
    console.error(`Failed to retrieve balance for voucher: ${voucherSymbol} at: ${this.cacheKey}`);
    return null;
  }

  async update(rawBalances: RawBalance[]) {
    const rawBalancesSorted = rawBalances.sort((a, b) => b.balance - a.balance);
    let balances: BalanceData = { }
    for (const rawBalance of rawBalancesSorted) {
      balances[`${rawBalance.symbol}`] = rawBalance.balance;
    }
    await this.cacheJSONData(balances);
  }

  async updateByVoucherSymbol(balanceData: BalanceData) {
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

    console.debug('Successfully retrieved balance.')
    return await response.json();
  }

  async contractRetrieve() {
    //TODO[Philip]: Not implemented yet.
  }
}
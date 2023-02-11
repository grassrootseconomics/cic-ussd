import { getVoucherBySymbol, getVouchers } from "@lib/graph/voucher";
import { GraphQLClient } from "graphql-request";
import { createPointer } from "@utils/encoding";
import { CacheAccessor } from "@utils/redis";
import { JsonSerializer } from "typescript-json-serializer";
import Redis from "ioredis";

export enum VoucherSalt{
  ACTIVE_VOUCHER = 'cic:activeVoucher',
  LATEST_RECEIVED_VOUCHER = 'cic:latestReceivedVoucher',
  LATEST_SENT_VOUCHER = 'cic:latestSentVoucher',
  VOUCHER_METADATA = 'cic:voucherMetadata',

}
export class VoucherHandler extends CacheAccessor{

  address: string;

  constructor(address: string, cacheClient: Redis, serializer: JsonSerializer) {
    // TODO[Philip]: This pattern of overriding the cacheKey is seems unclean. We should refactor this to be more explicit.
    super(cacheClient, "", serializer);
    this.address = address;
  }

  async setActiveVoucher(voucherSymbol: string) {
    this.cacheKey = createPointer([this.address, VoucherSalt.ACTIVE_VOUCHER]);
    console.log(`Setting ${this.address} 's active voucher to: ${voucherSymbol}`);
    await this.cacheData(voucherSymbol);
  }

  async getActiveVoucher() {
    this.cacheKey = createPointer([this.address, VoucherSalt.ACTIVE_VOUCHER]);
    const activeVoucher = await this.getCacheData();
    if (activeVoucher) {
      return activeVoucher;
    }
    console.error(`Failed to retrieve active voucher for address: ${this.address}`);
    return null;
  }

  async setLatestReceivedVoucher(voucherSymbol: string) {
    this.cacheKey = createPointer([this.address, VoucherSalt.LATEST_RECEIVED_VOUCHER]);
    console.log(`Setting ${this.address} 's latest received voucher to: ${voucherSymbol}`);
    await this.cacheData(voucherSymbol);
  }

  async getLatestReceivedVoucher() {
    this.cacheKey = createPointer([this.address, VoucherSalt.LATEST_RECEIVED_VOUCHER]);
    const latestReceivedVoucher = await this.getCacheData();
    if (latestReceivedVoucher) {
      return latestReceivedVoucher;
    }
    console.error(`Failed to retrieve latest received voucher for address: ${this.address}`);
    return null;
  }

  async setLatestSentVoucher(voucherSymbol: string) {
    this.cacheKey = createPointer([this.address, VoucherSalt.LATEST_SENT_VOUCHER]);
    console.log(`Setting ${this.address} 's latest sent voucher to: ${voucherSymbol}`);
    await this.cacheData(voucherSymbol);
  }

  async getLatestSentVoucher() {
    this.cacheKey = createPointer([this.address, VoucherSalt.LATEST_SENT_VOUCHER]);
    const latestSentVoucher = await this.getCacheData();
    if (latestSentVoucher) {
      return latestSentVoucher;
    }
    console.error(`Failed to retrieve latest sent voucher for address: ${this.address}`);
    return null;
  }

}

export class VoucherMetadataManager extends CacheAccessor {

  address: string;

  constructor(address: string, cacheClient: Redis, serializer: JsonSerializer) {
    const cacheKey = createPointer([address, VoucherSalt.VOUCHER_METADATA]);
    super(cacheClient, cacheKey, serializer);
    this.address = address;
  }

  async graphRetrieve(graphqlClient: GraphQLClient) {
    await getVouchers(graphqlClient);
  }

  async graphRetrieveByVoucherSymbol(graphqlClient: GraphQLClient, voucherSymbol: string) {
    await getVoucherBySymbol(graphqlClient, voucherSymbol);
  }

  async cacheMetadata(voucherMetadata: any) {
    await this.cacheJSONData(voucherMetadata);
  }

  async getCachedMetadataByVoucherSymbol(voucherSymbol: string) {
    const voucherMetadata = await this.getCacheJSONData();
    if (voucherMetadata) {
      return voucherMetadata[voucherSymbol];
    }
    console.error(`Failed to retrieve voucher data for voucher: ${voucherSymbol} at: ${this.cacheKey}`);
    return null;
  }
}


export async function orderVouchersToRender(lastReceivedVoucher: string, lastSentVoucher: string, vouchersHeld: string[]) {
  const orderedVouchers = [];
  const vouchersToPop = [lastReceivedVoucher, lastSentVoucher];
  for (const voucher of vouchersToPop) {
    const index = vouchersHeld.indexOf(voucher);
    if (index === -1) continue;
    orderedVouchers.push(voucher)
    vouchersHeld.splice(index, 1);
  }
  orderedVouchers.push(...vouchersHeld.slice(0, 6));
  return orderedVouchers;
}

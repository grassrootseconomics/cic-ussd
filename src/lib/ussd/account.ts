import {Cache} from "@utils/redis";
import {Redis as RedisClient} from "ioredis";
import {ethers, Provider} from "ethers";
import {cashRounding} from "@lib/ussd/utils";
import {pointer} from "@lib/ussd/session";

export enum AccountMetadata {
  GUARDIANS = ":cic.guardians",
  PROFILE = ":cic.profile",
  STATEMENT = ":cic.statement",
}



export async function getAccountMetadata<T>(address: string, redis: RedisClient, salt?: AccountMetadata){
  const key = pointer([address, salt])
  const cache = new Cache(redis, key)
  return cache.getJSON()
}

export async function setAccountMetadata<T> (address: string, data: unknown, redis: RedisClient, salt?: AccountMetadata) {
  const key = pointer([salt, address])
  const cache = new Cache(redis, key)
  return cache.setJSON(data)
}

export async function retrieveWalletBalance (address: string, contract: string, provider: Provider) {
  const erc20Contract = new ethers.Contract(
    contract,
    ['function balanceOf(address owner) view returns (uint256)'],
    provider
  )
  const wei = await erc20Contract.balanceOf(address)
  return cashRounding(ethers.formatUnits(wei, 6))
}

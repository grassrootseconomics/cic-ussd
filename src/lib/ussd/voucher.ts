import { Cache } from "@utils/redis";
import { Redis as RedisClient } from "ioredis";
import { config } from "@src/config";
import {pointer} from "@lib/ussd/session";

/**
 * Description placeholder
 * @date 3/3/2023 - 10:48:31 AM
 *
 * @export
 * @enum {number}
 */
export enum VoucherMetadata {
  ACTIVE = 'ACTIVE',
  DIRECTORY = 'DIRECTORY',
  HELD = 'HELD',
  LAST_RECEIVED = 'LAST_RECEIVED',
  LAST_SENT = 'LAST_SENT',
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:48:31 AM
 *
 * @export
 * @interface ActiveVoucher
 * @typedef {ActiveVoucher}
 */
export interface ActiveVoucher {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:48:31 AM
   *
   * @type {string}
   */
  address: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:48:31 AM
   *
   * @type {number}
   */
  balance: number
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:48:31 AM
   *
   * @type {string}
   */
  symbol: string
}

export interface VoucherDirectory  extends ActiveVoucher {
  phoneNumber: string
  product: string
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:48:31 AM
 *
 * @export
 * @async
 * @param {string} address
 * @param {RedisClient} redis
 * @param {string} salt
 * @param {ActiveVoucher} voucher
 * @returns {*}
 */
export async function setVouchers(redis: RedisClient, salt: string, voucher: ActiveVoucher | VoucherDirectory, address?: string) {
  redis.select(config.REDIS.PERSISTENT_DATABASE)
  const pointerArr = address ? [address, salt] : [salt];
  const cache = new Cache(redis, pointer(pointerArr));
  await cache.setJSON(voucher);
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:48:31 AM
 *
 * @export
 * @async
 * @param {string} address
 * @param {RedisClient} redis
 * @param {string} salt
 * @returns {unknown}
 */
export async function getVouchers(redis: RedisClient, salt: string, address?: string,) {
  redis.select(config.REDIS.PERSISTENT_DATABASE)
  const pointerArr = address ? [address, salt] : [salt];
  const cache = new Cache(redis, pointer(pointerArr));
  return await cache.getJSON();
}

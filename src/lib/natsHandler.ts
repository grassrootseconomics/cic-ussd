import { config } from "@src/config";
import { JSONCodec, Msg } from "nats";
import { GraphQLClient } from "graphql-request";
import { getVouchersByAddress } from "@lib/graph/voucher";
import { Redis as RedisClient } from "ioredis";
import { setVouchers, VoucherMetadata } from "@lib/ussd/voucher";
import { Provider } from "ethers";
import { activateOnChain } from "@db/models/account";
import { PostgresDb } from "@fastify/postgres";
import { retrieveWalletBalance } from "@lib/ussd/account";

/**
 * Description placeholder
 * @date 3/3/2023 - 10:42:46 AM
 *
 * @interface AccountRegisterEvent
 * @typedef {AccountRegisterEvent}
 */
interface AccountRegisterEvent {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:42:46 AM
   *
   * @type {number}
   */
  block: number
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:42:46 AM
   *
   * @type {string}
   */
  publicKey: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:42:46 AM
   *
   * @type {string}
   */
  voucherAddress: string
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:42:46 AM
 *
 * @interface TransferEvent
 * @typedef {TransferEvent}
 */
interface TransferEvent {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:42:46 AM
   *
   * @type {string}
   */
  OTxId: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:42:46 AM
   *
   * @type {string}
   */
  TrackingId: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:42:45 AM
   *
   * @type {string}
   */
  TxHash: string
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:44:09 AM
 *
 * @export
 * @async
 * @param {PostgresDb} db
 * @param {GraphQLClient} graphql
 * @param {Msg} msg
 * @param {Provider} provider
 * @param {RedisClient} redis
 * @returns {*}
 */
export async function processMessage (db: PostgresDb, graphql: GraphQLClient, msg: Msg, provider: Provider, redis: RedisClient) {
  let codec: any
  let message: any

  switch (msg.subject) {
    case `${config.NATS.SUBJECT}.accountRegister`:
      codec = JSONCodec<AccountRegisterEvent>()
      message = codec.decode(msg.data)
      await handleReg(db, graphql, message, provider, redis)
      msg.respond()
      break
    case `${config.NATS.SUBJECT}.signTransfer`:
      codec = JSONCodec<TransferEvent>()
      message = codec.decode(msg.data)
      console.log(`Received transfer message: ${JSON.stringify(message)}`)
      break
    default:
      console.warn(`Message subject: ${msg.subject} not recognized. Ignoring message`)
      break
  }
}

/**
 * Description placeholder
 * @date 3/3/2023 - 10:44:09 AM
 *
 * @export
 * @async
 * @param {PostgresDb} db
 * @param {GraphQLClient} graphql
 * @param {AccountRegisterEvent} msg
 * @param {Provider} provider
 * @param {RedisClient} redis
 * @returns {*}
 */
export async function handleReg (db: PostgresDb, graphql: GraphQLClient, msg: AccountRegisterEvent, provider: Provider, redis: RedisClient) {
  try {
    // set up account for use on ussd.
    const voucher = await getVouchersByAddress(graphql, msg.voucherAddress)
    const balance = await retrieveWalletBalance(msg.publicKey, msg.voucherAddress, provider)
    await setVouchers(redis,VoucherMetadata.ACTIVE, {
      address: voucher.token_address,
      balance,
      symbol: voucher.symbol,
    }, msg.publicKey)

    // set activated on chain
    await activateOnChain(db, msg.publicKey)
  } catch (err) {
    console.error('NATs Error: ', err)
    throw new Error(`Failed to handle accountRegister event: ${err}`)
  }
}

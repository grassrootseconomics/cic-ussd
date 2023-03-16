import {config} from "@src/config";
import {JSONCodec, Msg} from "nats";
import {GraphQLClient} from "graphql-request";
import {Redis as RedisClient} from "ioredis";
import {getAddress, Provider} from "ethers";
import {PostgresDb} from "@fastify/postgres";
import {Cache} from "@utils/redis";
import {ActiveVoucher, getVouchers, getVoucherSymbol, setVouchers, VoucherMetadata} from "@lib/ussd/voucher";
import {AccountMetadata, getAccountMetadata, retrieveWalletBalance, setAccountMetadata} from "@lib/ussd/account";
import {Transaction, TransactionType} from "@machines/statement";
import {getVouchersByAddress} from "@lib/graph/voucher";
import {activateOnChain} from "@db/models/account";
import {Address, Symbol} from "@lib/ussd/utils";

interface TransferEvent {
  block: number;
  contractAddress: string;
  from: string;
  success: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  value: number;
}

export async function processMessage (db: PostgresDb, graphql: GraphQLClient, msg: Msg, provider: Provider, redis: RedisClient) {
  let codec: any
  let message: any

  try{
    if (msg.subject === `${config.NATS.CHAIN.STREAM_NAME}.transfer`) {
      {
        codec = JSONCodec<TransferEvent>()
        message = codec.decode(msg.data)
        await handleTransfer(db, graphql, message, provider, redis)
        //message.respond('OK')
      }
    } else {
      console.log("Unknown subject: ", msg.subject)
    }
  } catch(error) {
    console.error(error)
    throw new Error(error)
  }
}

async function updateHeldVouchers(address: Address, contractAddress: Address, redis: RedisClient, symbol: Symbol, balance: number): Promise<ActiveVoucher[]> {
  const heldVouchers = await getVouchers<ActiveVoucher[]>(address, redis, VoucherMetadata.HELD) || []
  const updatedVoucherIndex = heldVouchers.findIndex(v => v.symbol === symbol)

  if (updatedVoucherIndex >= 0) {
    const updatedVoucher = { ...heldVouchers[updatedVoucherIndex], balance }
    return [ ...heldVouchers.slice(0, updatedVoucherIndex), updatedVoucher, ...heldVouchers.slice(updatedVoucherIndex + 1) ]
  } else {
    const newVoucher = { address: contractAddress, symbol, balance }
    return [ ...heldVouchers, newVoucher ]
  }
}
async function getSymbol(redis: RedisClient, graphql: GraphQLClient, contractAddress: string): Promise<Symbol> {
  let cache = new Cache(redis, `address-symbol:${contractAddress}`)
  let symbol = await cache.get()

  if (!symbol) {
    const voucher = await getVouchersByAddress(graphql, contractAddress)
    if (voucher) {
      symbol = voucher.symbol
      cache = new Cache(redis, contractAddress)
      await cache.set(symbol)
    } else {
      throw new Error(`Could not find symbol for contract address: ${contractAddress}`)
    }
  }

  return symbol
}
function updateStatements(statement: Transaction[], tx: Transaction): Transaction[] {
  const updatedStatement = [...statement]

  if (updatedStatement.length >= 9) {
    updatedStatement.shift()
  }

  updatedStatement.push(tx)

  return updatedStatement
}
async function handleTransfer(db: PostgresDb, graphql: GraphQLClient, message: TransferEvent, provider: Provider, redis: RedisClient) {
  // parse message
  const { block, success, transactionHash, value } = message
  const contractAddress = getAddress(message.contractAddress) as Address
  const from = getAddress(message.from) as Address
  const to = getAddress(message.to) as Address


  if (success) {
    // get tx count from cache to know if this is the first tx
    const cache = new Cache(redis, `address-tx-count:${to}`)
    const txCount = await cache.get()
    if (!txCount) {
      await handleRegistration(to, contractAddress, db, graphql, message, provider, redis)
      // update tx count
      await cache.set(1)
    } else {
      // get symbol from address-symbol mapping
      const symbol = await getSymbol(redis, graphql, contractAddress)

      // update statements
      const rStatement = await getAccountMetadata<Transaction[]>(to, redis, AccountMetadata.STATEMENT) || []
      const sStatement = await getAccountMetadata<Transaction[]>(from, redis, AccountMetadata.STATEMENT) || []
      const uRStatement = updateStatements(rStatement, {block, from, symbol, time: Date.now(), to, transactionHash, type: TransactionType.CREDIT, value})
      const uSStatement = updateStatements(sStatement, {block, from, symbol, time: Date.now(), to, transactionHash, type: TransactionType.DEBIT, value})

      // retrieve wallet balances
      const rBalance = await retrieveWalletBalance(to, contractAddress, provider)
      const sBalance = await retrieveWalletBalance(from, contractAddress, provider)
      // update held vouchers
      const uRHeldVouchers = await updateHeldVouchers(to, contractAddress, redis, symbol, rBalance)
      const uSHeldVouchers = await updateHeldVouchers(from, contractAddress, redis, symbol, sBalance)


      // update redis
      await setAccountMetadata<Transaction[]>(to, uRStatement, redis, AccountMetadata.STATEMENT,)
      await setAccountMetadata<Transaction[]>(from, uSStatement, redis, AccountMetadata.STATEMENT,)
      await setVouchers<ActiveVoucher[]>(to, redis, uRHeldVouchers, VoucherMetadata.HELD)
      await setVouchers<ActiveVoucher[]>(from, redis, uSHeldVouchers, VoucherMetadata.HELD)

      // update tx count
      await cache.set(txCount + 1)
    }

  } else {
    console.error("Transaction failed: ", message)
  }
}
async function handleRegistration(
  address: Address,
  contractAddress: Address,
  db: PostgresDb,
  graphql: GraphQLClient,
  message: TransferEvent,
  provider: Provider,
  redis: RedisClient) {
  try{
    // activate on chain
    const account = await activateOnChain(address, db, redis)

    // retrieve balance
    const balance = await retrieveWalletBalance(address, contractAddress, provider)
    console.debug("Balance for account: ", address, " is: ", balance)

    // get symbol from address_symbol mapping | graph
    const symbol = await getVoucherSymbol(contractAddress, graphql, redis)

    // set active token
    const activeVoucher: ActiveVoucher = { address: contractAddress, balance, symbol }
    await setVouchers<ActiveVoucher>(address, redis, activeVoucher, VoucherMetadata.ACTIVE)

    console.debug(`Account: ${account.address} successfully set up.`)
  } catch (e) {
    console.error("Error setting up account: ", e)
    throw e
  }

}
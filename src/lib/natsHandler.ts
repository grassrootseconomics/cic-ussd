import { config } from '@src/config';
import { JSONCodec, Msg } from 'nats';
import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { getAddress, Provider } from 'ethers';
import { PostgresDb } from '@fastify/postgres';
import { Cache } from '@utils/redis';
import { ActiveVoucher, getVoucherSymbol } from '@lib/ussd/voucher';
import { retrieveWalletBalance } from '@lib/ussd/account';
import { Transaction, TransactionType } from '@machines/statement';
import { getVouchersByAddress } from '@lib/graph/voucher';
import { activateOnChain } from '@db/models/account';
import { Address, generateTag, getTag, Symbol } from '@lib/ussd/utils';
import { User } from '@machines/utils';
import { getPersonalInformation } from '@lib/graph/user';

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

async function updateHeldVouchers(heldVouchers: ActiveVoucher[], voucher: ActiveVoucher): Promise<ActiveVoucher[]> {
  const { address, balance, symbol } = voucher
  const updatedVoucherIndex = heldVouchers.findIndex(v => v.symbol === symbol)

  if (updatedVoucherIndex >= 0) {
    const updatedVoucher = { ...heldVouchers[updatedVoucherIndex], balance}
    return [ ...heldVouchers.slice(0, updatedVoucherIndex), updatedVoucher, ...heldVouchers.slice(updatedVoucherIndex + 1) ]
  } else {
    const newVoucher = { address: address, symbol, balance }
    return [ ...heldVouchers, newVoucher ]
  }
}

async function getSymbol(redis: RedisClient, graphql: GraphQLClient, contractAddress: string): Promise<Symbol> {
  let cache = new Cache(redis, `address-symbol-${contractAddress}`)
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

async function updateTransactions(statement: Transaction[], transaction: Transaction): Promise<Transaction[]> {
  const updatedTransaction = [...statement]

  if (updatedTransaction.length >= 9) {
    updatedTransaction.shift()
  }

  updatedTransaction.push(transaction)

  return updatedTransaction
}

async function handleTransfer(db: PostgresDb, graphql: GraphQLClient, message: TransferEvent, provider: Provider, redis: RedisClient) {
  // parse message
  const { block, success, transactionHash, value } = message;
  const contractAddress = getAddress(message.contractAddress) as Address
  const from = getAddress(message.from) as Address
  const to = getAddress(message.to) as Address

  if (success) {
    const cache = new Cache(redis, `address-tx-count-${to}`)
    const txCount = await cache.get()
    if (!txCount) {
      await handleRegistration(to, contractAddress, db, graphql, message, provider, redis)
      await cache.set(1)
    } else {
      const symbol = await getSymbol(redis, graphql, contractAddress)

      const rPhoneNumber =  await redis.get(`address-phone-${to}`)
      const sPhoneNumber =  await redis.get(`address-phone-${from}`)

      const rCache = new Cache(redis, rPhoneNumber)
      const sCache = new Cache(redis, sPhoneNumber)

      const rUser = await rCache.getJSON<User>()
      const sUser = await sCache.getJSON<User>()

      const [uRTransactions, uSTransactions] = await Promise.all([
        updateTransactions(rUser.transactions || [], {block, from, symbol, time: Date.now(), to, transactionHash, type: TransactionType.CREDIT, value}),
        updateTransactions(sUser.transactions || [], {block, from, symbol, time: Date.now(), to, transactionHash, type: TransactionType.DEBIT, value})
      ])

      const [rBalance, sBalance] = await Promise.all([
        retrieveWalletBalance(to, contractAddress, provider),
        retrieveWalletBalance(from, contractAddress, provider)
      ])

      const [uRHeldVouchers, uSHeldVouchers] = await Promise.all([
        updateHeldVouchers(rUser.vouchers.held || [], { address: contractAddress, balance: rBalance, symbol }),
        updateHeldVouchers(sUser.vouchers.held || [], { address: contractAddress, balance: sBalance, symbol })
      ])

      await Promise.all([
        rCache.updateJSON({ transactions: uRTransactions, vouchers: { held: uRHeldVouchers } }),
        sCache.updateJSON({ transactions: uSTransactions, vouchers: { held: uSHeldVouchers } })
      ])

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
    const phoneNumber =  await redis.get(`address-phone-${address}`)

    if (!phoneNumber) {
      console.error(`Could not find phone number for address: ${address}`)
      return
    }

    const account = await activateOnChain(address, db, redis)
    const balance = await retrieveWalletBalance(address, contractAddress, provider)
    const symbol = await getVoucherSymbol(contractAddress, graphql, redis)
    const voucher = { address: contractAddress, balance, symbol }
    const tag = await generateTag(address, graphql, phoneNumber)

    const cache = new Cache(redis, phoneNumber)
    await cache.updateJSON({
      account: account,
      vouchers: {
        active: voucher,
        held: [voucher],
      },
      tag,
    })
    console.debug(`Account: ${account.address} successfully set up.`)

  } catch (e) {
    console.error("Error setting up account: ", e)
    throw e
  }

}
import { config } from '@/config';
import { JSONCodec, Msg } from 'nats';
import { GraphQLClient } from 'graphql-request';
import { Redis as RedisClient } from 'ioredis';
import { getAddress, Provider } from 'ethers';
import { PostgresDb } from '@fastify/postgres';
import { Cache } from '@utils/redis';
import { ActiveVoucher, getVoucherSymbol } from '@lib/ussd/voucher';
import { retrieveWalletBalance } from '@lib/ussd/account';
import { Transaction, TransactionType } from '@machines/statement';
import { activateOnChain } from '@db/models/account';
import { Address, generateTag } from '@lib/ussd/utils';
import { User } from '@machines/utils';
import { logger } from '@/app';
import { SystemError } from '@lib/errors';

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
      logger.debug(`Unknown subject: ${msg.subject}`)
    }
  } catch(error: any) {
    throw new SystemError(`Error processing NATS message: ${error.message}`)
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


async function updateTransactions(statement: Transaction[], transaction: Transaction): Promise<Transaction[]> {
  const updatedTransaction = [...statement]

  if (updatedTransaction.length >= 9) {
    updatedTransaction.shift()
  }

  updatedTransaction.push(transaction)

  return updatedTransaction
}

async function handleTransfer(db: PostgresDb, graphql: GraphQLClient, message: TransferEvent, provider: Provider, redis: RedisClient) {
  const { block, success, transactionHash, value } = message;
  const contractAddress = getAddress(message.contractAddress) as Address
  const from = getAddress(message.from) as Address
  const to = getAddress(message.to) as Address

  if (!success) {
    logger.error("Transaction failed: ", message)
    return
  }

  const txCount = await redis.get(`address-tx-count-${to}`)
  if (!txCount) {
    await handleRegistration(to, contractAddress, db, graphql, message, provider, redis)
    await updateTxCount(to, redis, '1')
    return
  }

  const symbol = await getVoucherSymbol(contractAddress, graphql, redis)
  await Promise.all([
    processTransaction(to, contractAddress, graphql, provider, redis, {
      block, from, symbol, time: Date.now(), to, transactionHash, type: TransactionType.CREDIT, value
    }, txCount),
    processTransaction(from, contractAddress, graphql, provider, redis, {
      block, from, symbol, time: Date.now(), to, transactionHash, type: TransactionType.DEBIT, value
    }, txCount),
  ])
}
async function handleRegistration(
  address: Address,
  contractAddress: Address,
  db: PostgresDb,
  graphql: GraphQLClient,
  message: TransferEvent,
  provider: Provider,
  redis: RedisClient) {

  const phoneNumber =  await getPhoneNumber(address, redis)

  if (!phoneNumber) {
    throw new SystemError(`Could not find phone number for address: ${address}.`)
  }


  try{
    const balance = await retrieveWalletBalance(address, contractAddress, provider)
    const symbol = await getVoucherSymbol(contractAddress, graphql, redis)
    const voucher = { address: contractAddress, balance, symbol }
    const tag = await generateTag(address, graphql, phoneNumber)
    await activateOnChain(address, db, redis)

    const cache = new Cache(redis, phoneNumber)
    await cache.updateJSON({
      vouchers: {
        active: voucher,
        held: [voucher],
      },
      tag,
    })
    logger.debug(`Account: ${address} successfully set up.`)
  } catch (error) {
    throw new SystemError(`Error setting up account: ${address}.`)
  }
}


async function processTransaction(accountAddress: Address,
                                  contractAddress: Address,
                                  graphql: GraphQLClient,
                                  provider: Provider,
                                  redis: RedisClient,
                                  transaction: Transaction,
                                  txCount: string) {

  const phoneNumber = await getPhoneNumber(accountAddress, redis)

  if (!phoneNumber) {
    logger.error(`No phone number mapped to address: ${accountAddress}`)
    return
  }

  const cache = new Cache(redis, phoneNumber)
  let user: User = await cache.getJSON() as User

  if(!user) {
    logger.error(`No user found for phone number: ${phoneNumber}`)
    return
  }

  const balance = await retrieveWalletBalance(accountAddress, contractAddress, provider)

  const [held, transactions] = await Promise.all([
    updateHeldVouchers(user.vouchers?.held || [], { address: contractAddress, balance, symbol: transaction.symbol }),
    updateTransactions(user.transactions || [], transaction)
  ])

  await cache.updateJSON({
    transactions: transactions,
    vouchers: {
      held: held,
    }
  })

  await updateTxCount(accountAddress, redis, `${parseInt(txCount) + 1}`)
}

async function updateTxCount(address: Address, redis: RedisClient, txCount: string) {
  await redis.set(`address-tx-count-${address}`, txCount)
}

async function getPhoneNumber(address: Address, redis: RedisClient) {
  return redis.get(`address-phone-${address}`);
}
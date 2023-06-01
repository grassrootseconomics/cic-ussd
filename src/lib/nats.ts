import { PostgresDb } from '@fastify/postgres';
import { GraphQLClient } from 'graphql-request';
import { ethers, Provider } from 'ethers';
import { Redis as RedisClient } from 'ioredis';
import { Codec, JsMsg, JSONCodec } from 'nats';
import { RegistrationEvent, TransferEvent } from '@lib/custodail';
import { AccountService, getPhoneNumberFromAddress } from '@services/account';
import { SystemError } from '@lib/errors';
import {
  CachedVoucher,
  cashRounding,
  formatDate,
  getVoucherSymbol,
  Notifier,
  retrieveWalletBalance,
  sendSMS
} from '@lib/ussd';
import { config } from '@/config';
import { generateUserTag, User, UserService } from '@services/user';
import { Transaction, TransactionType, updateHeldVouchers, updateStatement } from '@services/transfer';
import { logger } from '@/app';
import { tHelpers, tSMS } from '@i18n/translators';

type EventHandler<T> = (
  db: PostgresDb,
  graphql: GraphQLClient,
  data: T,
  provider: Provider,
  redis: RedisClient,
  args?: any
) => Promise<void>;


function createHandler<T>(codec: Codec<T>, eventHandler: EventHandler<T>) {
  return async function (
    db: PostgresDb,
    graphql: GraphQLClient,
    message: JsMsg,
    provider: Provider,
    redis: RedisClient,
    args?: any
  ) {
    const data = codec.decode(message.data);
    await eventHandler(db, graphql, data, provider, redis, args);
  };
}

async function processTransferEvent(
  db: PostgresDb,
  graphql: GraphQLClient,
  data: TransferEvent,
  provider: Provider,
  redis: RedisClient
): Promise<void> {
  if (!data.success) {
    logger.error(`Transfer failed: ${data.transactionHash}`);
    return;
  }

  const symbol = await getVoucherSymbol(data.contractAddress, graphql, redis);
  if (!symbol) {
    throw new SystemError(`Could not find symbol for contract address: ${data.contractAddress}`);
  }

  const [sender, senderService] = await getUser(db, redis, data.from, true);
  const [recipient, recipientService] = await getUser(db, redis, data.to, false);

  if(!recipient){
    throw new SystemError('Error retrieving recipient.')
  }

  // format transaction
  const transaction: Transaction = {
    sender: '',
    type: undefined,
    contractAddress: data.contractAddress,
    recipient: recipient.tag ? recipient.tag : recipient.account.phone_number,
    symbol,
    timestamp: await formatDate(data.timestamp),
    transactionHash: data.transactionHash,
    value: cashRounding(ethers.formatUnits(data.value, 6))
  }

  // determine sender
  if(sender){
    transaction.sender =  sender.tag ? sender.tag : sender.account.phone_number
    transaction.type = sender.account.address == data.to ? TransactionType.CREDIT : TransactionType.DEBIT
    await updateUser(sender.account.address, sender.vouchers.held || [], provider, sender.statement || [], transaction, senderService)

  } else {
    transaction.sender = tHelpers('unknownAddress', recipient.account.language)
  }

  // update recipient
  transaction.type = recipient.account.address == data.to ? TransactionType.CREDIT : TransactionType.DEBIT
  await updateUser(recipient.account.address, recipient.vouchers.held || [], provider, recipient.statement || [], transaction, recipientService)
}

async function getUser(
  db: PostgresDb,
  redis: RedisClient,
  address: string,
  isSender: boolean
): Promise<[null, null] | [User, UserService]> {
  const phoneNumber = await getPhoneNumberFromAddress(address, db, redis);

  if (isSender && !phoneNumber) {
    return [null, null];
  } else if (!phoneNumber) {
    throw new SystemError(`Could not find phone number for address: ${address}`);
  }

  const userService = new UserService(phoneNumber, redis);
  const user = await userService.get();

  if (!user) {
    throw new SystemError(`Could not find recipient: ${phoneNumber}`);
  }
  return [user, userService];
}

async function updateUser(
  address: string,
  heldVouchers: CachedVoucher[],
  provider: Provider,
  statement: Transaction[],
  transaction: Transaction,
  userService: UserService
) {

  const updatedStatement = await updateStatement(statement, transaction);
  const balance = await retrieveWalletBalance(address, transaction.contractAddress, provider);
  const updatedHeldVouchers = await updateHeldVouchers(heldVouchers, { address: transaction.contractAddress, balance, symbol: transaction.symbol });

  await userService.update({
    statement: updatedStatement,
    vouchers: {
      held: updatedHeldVouchers,
    },
  });
}

async function processRegistrationEvent(
  db: PostgresDb,
  graphql: GraphQLClient,
  data: RegistrationEvent,
  provider: Provider,
  redis: RedisClient,
  notifier?: Notifier
): Promise<void> {
  if(!data.success){
    logger.error(`Registration failed: ${data.transactionHash}`);
    return;
  }

  const phoneNumber = await getPhoneNumberFromAddress(data.to, db, redis)
  if (!phoneNumber) {
    throw new SystemError(`Could not find phone number for address: ${data.to}`)
  }
  const tag = await generateUserTag(data.to, graphql, phoneNumber)
  await new AccountService(db, redis).activateOnChain(config.DEFAULT_VOUCHER.ADDRESS, phoneNumber)
  const balance = await retrieveWalletBalance(data.to, config.DEFAULT_VOUCHER.ADDRESS, provider)
  const voucher = {
      address: config.DEFAULT_VOUCHER.ADDRESS,
      balance,
      symbol: config.DEFAULT_VOUCHER.SYMBOL,
    }
  const user = await new UserService(phoneNumber, redis).update({
    account: {
      active_voucher_address: config.DEFAULT_VOUCHER.ADDRESS,
    },
    tag,
    vouchers: {
      active: voucher,
      held: [voucher]
    }
  })

  if (!notifier) {
    logger.warn(`No notifier provided, skipping sending SMS to ${phoneNumber}.`)
    return
  }

  const supportPhone = config.KE.SUPPORT_PHONE
  const creationReceipt = tSMS('accountCreated', user.account.language, { supportPhone })
  const termsAndConditions = tSMS('termsAndConditions', user.account.language, { supportPhone })

  await Promise.all([
    sendSMS(creationReceipt, notifier, [phoneNumber]),
    sendSMS(termsAndConditions, notifier, [phoneNumber])
  ])

}

const handleTransfer = createHandler(
  JSONCodec<TransferEvent>(),
  processTransferEvent
);
const handleRegistration = createHandler(
  JSONCodec<RegistrationEvent>(),
  processRegistrationEvent
);

export async function processMessage(db: PostgresDb, graphql: GraphQLClient, message: JsMsg, provider: Provider, redis: RedisClient, notifier?: Notifier) {
  const subject = message.subject;
  switch (subject) {
    case `${config.NATS.STREAM_NAME}.register`:
      await handleRegistration(db, graphql, message, provider, redis, notifier);
      break;
    case `${config.NATS.STREAM_NAME}.transfer`:
      await handleTransfer(db, graphql, message, provider, redis);
      break;
    default:
      logger.warn(`Unknown subject: ${subject}.`);
      return;
  }
}


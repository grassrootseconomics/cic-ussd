import { PostgresDb } from '@fastify/postgres';
import { GraphQLClient } from 'graphql-request';
import { Provider } from 'ethers';
import { Redis as RedisClient } from 'ioredis';
import { Codec, JsMsg, JSONCodec } from 'nats';
import { RegistrationEvent, TransferEvent } from '@lib/custodail';
import { AccountService, getPhoneNumberFromAddress } from '@services/account';
import { SystemError } from '@lib/errors';
import { getVoucherSymbol, retrieveWalletBalance } from '@lib/ussd';
import { config } from '@/config';
import { generateUserTag, User, UserService } from '@services/user';
import { formatTransferData, updateHeldVouchers, updateStatement } from '@services/transfer';
import { logger } from '@/app';

type EventHandler<T> = (
  db: PostgresDb,
  graphql: GraphQLClient,
  data: T,
  provider: Provider,
  redis: RedisClient
) => Promise<void>;


function createHandler<T>(codec: Codec<T>, eventHandler: EventHandler<T>) {
  return async function (
    db: PostgresDb,
    graphql: GraphQLClient,
    message: JsMsg,
    provider: Provider,
    redis: RedisClient
  ) {
    const data = codec.decode(message.data);
    await eventHandler(db, graphql, data, provider, redis);
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

  if (!sender && recipient) {
    await updateUser(recipient, recipientService, sender, symbol, data, provider);
    return;
  }

  if (sender && recipient) {
    await updateUser(sender, senderService, recipient, symbol, data, provider);
    await updateUser(recipient, recipientService, sender, symbol, data, provider);
  }
}

async function getUser(
  db: PostgresDb,
  redis: RedisClient,
  address: string,
  isSender: boolean,
  counterparty?: any
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
  return [user as User, userService];
}

async function updateUser(
  user: User,
  userService: UserService,
  counterparty: Partial<User> | null | undefined,
  symbol: string,
  data: TransferEvent,
  provider: Provider
) {
  const transaction = await formatTransferData(data, user, counterparty, symbol);
  const statement = await updateStatement(user.statement || [], transaction);
  const balance = await retrieveWalletBalance(user.account.address, data.contractAddress, provider);
  const heldVouchers = await updateHeldVouchers(user.vouchers?.held || [], { address: data.contractAddress, balance, symbol });

  await userService.update({
    statement,
    vouchers: {
      held: heldVouchers,
    },
  });
}


async function processRegistrationEvent(
  db: PostgresDb,
  graphql: GraphQLClient,
  data: RegistrationEvent,
  provider: Provider,
  redis: RedisClient
): Promise<void> {
  const phoneNumber = await getPhoneNumberFromAddress(data.to, db, redis)
  if (!phoneNumber) {
    throw new SystemError(`Could not find phone number for address: ${data.to}`)
  }
  const tag = await generateUserTag(data.to, graphql, phoneNumber)
  await new AccountService(db, redis).activateOnChain(config.DEFAULT_VOUCHER.ADDRESS, phoneNumber)
  const balance = await retrieveWalletBalance(data.to, config.DEFAULT_VOUCHER.ADDRESS, provider)
  await new UserService(phoneNumber, redis).update({
    account: {
      active_voucher_address: config.DEFAULT_VOUCHER.ADDRESS,
    },
    tag,
    vouchers: {
      active: {
        address: config.DEFAULT_VOUCHER.ADDRESS,
        balance,
        symbol: config.DEFAULT_VOUCHER.SYMBOL,
      }
    }
  })
}

const handleTransfer = createHandler(
  JSONCodec<TransferEvent>(),
  processTransferEvent
);
const handleRegistration = createHandler(
  JSONCodec<RegistrationEvent>(),
  processRegistrationEvent
);

export async function processMessage(db: PostgresDb, graphql: GraphQLClient, message: JsMsg, provider: Provider, redis: RedisClient) {
  const subjectHandlers = {
    [`${config.NATS.STREAM_NAME}.register`]: handleRegistration,
    [`${config.NATS.STREAM_NAME}.transfer`]: handleTransfer,
  };

  const handler = subjectHandlers[message.subject];

  try {
    if (handler) {
      await handler(db, graphql, message, provider, redis);
    } else {
      logger.debug(`Unsupported subject: ${message.subject}`);
      message.ack();
    }
  } catch (error: any) {
    throw new SystemError(`Error handling ${message.subject}: ${error.message}`);
  }
}


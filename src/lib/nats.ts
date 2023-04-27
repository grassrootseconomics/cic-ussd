import { PostgresDb } from '@fastify/postgres';
import { GraphQLClient } from 'graphql-request';
import { Provider } from 'ethers';
import { Redis as RedisClient } from 'ioredis';
import { Codec, JsMsg, JSONCodec } from 'nats';
import { RegistrationEvent, TransferEvent } from '@lib/custodail';
import { AccountService, getPhoneNumberFromAddress } from '@services/account';
import { SystemError } from '@lib/errors';
import { retrieveWalletBalance } from '@lib/ussd';
import { config } from '@/config';
import { generateUserTag, UserService } from '@services/user';
import { processTransaction } from '@services/transfer';
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
  const { success} = data;
  if (success) {
    await Promise.all([
      processTransaction(data.from, db, graphql, provider, redis, data),
      processTransaction(data.to, db, graphql, provider, redis, data),
    ])
  }
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
  if (message.subject === `${config.NATS.STREAM_NAME}.register`) {
    try {
      await handleRegistration(db, graphql, message, provider, redis);
      message.ack()
    } catch (error: any) {
      throw new SystemError(`Error handling registration: ${error.message}`);
    }
  } else if (message.subject === `${config.NATS.STREAM_NAME}.transfer`) {
    try {
      await handleTransfer(db, graphql, message, provider, redis);
      message.ack()
    } catch (error: any) {
      throw new SystemError(`Error handling transfer: ${error.message}`);
    }
  } else {
    logger.debug(`Unsupported subject: ${message.subject}`);
    message.ack()
  }
}

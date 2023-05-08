import { CachedVoucher, cashRounding, formatDate, getVoucherSymbol, handleResults } from '@lib/ussd';
import { PostgresDb } from '@fastify/postgres';
import { Redis as RedisClient } from 'ioredis';
import { ethers } from 'ethers';
import { getPhoneNumberFromAddress } from '@services/account';
import { getUserTag, User } from '@services/user';
import { GraphQLClient } from 'graphql-request';
import { GraphTransaction } from '@lib/graph/user';
import { TransferEvent } from '@lib/custodail';

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export interface Transaction {
  recipient: string;
  sender: string;
  symbol: string;
  timestamp: string;
  transactionHash: string;
  type: TransactionType;
  value: number;
}

async function getTransferUserTag(address: string, db: PostgresDb, redis: RedisClient) {
  const phoneNumber = await getPhoneNumberFromAddress(address, db, redis);
  if (!phoneNumber) {
    return null;
  }
  return await getUserTag(phoneNumber, redis);
}

export async function generateStatement(
  address: string,
  db: PostgresDb,
  graphql: GraphQLClient,
  redis: RedisClient,
  transactions: GraphTransaction[]) {
  if (transactions.length === 0) {
    return [];
  }

  const addressSet = new Set<string>();
  const voucherAddressSet = new Set<string>();

  transactions.forEach((transaction) => {
    addressSet.add(transaction.recipient_address);
    addressSet.add(transaction.sender_address);
    voucherAddressSet.add(transaction.voucher_address);
  });

  const userTags = await Promise.allSettled(
    Array.from(addressSet).map(async (addr) => {
      const userTag = await getTransferUserTag(addr, db, redis);
      return [addr, userTag];
    }),
  );

  const userTagMap = new Map<string, string>(await handleResults(userTags));

  const symbols = await Promise.allSettled(
    Array.from(voucherAddressSet).map(async (voucherAddress) => {
      const symbol = await getVoucherSymbol(voucherAddress, graphql, redis);
      return [voucherAddress, symbol];
    }),
  );

  const symbolMap = new Map<string, string>(await handleResults(symbols));

  const results = await Promise.allSettled(
    transactions.map(async (transaction) => {
      const sender = userTagMap.get(transaction.sender_address);
      const recipient = userTagMap.get(transaction.recipient_address);
      const symbol = symbolMap.get(transaction.voucher_address);
      const transactionType = transaction.sender_address === address ? TransactionType.DEBIT : TransactionType.CREDIT;

      if(recipient && symbol){
        return <Transaction>{
          sender: sender || "unknownSender",
          recipient,
          value: cashRounding(ethers.formatUnits(transaction.tx_value, 6)),
          symbol,
          timestamp: await formatDate(new Date(transaction.date_block)),
          transactionHash: transaction.tx_hash,
          type: transactionType,
        };
      }
    })
  );
  return handleResults<Transaction>(results);
}

export async function generateSymbolMap(graphql: GraphQLClient, redis: RedisClient, transactions: GraphTransaction[]): Promise<Map<string, string>> {
  const voucherAddressSet = new Set<string>();
  transactions.forEach((transaction) => voucherAddressSet.add(transaction.voucher_address));

  const symbolPromises: Promise<[string, string | null]>[] = [];
  voucherAddressSet.forEach((voucherAddress) => {
    symbolPromises.push(getVoucherSymbol(voucherAddress, graphql, redis).then((symbol) => [voucherAddress, symbol]));
  })

  const symbols = await Promise.allSettled(symbolPromises);
  return new Map(await handleResults(symbols));
}

export async function formatTransferData(data: TransferEvent, recipient: Partial<User>, sender: Partial<User> | null | undefined, symbol: string) {
  const isRecipient = recipient.account?.address === data.to;
  const type = isRecipient ? TransactionType.CREDIT : TransactionType.DEBIT;

  return <Transaction>{
    sender: sender ? sender.tag : "unknownSender",
    recipient: recipient.tag,
    value: cashRounding(ethers.formatUnits(data.value, 6)),
    symbol,
    timestamp: await formatDate(new Date(data.timestamp)),
    transactionHash: data.transactionHash,
    type,
  };
}

export async function updateHeldVouchers(vouchers: Pick<User, 'vouchers'>['vouchers']['held'], voucher: CachedVoucher){
  const { balance, symbol } = voucher
  const updatedVoucherIndex = vouchers.findIndex(v => v.symbol === symbol)
  if (updatedVoucherIndex >= 0) {
    const updatedVoucher = { ...vouchers[updatedVoucherIndex], balance}
    return [ ...vouchers.slice(0, updatedVoucherIndex), updatedVoucher, ...vouchers.slice(updatedVoucherIndex + 1) ]
  } else {
    return [ ...vouchers, voucher ]
  }
}

export async function updateStatement(statement: Transaction[], transaction: Transaction){
  const updatedStatement = [...statement]
  if(updatedStatement.length >= 9){
    updatedStatement.shift()
  }
  updatedStatement.push(transaction)
  return updatedStatement
}
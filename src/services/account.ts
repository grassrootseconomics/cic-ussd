import { PostgresDb } from '@fastify/postgres';
import { Redis as RedisClient } from 'ioredis';
import { handleResults } from '@lib/ussd';
import { Locales } from '@i18n/i18n-types';
import { logger } from '@/app';
import { DeepPartial } from 'ts-essentials';
import { Account, AccountInterface, AccountStatus } from '@db/models/account';
import { User, UserService } from '@services/user';
import { GraphQLClient } from 'graphql-request';
import { updateGraphUser } from '@lib/graph/user';
import { Guardian } from '@db/models/guardian';

export class AccountService {
  constructor(private db: PostgresDb, private redis: RedisClient) {}

  public async activateOnChain(activeVoucherAddress: string, phoneNumber: string) {
    const results = await Promise.allSettled([
      new Account(this.db).setActivityOnChain(activeVoucherAddress, phoneNumber),
      this.updateCache(phoneNumber, { account: { activated_on_chain: true } })
    ])
    const [dbResult] = await handleResults(results)
    return dbResult
  }

  public async activateOnUssd(graphql: GraphQLClient, graphUserId: number, phoneNumber: string, pin: string) {
    const [activatedOnUssd, status] = [true, AccountStatus.ACTIVE]
    try {
      const results = await Promise.allSettled([
        new Account(this.db).setActivityOnUssd(activatedOnUssd, phoneNumber, status, pin),
        this.updateCache(phoneNumber, { account: { activated_on_ussd: activatedOnUssd, pin, status } }),
        updateGraphUser(graphql, graphUserId, { activated: activatedOnUssd })
      ])
      await handleResults(results)
    } catch (error) {
      logger.error(`Error activating account on ussd: ${error}`)
    }
  }

  public async addGuardian(guardianPhoneNumber: string, phoneNumber: string) {
    const guardians = await  this.getAllGuardians(phoneNumber) || []
    const updated = [...guardians, guardianPhoneNumber]
    const results = await Promise.allSettled([
      new Guardian(this.db).insertGuardian(guardianPhoneNumber, phoneNumber),
      this.updateCache(phoneNumber, { account: { guardians: updated } })
    ])
    await handleResults(results)
  }

  public async block(phoneNumber: string) {
    const [activeOnUssd, status] = [false, AccountStatus.BLOCKED]
    try {
      await Promise.allSettled([
        new Account(this.db).setActivityOnUssd(activeOnUssd, phoneNumber, status),
        this.updateCache(phoneNumber, { account: { activated_on_ussd: activeOnUssd, status } })
      ])
    } catch (error) {
      logger.error(`Error blocking account: ${error}`)
    }
  }

  public async create(data: Pick<AccountInterface, 'address' | 'language' | 'phone_number'>) {
    const results = await Promise.allSettled([
      new Account(this.db).insertAccount(data),
      this.updateCache(data.phone_number, {
        account: {
          activated_on_chain: false,
          activated_on_ussd: false,
          address: data.address,
          language: data.language,
          phone_number: data.phone_number,
          status: AccountStatus.PENDING,
        }
      }),
      this.redis.set(`address-phone-${data.address}`, data.phone_number)
    ])
    const [dbResult] = await handleResults(results)
    return dbResult
  }

  public async getAllGuardians(phoneNumber: string) {
    const cachedAccount = await new UserService(phoneNumber, this.redis).get(['account'])
    if (cachedAccount && cachedAccount.account?.guardians) {
      return cachedAccount.account?.guardians
    }
    const guardians = await new Guardian(this.db).selectAllGuardians(phoneNumber)
    if(guardians) {
      await this.updateCache(phoneNumber, { account: { guardians } })
    }
    return guardians
  }

  public async getGuardian(phoneNumber: string, guardianPhoneNumber: string): Promise<string | null> {
    const cachedAccount = await new UserService(phoneNumber, this.redis).get(['account'])
    if (cachedAccount?.account?.guardians) {
      return cachedAccount.account?.guardians.find(g => g === guardianPhoneNumber) || null
    }
    return await new Guardian(this.db).selectGuardian(guardianPhoneNumber, phoneNumber)
  }

  public async getByPhoneNumber(phoneNumber: string) {
    const cachedAccount = await new UserService(phoneNumber, this.redis).get(['account'])
    if (cachedAccount) {
      return cachedAccount.account
    }
    logger.debug(`Account not found in cache, querying db for phone number: ${phoneNumber}`)
    const account = await new Account(this.db).findByPhoneNumber(phoneNumber)
    if (account) {
      await this.updateCache(phoneNumber, { account })
    }
    return account
  }

  public async removeGuardian(guardianPhoneNumber: string, phoneNumber: string) {
    const guardians = await  this.getAllGuardians(phoneNumber) || []
    const updated = guardians.filter(g => g !== guardianPhoneNumber)
    const results = await Promise.allSettled([
      new Guardian(this.db).deleteGuardian(guardianPhoneNumber, phoneNumber),
      this.updateCache(phoneNumber, { account: { guardians: updated } })
    ])
    await handleResults(results)
  }

  public async reset(phoneNumber: string) {
    const [ activeOnUssd, pinAttempts, status ] = [false, 0, AccountStatus.RESETTING_PIN]
    try {
      await Promise.allSettled([
        new Account(this.db).setActivityOnUssd(activeOnUssd, phoneNumber, status),
        this.updateCache(phoneNumber, { account: { activated_on_ussd: activeOnUssd, pin_attempts: pinAttempts, status } })
      ])
    } catch (error) {
      logger.error(`Error resetting account: ${error}`)
    }
  }

  public async updateCache(phoneNumber: string, data: DeepPartial<User>) {
    logger.debug(`Updating cached account for phone number: ${phoneNumber}`)
    await new UserService(phoneNumber, this.redis).update(data)
  }

  public async updateLanguage(language: Locales, phoneNumber: string) {
    const results = await Promise.allSettled([
      new Account(this.db).setLanguage(phoneNumber, language),
      this.updateCache(phoneNumber, { account: { language } })
    ])
    await handleResults(results)
  }

  public async updatePin(phoneNumber: string, pin: string) {
    const results = await Promise.allSettled([
      new Account(this.db).setPin(phoneNumber, pin),
      this.updateCache(phoneNumber, { account: { pin } })
    ])
    await handleResults(results)
  }

  public async updatePinAttempts(phoneNumber: string, pinAttempts: number) {
    const results = await Promise.allSettled([
      new Account(this.db).setPinAttempts(pinAttempts, phoneNumber),
      this.updateCache(phoneNumber, { account: { pin_attempts: pinAttempts } })
    ])
    await handleResults(results)
  }
}

export async function getPhoneNumberFromAddress(address: string, db: PostgresDb, redis: RedisClient) {
  console.log(`Getting phone number for address: ${address}`);
  let phoneNumber = await redis.get(`address-phone-${address}`);
  if (phoneNumber) {
    return phoneNumber;
  }
  const account = await new Account(db).findByAddress(address);
  if (account) {
    return account.phone_number;
  }
  logger.error(`Could not find phone number for address: ${address}`);
  return null;
}
import { PostgresDb } from '@fastify/postgres';
import { GraphQLClient } from 'graphql-request';
import { Provider } from 'ethers';
import { Redis as RedisClient } from 'ioredis';
import { CountryCode } from 'libphonenumber-js';
import { ActiveVoucher } from '@lib/ussd/voucher';
import { Account } from '@db/models/account';
import { Session } from '@lib/ussd/session';
import { supportedLanguages } from '@lib/ussd/utils';
import { Gender, GraphUser } from '@lib/graph/user';
import { fallbackLanguage, tHelpers } from '@i18n/translators';
import { sanitizePhoneNumber } from '@utils/phoneNumber';
import { MachineError } from '@lib/errors';
import { Cache } from '@utils/redis';
import { Transaction } from '@machines/statement';
import { GraphAccount } from '@lib/graph/account';
import { Marketplace } from '@lib/graph/marketplace';
import { logger } from '@/app';
import { Locales } from '@i18n/i18n-types';

enum BaseError {
  INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",
  SELF_INTERACTION = "SELF_INTERACTION",
  UNKNOWN_ACCOUNT = "UNKNOWN_ACCOUNT",
}

export enum MachineId {
  AUTH = "auth",
  BALANCES = "balances",
  LANGUAGES = "languages",
  MAIN = "main",
  PINS = "pins",
  PROFILE = "profile",
  REGISTRATION = "registration",
  SETTINGS = "settings",
  SOCIAL_RECOVERY = "socialRecovery",
  STATEMENT = "statement",
  TRANSFER = "transfer",
  VOUCHER = "voucher",
}


interface ContextData {
  communityBalance: string,
  guardians: {
    entry?: {
      toAdd?: string,
      toRemove?: string
    },
    loaded?: string[],
    validated?: {
      toAdd?: string,
      toRemove?: string
    }
  },
  languages: {
    selected: Locales
  },
  personal_information?: {
    family_name?: string,
    gender?: Gender,
    given_names?: string,
    location_name?: string,
    year_of_birth?: number,
  },
  pins: {
    initial?: string,
    wards?: {
      entry?: string,
      validated?: string
    }
  },
  marketplace: string,
  statement: string[],
  transfer: {
    amount?: number,
    recipient?: {
      entry?: string,
      tag?: string
      validated?: string
    }
  },
  vouchers: {
    balances?: string[],
    held?: string[],
    selected?: string
    info?: {
      contact?: string;
      description?: string;
      location?: string;
      name?: string;
      symbol?: string;
    }
  }
}

export interface BaseContext {
  data: Partial<ContextData>
  errorMessages?: string[],
  resources: Resources,
  session?: Session,
  user: User
  ussd: Ussd
}

interface Graph {
  account: Pick<GraphAccount, 'id'>
  marketplace?: Pick<Marketplace, 'marketplace_name'>
  user: Partial<GraphUser>
}

export interface User {
  account: Account
  graph: Graph
  guardians?: string[]
  tag: string
  transactions?: Transaction[]
  vouchers: {
    active: ActiveVoucher
    held?: ActiveVoucher[]
  }
}

export interface Resources {
  db: PostgresDb
  e_redis: RedisClient
  graphql: GraphQLClient
  p_redis: RedisClient
  provider: Provider

}

export interface Ussd {
  countryCode: CountryCode,
  input: string,
  phoneNumber: string,
  requestId: string,
  responseContentType: string,
  serviceCode: string,
}


export type BaseEvent =
  | { type: "BACK" }
  | { type: "RETRY", feedback: string }
  | { type: "TRANSIT", input: string }

export function clearErrorMessages (context: BaseContext, event: any) {
  return {
    ...context,
    errorMessages: []
  }
}

export function isOption (expected: string, input: string) {
  return input === expected
}

function generateOptionChecker(expectedValue: string) {
  return function (context: BaseContext, event: any) {
    return isOption(expectedValue, event.input);
  };
}

export const isOption1 = generateOptionChecker('1');
export const isOption2 = generateOptionChecker('2');
export const isOption3 = generateOptionChecker('3');
export const isOption4 = generateOptionChecker('4');
export const isOption5 = generateOptionChecker('5');
export const isOption6 = generateOptionChecker('6');
export const isOption9 = generateOptionChecker('9');
export const isOption00 = generateOptionChecker('00');
export const isOption11 = generateOptionChecker('11');
export const isOption22 = generateOptionChecker('22');


export function getLanguage(input: string): Locales {
  const index = parseInt(input) - 1;
  return Object.keys(supportedLanguages)[index] as Locales;
}

export function isValidPhoneNumber(context: BaseContext, event: any) {
  const { ussd: { countryCode } } = context;
  return validatePhoneNumber(countryCode, event.input)[0] === '+';
}

export function isSuccess(context: BaseContext, event: any) {
  return event.data.success
}

export async function languageOptions () {
  const languages = Object.values(supportedLanguages)
    .map((language, index) => `${index + 1}. ${language}`)
  const placeholder = tHelpers("noMoreLanguageOptions", fallbackLanguage())
  return await menuPages(languages, placeholder)
}

export async function menuPages(list: string[], placeholder: string): Promise<string[]> {
  const pages = [];
  for (let i = 0; i < list.length; i += 3) {
    pages.push(list.slice(i, i + 3));
  }
  while (pages.length < 3) {
    pages.push([]);
  }
  return pages.map((group) => {
    if (group.length === 0) {
      return placeholder;
    } else {
      return group.join("\n");
    }
  });
}

export async function translate(state: string, translator:any, data?: Record<string, any>){
  if (data) {
    return translator[state](data)
  } else {
    return translator[state]()
  }
}

export function updateErrorMessages (context: BaseContext, event: any) {
  const errorMessages = context.errorMessages || []
  const { message } = event.data
  logger.debug(`State machine error occurred: ${JSON.stringify(message)}. STACKTRACE: ${event.data.stack}`)
  errorMessages.push(message)
  context.errorMessages = errorMessages
  return context
}

export function validatePhoneNumber(countryCode: CountryCode, phoneNumber: string, ) {
  try {
    return sanitizePhoneNumber(phoneNumber, countryCode);
  } catch (error) {
    throw new MachineError(BaseError.INVALID_PHONE_NUMBER, "Invalid phone number.")
  }
}

export async function validateUser(countryCode: CountryCode, phoneNumber: string, redis: RedisClient): Promise<User> {
  const key = validatePhoneNumber(countryCode, phoneNumber)
  const cache = new Cache<User>(redis, key)
  const user = await cache.getJSON()
  if (!user) {
    throw new MachineError(BaseError.UNKNOWN_ACCOUNT, `Account not found for: ${key}`)
  }
  return user
}

export async function validateTargetUser(context: BaseContext, input: string) {
  const { user, resources: { p_redis }, ussd: { countryCode } } = context

  const targetUser = await validateUser(countryCode, input, p_redis)

  if (user?.account.phone_number === targetUser.account.phone_number) {
    throw new MachineError(BaseError.SELF_INTERACTION, "Cannot interact with self.")
  }

  return targetUser
}
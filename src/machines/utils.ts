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
import { tHelpers } from '@src/i18n/translator';
import { sanitizePhoneNumber } from '@utils/phoneNumber';
import { MachineError } from '@lib/errors';
import { Cache } from '@utils/redis';
import { Transaction } from '@machines/statement';

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
  communityBalance?: string,
  guardians?: {
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
  languages?: {
    selected?: string
  },
  personal_information?: {
    given_names?: string,
    family_name?: string,
    gender?: Gender,
    year_of_birth?: number,
    location_name?: string,
  },
  pins?: {
    initial?: string,
    wards?: {
      entry?: string,
      validated?: string
    }
  },
  statement?: string[],
  transfer?: {
    amount?: number,
    recipient?: {
      entry?: string,
      tag?: string
      validated?: string
    }
  },
  vouchers?: {
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
  data?: ContextData
  errorMessages?: string[],
  resources?: Resources,
  session?: Session,
  user?: User,
  ussd?: Ussd
}

export interface Resources {
  db: PostgresDb
  e_redis: RedisClient
  graphql: GraphQLClient
  p_redis: RedisClient
  provider: Provider

}

export interface User {
  account?: Account,
  graph?: Partial<GraphUser>
  guardians?: string[]
  tag?: string
  transactions?: Transaction[]
  vouchers?: {
    active?: ActiveVoucher
    held?: ActiveVoucher[]
  }
}

export interface Ussd {
  countryCode?: CountryCode,
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

export const isOption0 = generateOptionChecker('0');
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

export function isValidPhoneNumber(context: BaseContext, event: any) {
  const { ussd: { countryCode } } = context;
  return validatePhoneNumber(countryCode, event.input)[0] === '+';
}

export function isSuccess(context: BaseContext, event: any) {
  return event.data.success
}

export async function languageOptions () {
  const languagesList = Object.values(supportedLanguages)
    .filter((obj) => Object.keys(obj)[0] !== 'fb')
    .map((obj, index) => `${index + 1}. ${Object.values(obj)[0]}`)
  const placeholder = tHelpers("noMoreLanguages", Object.values(supportedLanguages.fallback)[0])
  return await menuPages(languagesList, placeholder)
}

export async function menuPages(list: string[], placeholder: string): Promise<string[][]> {
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
  console.error(`State machine error occurred: ${JSON.stringify(message)}. STACKTRACE: ${event.data.stack}`)
  errorMessages.push(message)
  context.errorMessages = errorMessages
  return context
}

export function validatePhoneNumber(countryCode: CountryCode, phoneNumber: string, ) {
  try {
    return sanitizePhoneNumber(phoneNumber, countryCode);
  } catch (error) {
    throw new MachineError(BaseError.INVALID_PHONE_NUMBER, error.message)
  }
}

export async function validateUser(countryCode: CountryCode, phoneNumber: string, redis: RedisClient): Promise<User> {
  const key = validatePhoneNumber(countryCode, phoneNumber)
  const cache = new Cache(redis, key)
  const user = await cache.getJSON<User>()
  if (!user) {
    throw new MachineError(BaseError.UNKNOWN_ACCOUNT, `Account not found for: ${key}`)
  }
  return user
}

export async function validateTargetUser(context: BaseContext, input: string) {
  const { user: { account: { phone_number } }, resources: { p_redis }, ussd: { countryCode } } = context
  const targetUser = await validateUser(countryCode, input, p_redis)
  if (targetUser.account.phone_number === phone_number) {
    throw new MachineError(BaseError.SELF_INTERACTION, "Cannot interact with self.")
  }
  return targetUser
}
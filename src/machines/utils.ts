import { PostgresDb } from '@fastify/postgres';
import { GraphQLClient } from 'graphql-request';
import { Provider } from 'ethers';
import { Redis as RedisClient } from 'ioredis';
import { getAddressFromTill, getAddressFromVpa, Ussd, validatePhoneNumber } from '@lib/ussd';
import { logger } from '@/app';
import { User, UserService } from '@services/user';
import { BaseMachineError, MachineError } from '@lib/errors';
import { CountryCode } from 'libphonenumber-js';
import { translate } from '@i18n/translators';
import { StateMachine } from 'xstate';
import { getPhoneNumberFromAddress } from '@services/account';
import { NamespaceFeedbackTranslation } from '@i18n/i18n-types';
import { LocalizedString } from 'typesafe-i18n';

export enum MachineId {
  AUTH = "auth",
  BALANCES = "balances",
  LANGUAGES = "languages",
  MAIN = "main",
  PIN_MANAGEMENT = "pins",
  PROFILE = "profile",
  REGISTRATION = "registration",
  SETTINGS = "settings",
  SOCIAL_RECOVERY = "socialRecovery",
  STATEMENT = "statement",
  TRANSFER = "transfer",
  VOUCHER = "voucher",
}

export type Connections = {
  db: PostgresDb,
  graphql: GraphQLClient,
  provider: Provider,
  redis: {
    ephemeral: RedisClient,
    persistent: RedisClient
  }
}

export type MachineEvent =
  | { type: "BACK" }
  | { type: "RETRY", feedback: keyof NamespaceFeedbackTranslation}
  | { type: "TRANSIT", input: string }

export interface BaseContext {
  connections: Connections,
  data: Record<string, any>,
  errorMessages: string[],
  ussd: Ussd,
}

export interface MachineInterface {
  stateMachine: StateMachine<any, any, MachineEvent>,
  translate: (context: any, state: string, translator: any) => Promise<LocalizedString>,
}

export interface MachineServiceInterface {
  stop: () => void,
  transition: (event: MachineEvent) => void,
}

export interface UserContext extends BaseContext {
  user: User
}

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

export async function intermediateMachineTranslations(context: UserContext, state: string, translator: any) {
  const { user: { vouchers: { active: { balance, symbol } } } } = context
  if (state === "mainMenu"){
    return await translate(state, translator, { balance: balance, symbol: symbol })
  } else {
    return await translate(state, translator)
  }
}

export function isValidPhoneNumber(context: BaseContext, event: any) {
  const { ussd: { countryCode } } = context;
  return validatePhoneNumber(countryCode, event.input)[0] === '+';
}

export function isSuccess(_: any, event: any) {
  return event.data.success
}

export function updateErrorMessages (context: BaseContext, event: any) {
  const errorMessages = context.errorMessages || []
  const { message } = event.data
  logger.debug(`State machine error occurred: ${JSON.stringify(message)}. STACKTRACE: ${event.data.stack}`)
  errorMessages.push(message)
  context.errorMessages = errorMessages
  return context
}

export async function validateUser(countryCode: CountryCode, phoneNumber: string, redis: RedisClient){
  const key = validatePhoneNumber(countryCode, phoneNumber)
  const user = new UserService(key, redis).get()
  if (!user) {
    throw new MachineError(BaseMachineError.UNKNOWN_ACCOUNT, `Account not found for phone number: ${key}.`)
  }
  return user
}

export async function validateTargetUser(context: UserContext, input: string) {
  const { user, connections: { db, graphql, redis }, ussd: { countryCode } } = context

  let address, phoneNumber;
  if(input.length === 6 || input.startsWith('0x')){
    address = await (input.startsWith('0x') ? getAddressFromVpa : getAddressFromTill)(graphql, redis.persistent, input)
    if(!address) {
      throw new MachineError(BaseMachineError.UNKNOWN_TILL_OR_VPA, `Account not found for till or vpa: ${input}.`)
    }
    phoneNumber = await getPhoneNumberFromAddress(address, db, redis.persistent)
    if (!phoneNumber) {
      throw new MachineError(BaseMachineError.UNKNOWN_ADDRESS, `Account not found for address: ${address}.`)
    }
  } else {
    phoneNumber = input
  }

  const targetUser = await validateUser(countryCode, phoneNumber, redis.persistent)

  if (user?.account.phone_number === targetUser?.account?.phone_number) {
    throw new MachineError(BaseMachineError.SELF_INTERACTION, "Cannot interact with self.")
  }

  return targetUser
}


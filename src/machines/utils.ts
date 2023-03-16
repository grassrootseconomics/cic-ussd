import {PostgresDb} from "@fastify/postgres";
import {GraphQLClient} from "graphql-request";
import {Provider} from "ethers";
import {Redis as RedisClient} from "ioredis";
import {CountryCode} from "libphonenumber-js";
import {ActiveVoucher} from "@lib/ussd/voucher";
import {Account} from "@db/models/account";
import {Session} from "@lib/ussd/session";
import {supportedLanguages} from "@lib/ussd/utils";
import {GraphUser} from "@lib/graph/user";
import {tHelpers} from "@src/i18n/translator";

export interface BaseContext {
  data?: Record<string, any>,
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
  activeVoucher: ActiveVoucher,
  graph?: Partial<GraphUser>
  transactionTag?: string
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

export async function languageOptions () {
  const languagesList = Object.values(supportedLanguages)
    .filter((obj) => Object.keys(obj)[0] !== 'fb')
    .map((obj, index) => `${index + 1}. ${Object.values(obj)[0]}`)
  const placeholder = tHelpers("noMoreLanguages", Object.values(supportedLanguages.fallback)[0])
  return await menuPages(languagesList, placeholder)
}

export async function menuPages (list: string[], placeholder: string) {
  const pages = []
  for (let i = 0; i < list.length; i += 3) {
    pages.push(list.slice(i, i + 3))
  }
  return pages.map(group => {
    if (group.length === 0){
      return placeholder
    } else {
      return group.join('\n')
    }
  })
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
  console.error(`State machine error occurred: ${JSON.stringify(message)}.`)
  errorMessages.push(message)
  context.errorMessages = errorMessages
  return context
}



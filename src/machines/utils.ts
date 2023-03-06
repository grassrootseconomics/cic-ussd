import { PostgresDb } from "@fastify/postgres";
import { GraphQLClient } from "graphql-request";
import { Provider } from "ethers";
import { Redis as RedisClient } from "ioredis";
import { CountryCode } from "libphonenumber-js";
import { ActiveVoucher } from "@lib/ussd/voucher";
import { Account, AccountStatus } from "@db/models/account";
import { interpret } from "xstate";
import { registrationMachine, RegistrationContext } from "@src/machines/registration";
import { TransferContext, transferMachine } from "@src/machines/transfer";
import { AuthContext, authMachine } from "@src/machines/auth";
import { VoucherContext, voucherMachine } from "@src/machines/voucher";
import { mainMenuMachine, accountManagementMachine } from "@src/machines/intermediate";
import { profileMachine, ProfileContext } from "@src/machines/profile";
import { LanguagesContext, languagesMachine } from "@src/machines/language";
import { BalancesContext, balancesMachine } from "@src/machines/balances";
import { StatementContext, statementMachine } from "@src/machines/statement";
import { PinContext, pinManagementMachine } from "@src/machines/pins";
import { Session } from "@lib/ussd/session";

export interface BaseContext {
  data?: Record<string, unknown>,
  errorMessages?: string[],
  resources?: Resources,
  session?: Session,
  user?: User,
  ussd?: Ussd,
  state?: string,
}
export interface Resources {
  db: PostgresDb
  graphql: GraphQLClient
  provider: Provider
  redis: RedisClient

}
export interface User {
  activeVoucher: ActiveVoucher,
  account?: Account,
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
  | { type: "RETRY", data: { message: string }}
  | { type: "TRANSIT", data: { input: string } }

export function clearErrorMessages (ctx) {
  return {
    ...ctx,
    errorMessages: []
  }
}
export function updateErrorMessages (context: BaseContext, event: any) {
  const errorMessages = context.errorMessages || []
  errorMessages.push(event.data.message)
  context.errorMessages = errorMessages
  return context
}
function isOption (expected: string, input: string) {
  return input === expected
}
export function isOption0(context: BaseContext) {
  return isOption('0', context.ussd.input);
}

export function isOption1(context: BaseContext) {
  return isOption('1', context.ussd.input);
}

export function isOption2(context: BaseContext) {
  return isOption('2', context.ussd.input);
}

export function isOption3(context: BaseContext) {
  return isOption('3', context.ussd.input);
}

export function isOption4(context: BaseContext) {
  return isOption('4', context.ussd.input);
}

export function isOption5(context: BaseContext) {
  return isOption('5', context.ussd.input);
}

export function isOption6(context: BaseContext) {
  return isOption('6', context.ussd.input);
}

export function isOption9(context: BaseContext) {
  return isOption('9', context.ussd.input);
}

export function isOption00(context: BaseContext) {
  return isOption('00', context.ussd.input);
}

function isOption11(context: any) {
  return isOption('11', context.ussd.input);
}

export function isOption22(context: BaseContext) {
  return isOption('22', context.ussd.input);
}

export async function loadMachine(context: AuthContext | BalancesContext | BaseContext | LanguagesContext | PinContext | ProfileContext | StatementContext | TransferContext | VoucherContext) {
  const { user } = context;

  switch (user.account?.status) {
    case AccountStatus.PENDING:
      return interpret(authMachine.withContext(context as AuthContext))

    case AccountStatus.ACTIVE:
      return handleMachines(context);

    default:
      return interpret(registrationMachine.withContext(context as RegistrationContext))
  }
}

export async function handleMachines(context: BalancesContext | BaseContext | LanguagesContext | PinContext | ProfileContext | StatementContext | TransferContext | VoucherContext) {
  const { state } = context;
  const machines = {
    transfer: transferMachine,
    voucher: voucherMachine,
    accountManagement: accountManagementMachine,
    profile: profileMachine,
    language: languagesMachine,
    balances: balancesMachine,
    statement: statementMachine,
    pin: pinManagementMachine,
  };
  if (!state) {
    return interpret(mainMenuMachine.withContext(context as BaseContext))
  }
  if (state in machines) {
    const machine = machines[state];
    return interpret(machine.withContext(context))
  }
}



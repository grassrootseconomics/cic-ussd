import { UssdContext } from "@utils/context";


export function isActivatedAccount(context: UssdContext) {
  return context.account?.status === 'ACTIVE';
}

export function isNewAccount(context: UssdContext) {
  return context.account === null;
}

export function isPendingCreation(context: UssdContext) {
  return context.account?.status === "PENDING" &&
    context.account?.activated_on_chain === false &&
    context.account?.activated_on_ussd === false;
}

export function isBlockedAccount(context: UssdContext) {
  return context.account?.status === 'BLOCKED';
}


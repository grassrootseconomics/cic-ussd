import { createMachine, send } from "xstate";
import { BaseContext, BaseEvent } from "@src/machines/utils";
import { getVouchers, VoucherMetadata, ActiveVoucher, setVouchers, VoucherDirectory } from "@lib/ussd/voucher";
import { isAuthorized } from "@src/machines/auth";
import { Cache } from "@utils/redis";
import { Voucher } from "@lib/graph/voucher";
import { findById } from "@db/models/account";

export interface VoucherContext extends BaseContext {
  data: {
    held?: string[];
    selected?: string;
    directory?: string[];
    info?: string;
    balances?: string[];
  }
}

type VoucherEvent =
  BaseEvent

export const voucherMachine = createMachine<VoucherContext, VoucherEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QDcD2BXAxgCzAJwFkBDHASwDswA6NLXQsc9AYgBUAlAQQDkBlASVYBtAAwBdRKAAOqWKQAupVOUkgAHogCMmgCwA2KgGYAnCL06A7Bb2aATAFZDOgDQgAnont6LVW7b1eIpoAHMY6psYAvpGutDj4xGSUNBjxDExsXHyCQpoSSCAycorKqhoI2vpGpuZWNg5Orh4ItuG+-o4iwRYipnZRMSBx9InYFNQANqhEEBRQABJgExAAaqn0sMwQytQUaADW1MMJJGPJUzNzi8trdPiwCHuomEQl5KJiH6pFCkoqBeVNBZgrYjHZDPZNHo-MZIXomogbMYqDpHHYvHpDN1LNFYusTklJtNZuQFktVvi8Jt8HhUHgqFIJq8AGZ0gC2KTuhFO4yoFxJZJulIeTxebw+XwKPzeZS0wNBhnBcJhcIRCHs-io9hEOt64SxthMuKGlNGvNgSzAmEUpNuaUyPAEwnE31kv1KAMQhuMPlsIWBmkc4T0xjVmjMwSoFhMehEDmCwR0wV0xuO3MJVAtEytNqgdvoDuywjyruKf1lFXlYMNytssKhYackf00Oh9lMhmBOlTpp5ySzObm+fwhadQls+WkbplnoqyZ0VFCIiTnb0IYC8PcWhEXhRa-6PQcunsPa5Zv7VuUEF4YHko5yLql0-Ls-0IkXdiTxm09mC9nsLhbggFjtlQxh1muGr6Bqhqnmk57UBamBXjed4cI6OQlk+ZYeqA5Rvh+rShD+f4AWqPoLsY+4hv4IawsEcEjH2iGXuQ163vewgTqW7r-HhiAEcmRHfoGpGAc0di2D4FhQiEfgmMqjEEmcLHIWxqGcUIhiToUz64eoAmxoRX4kf+4laEC9hauESY7kmclKemKlUPIYx4OxaFZGOj5TjhfEGRUugGCYZiWNY6KNEBHYomYrQhIYJgON2gxpghLluR5mlYb5vEVuE77mGY-q-uGIHka0e42E4rSGlJDEpb2GauaQ7kaehRbjjp0ovvxgVVCFtThQ05kVHZUbGLC8YWDona-o5aV7EQEykBSXI3tm1p-JpPm6X5FZAiC1YQlCKoNkB2hmGB1GWFJcmGPNzFUEQ6CuXSpAAF5DpS62Dso21dXp-nlIqPpRiEwSYoYcaKoY5G9FQy5hNYwKhIm90NWej3Pa9eAfV9a2Wptf3tWO2W7bls4g9J4OQ9Dmiw+dcY+AayYJjoSYzSeGPwY96DkNj2Bve9kA-UT5D-TxM69Qlmq2PO5j-jqZHnYalE6FJBrarCnYPRm-JzJwm3IGAw54FsOxUE8hycjzevEgbRsm5SjzkGgYp-BKO3dfpwOJpGio1sEy4iBCEJqhD-swpYIdhMYiq685+ukobijG6bzA0nSDJMvIrJ4ByqWPUnUAp6QafO6Krwe+Iko5VLAVYkmR2-sHof2ORNi+NYZiGLYvQAcleKYxmJCp07BN3gAQpwADCADStfk-XwM+oYWqBkm7Yh0VFjh9J2o6qi-4OH4FgJ7yxf8OQrLm8kVtHI1if26SV+si7btV8onsA3ts4HQqSoTp1lVEBKGmgURogjPFaMy5z7nGflAV+qAM54FpPSRkLJ2Q2yYnbS4L9r6oHfs8T+7wa5e0BvtKsAdjrQmAWdZofdmwTQmqFYIvc-CDxNMPZysxYAYLcEg5g0956L29kDLQk0qCxnAhDOODhrChiAjoEQ0kOj1BMCCZM0RBjkFQBAOAqhC6Eklj1AKABaTczQLEI11IqHQmhwKFX8HAh+Z5GDoBMT7RAcdwEc3ZnFBM7Z25RXfCYZh2sqLrk0C4vkCDrirTSPAbCFNerHgXEuLwdZjy1DVBqZs1gALRl7qjGJA5Nq2kpJ48RLQzA+E-KYUIEJMRmDDF0KyfobAwKTNCFRMS0ywAADLEgAKKoLpFUisfdvBUHqV0OOXgoaWM8FUH0G5YzeHpnYUprEPITNfLYNUFhvxgTqN4Kwcc2EDCHrbZyzVWq3j2b1BR1Z9AyRUSGfQ5EQi+FkqiaE0ZjAghiYtZaCT6Ci3rmI-a2pwH038MGP0dZoytKqAmOWIR1Zwu6DEgWQt8ZpAhaYqFs4pI7jBmiw0AQEpLIQKEBcmI5ZvnqD6WwMS+a4txsLdiG1IUUMpqielMlYR6ATOBSlrSVG+AmvoeKQIgQxOLqXcuXJHkN0cAYdVGjQg9CCHvd8dZJpnN6A49G1ycHOVHmXceBKHnJOXgJFRkYQ4XSOUVQMDNmjJhRMwxMGpwy-iTDix2ptUKjLQaq-CjqEaKlKjUH8HrvFtBAv4OMvQ1zyIVQgpBEatCvLAr3bQfpDCQ26GqP075LABBsglewFgaoxN4fw7NdrTHlCmXU1oDT5nNJpTDMCEFfx1Hpjibm5reRpiQUMmYYbxktq8TU6ZszGkLJaUBPwkZVmFL8CdWE2jIhAA */
  id: "voucherMachine",
  initial: "voucherMenu",
  predictableActionArguments: true,
  states: {
    voucherMenu: {
      on: {
        TRANSIT: [
          { target: "loadingHeldVouchers", cond: "isOption1" },
          { target: "loadingInfo", cond: "isOption2" },
          /*{ target: "loadingDirectory", cond: "isOption3" },
          { target: "loadingBalances", cond: "isOption4" },*/
        ]
      },
      description: "Displays voucher menu."
    },
    loadingHeldVouchers: {
      invoke: {
        src: "fetchHeldVouchers",
        onDone: { target: "selectingVoucher", actions: "setHeldVouchers" },
        onError: { target: "vouchersLoadError", actions: "updateErrorMessages" }
      },
      description: "Loads and orders all voucher held by the user."
    },
    selectingVoucher: {
      on: {
        TRANSIT: [
          { target: "authorizingVoucherSelection", cond: "isValidVoucherOption", actions: "saveVoucherSelection" },
          { target: "secondSet", cond: "isOption11" },
          { target: "invalidVoucherSelection" },
        ]
      },
      description: "Expects user to select a voucher from the list."
    },
    vouchersLoadError: { type: "final" },
    secondSet: {
      on: {
        TRANSIT: [
          { target: "authorizingVoucherSelection", cond: "isValidVoucherOption", actions: "saveVoucherSelection" },
          { target: "thirdSet", cond: "isOption11" },
          { target: "selectingVoucher", cond: "isOption22" },
          { target: "invalidVoucherSelection" },
        ]
      },
      description: "Expects user to select a voucher from the second list."
    },
    thirdSet: {
      on: {
        TRANSIT: [
          { target: "authorizingVoucherSelection", cond: "isValidVoucherOption", actions: "saveVoucherSelection" },
          { target: "secondSet", cond: "isOption22" },
          { target: "invalidVoucherSelection" },
        ]
      },
      description: "Expects user to select a voucher from the third list."
    },
    invalidVoucherSelection: {
      entry: send( { type: "RETRY", feedback: "invalidVoucher" } ),
      on: { TRANSIT: "selectingVoucher" },
    },
    authorizingVoucherSelection: {
      on: {
        TRANSIT: [
          { target: "loadingActiveVoucher", cond: "isAuthorized" },
          { target: "unauthorizedSelection" }
        ]
      },
      description: "Expects user to enter their PIN to authorize the setting of the selection as the active voucher."
    },
    unauthorizedSelection: {
      entry: send( { type: "RETRY", feedback: "invalidPin" } ),
      on: { TRANSIT: "selectingVoucher" },
      description: "Displays error message and returns to voucher selection."
    },
    loadingActiveVoucher: {
      invoke: {
        src: "fetchActiveVoucher",
        onDone: { target: "activeVoucherSet", actions: "updateActiveVoucher" },
        onError: { target: "activeVoucherSetError", actions: "updateErrorMessages" }
      },
      description: "Loads the active voucher from redis."
    },
    activeVoucherSet: {
      on: { BACK: "voucherMenu" },
      description: "Displays success message and offers option to return to voucher menu."
    },
    activeVoucherSetError: {
      type: "final",
      description: "Active voucher could not be set. The error message will be in the context object."
    },
    loadingInfo: {
      invoke: {
        src: "fetchVoucherInfo",
        onDone: { target: "displayInfo", actions: "setInfo" },
        onError: { target: "voucherInfoLoadError", actions: "updateErrorMessages" }
      },
      description: "Loads metadata about the active voucher."
    },
    displayInfo: {
      on: { BACK: "voucherMenu" },
      description: "Displays metadata about the active voucher."
    },
    voucherInfoLoadError: { type: "final" },
    /*loadingDirectory: {
      invoke: {
        src: "fetchDirectory",
        onDone: { target: "displayDirectory", actions: "setDirectory" },
        onError: { target: "voucherDirectoryLoadError", actions: "updateErrorMessages" },
        description: "Loads a directory { balance, products } of all users who hold the active voucher. Is ordered by balance ASC."
      },
      description: "Loads a directory of users with the least balance of the active voucher."
    },
    displayDirectory: {
      on: { BACK: "voucherMenu" },
      description: "Displays a directory of all users who hold the active voucher."
    },
    voucherDirectoryLoadError: { type: "final" },
    loadingBalances: {
      invoke: {
        src: "fetchBalances",
        onDone: { target: "displayBalances", actions: "setBalances" },
        onError: { target: "voucherBalancesLoadError", actions: "updateErrorMessages" },
        description: "Loads balances of all users who hold the active voucher. Is ordered by balance ASC."
      }
    },
    displayBalances: {
      on: { BACK: "voucherMenu" },
      description: "Displays balances of all users who hold the active voucher."
    },
    voucherBalancesLoadError: { type: "final" }*/
  }
})

async function fetchBalances(context: VoucherContext) {
  // TODO[Philip]: This isn't necessary for the MVP, but it would be nice to have.
}

async function fetchDirectory(context: VoucherContext) {
  const directory = await getVouchers(context.resources.redis, VoucherMetadata.DIRECTORY, context.user.activeVoucher.symbol) as VoucherDirectory[] | undefined;
  if (!directory) {
    throw new Error("Could not load voucher directory.");
  }

  return directory
    .sort((a, b) => b.balance - a.balance)
    .map((voucher, index) => `${index + 1}. ${voucher.phoneNumber} ${voucher.balance.toFixed(2)}`);
}

async function fetchHeldVouchers(context: VoucherContext) {
  const held = await getVouchers(context.resources.redis, VoucherMetadata.HELD, context.user.account.address) as ActiveVoucher[] | undefined
  const lastReceived = await getVouchers(context.resources.redis, VoucherMetadata.LAST_RECEIVED, context.user.account.address) as ActiveVoucher | undefined
  const lastSent = await getVouchers(context.resources.redis, VoucherMetadata.LAST_SENT, context.user.account.address) as ActiveVoucher | undefined
  return await formatVouchers(context.user.activeVoucher, held, lastReceived, lastSent);
}

async function fetchVoucherInfo(context: VoucherContext) {
  const cache = new Cache(context.resources.redis, context.user.activeVoucher.symbol);
  const info = await cache.getJSON() as Voucher;
  const [backer, personalInfo] = await Promise.all([findById(context.resources.db, info.voucher_backers[0].backer), info.voucher_backers[0]?.account?.user?.personal_information]);
  if (info) {
    const { voucher_description, voucher_name, symbol } = info;
    const contact = backer.phone_number;
    const issuer = personalInfo ? `${personalInfo.given_names} ${personalInfo.family_name}` : undefined;
    return { contact, description: voucher_description, name: voucher_name, symbol, issuer };
  }
}

async function formatVouchers(active: ActiveVoucher, held: ActiveVoucher[], lastReceived: ActiveVoucher | undefined, lastSent: ActiveVoucher | undefined) {
  const sortedHeld = held?.reduce((acc, voucher) => {
    if (voucher.symbol !== lastSent?.symbol && voucher.symbol !== lastReceived?.symbol && voucher.symbol !== active.symbol) {
      acc.push(voucher)}
    return acc;
  }, []).sort((a, b) => a.balance - b.balance);
  const orderedVouchers = [];
  if (lastSent) orderedVouchers.push(lastSent);
  if (lastReceived) orderedVouchers.push(lastReceived);
  const deduplicatedHeld = sortedHeld.filter((voucher, index, arr) =>
    index === arr.findIndex((v) => v.address === voucher.address));
  return deduplicatedHeld.map((voucher, index) => {
    return `${index + 1}. ${voucher.symbol} ${voucher.balance.toFixed(2)}`
  })
}

function isValidVoucherOption(context: VoucherContext, event: any) {
  const vouchers = context.data.held;
  const input = event.data.toLowerCase();

  for (const v of vouchers) {
    const [i, s] = v.split('. ');
    if (i === input || s.toLowerCase() === input) {
      return true;
    }
  }

  return false;
}

async function fetchActiveVoucher(context: VoucherContext) {
  const av = await getVouchers(context.resources.redis, VoucherMetadata.HELD, context.user.account.address) as ActiveVoucher[] | undefined
  const fs = context.data.selected.toUpperCase();
  const voucher = av.find(v => v.symbol === fs);
  await setVouchers(context.resources.redis, VoucherMetadata.ACTIVE, voucher, context.user.account.address);
  return voucher;
}

function setBalances(context: VoucherContext, event: any) {
  return context.data.balances = event.data;
}

function setDirectory(context: VoucherContext, event: any) {
  return context.data.directory = event.data;
}

function setHeldVouchers(context: VoucherContext, event: any) {
  return context.data.held = event.data;
}

function setInfo(context: VoucherContext, event: any) {
  return context.data.info = event.data;
}

function saveVoucherSelection(context: VoucherContext, event: any) {
  const vouchers = context.data.held;
  const input = event.data.toLowerCase();

  for (const v of vouchers) {
    const [i, s] = v.split('. ');
    if (i === input || s.toLowerCase() === input) {
      return context.data.selected = s;
    }
  }
}

function updateActiveVoucher(context: VoucherContext, event: any) {
  context.user.activeVoucher = event.data;
}
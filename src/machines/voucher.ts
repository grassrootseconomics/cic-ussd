import {createMachine, send} from "xstate";
import {
  BaseContext,
  BaseEvent,
  isOption00,
  isOption1,
  isOption11,
  isOption2,
  isOption22,
  isOption9,
  translate,
  updateErrorMessages
} from "@src/machines/utils";
import {ActiveVoucher, getVouchers, setVouchers, VoucherMetadata} from "@lib/ussd/voucher";
import {updateAttempts} from "@src/machines/auth";
import {Cache} from "@utils/redis";
import {Voucher} from "@lib/graph/voucher";
import {findById} from "@db/models/account";
import {Transaction, TransactionType} from "@machines/statement";
import {AccountMetadata, getAccountMetadata} from "@lib/ussd/account";
import {tHelpers} from "@src/i18n/translator";
import {MachineError} from "@lib/errors";
import bcrypt from "bcrypt";

export interface VoucherContext extends BaseContext {
  data: {
    held?: string[];
    selected?: string;
    directory?: string[];
    info?: {
      contact: string;
      description: string;
      location: string;
      name: string;
      symbol: string;
    };
    balances?: string[];
  }
}

type VoucherEvent =
  BaseEvent


enum VoucherErrors {
  INVALID_PIN = "INVALID_PIN",
  UNAUTHORIZED = "UNAUTHORIZED",
  SET_FAILED = "SET_FAILED",
}


export const voucherMachine = createMachine<BaseContext, BaseEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QDcD2BXAxgCzAJwDo0tc8BZMAO3QGIAhAQQGEBpAbQAYBdRUAB1SwAlgBchqSrxAAPRACYAzAE4lBACwBWBRwBsGgOwcAHBw4KdAGhABPREv2q5GpwoVO1ajkrkBfH1eIcfCIMIPIqWgAVACUGADkAZQBJSM4eJBABYTEJKVkERRV1LV0DY1NzK1sEI30dAh0dJQUARjMvFrldPwDQ0hCSfApqGhj45NSW9P5BUXFJDPzC1U1tPUMTM0sbRBb9FpaCBSMuuTqjbxUNHpBA-oAbVABDCCFKKAAJMHuIADU+-CwGgQCRgAhvNAAazBd2Cjxeb0+3z+ALwsAQENQmCeOUoaTSUiyc1yi3kHgUBA0ah0RgO9g0GgOVUQan0FI4igUrLUKns+jkOhusMI8Ne7y+P3+gzRNHweFQhD49xxADMFQBbAZhAiixESlHS9GY7G4-HcQmzXF5RDaAwEE4mRp1DRKPTbapGcwEfT6F0mPlefZC1EEWDfMCYMTvKVhejMdjmjJEq2khAtIwaeocalKWoONm6NTMtMcfRGI5NFqurnaHm+fy3ENh+4RqNQGOkUaxRIpAlJy3za1pjNZnN5+xrIs7NN7VTmJQtZxGHTKakKYPS0PhyOIjv4LvjXtTC3ZQepzqtAgtTxGDOaHRlrTFzP6AhyEfpppsn1KDfa5utruqIHj2qRyNMmQDiSoD5OmmYENmTTjgWOhTtUOjXgQvJKAYvoFrUf79ABO7RsBYygWwCgQcmZ4wbsI4IWOP4oWhNpsuoKgXD6WgPuYhHBGGmASBACRgCIIETH2MyntBMi7J0r4aKYphNDSHAGAoxYtG4cj2poGi1AcZhtEY-GEIJwmieJ5GSce-YyQsdEIB4r7OusBlsgyGjPj63oZg4xwKM4XJmVuQmUCJYkSb24EnsSjlyTOZyUspuiuiYGnFhhrkjmWhhtNp9a9JuFkRVZ0WpFRcUpk5BzJUpymqRlbLFvo1Jvv5ajvr6Bh7KFpWRdZ3aSWo1FQQlsEKSljXpepLXTqcb4Nc4fJlnNoUiNgQh4INFVSZBDlDmomGlrSmg4QYNJab6uknHI76egWDimQ2woEJt227TZR5jYdqbHWoCFlteLoMucWXvh1mZKGYzg8gYG1bTt5XfWBv3xUdJ3A+dYNXdOy6vrDlbaV1HKCq9IYfcjUWo5R6M1YlANA2doOXUYxa0tNHJyPS1YcqFEJPPcQiRS2O4SHtibSRjqZdF6i4ru+OillWSjFm47KpReqEHI0oVUCI+CIgACm8kv07RiVVtmDS1Nl5TpvdWlqBcjG1M4Gmur+FObgbRvvKblB7XZ0sM0sygrCU6zlFs10YfaJzGHUlxct7xXak86CbQqQgAF6IqJYu4sCoLgpQUJgpn2d4HnBfbqaUsHTLtVTQ1KmzZl04HC09RaAZuaPWc1w+xnWfYDn+fvIXgES3KCoEEqqoagQVfjzXk9QNP4t4o3NGyZN9WpU1c2aV3K6Azz7teF1+bk+n-SrxPddF-Msp4PKirKiIap4Jqj-r8-GeeIQ5NzDvJQ+M01Kd2qAVXS74DKdAOMDTooV-61ynvXV+c9P5L1-ivMeT8MEvwkGwWK9lm5W1bkfDu80YEXHqJfEwahzAClaALcuQsRaBxoNEAAojEAAmvtPeE16LwUQrmZik4tKK29JI8+vEFxqFCrqUi0oAAiYknhCHuECEElAwSYmhDqZ4Yp2yok0SIbRujhHjSHLaV8DpdAPj0K6TMMie7eg5EFDkpgGTNBUaYoCGitE6KBNgheX8f6alUeYkJViwm2L+k5Bx9p3zOOdG490uxDCqD0FSW89g5YMlCsKSx1igSMFYEkih+Q3CmEpIuKkviPBeC0p0XSpgnBmDODoRQnp+piQSFgTAcBKnxhqWA4c4imL5mkV3To5ZlzeEzFyRoRhqSDJEMMzAozYBAlprvOx54GISOQvMmBHJHFNB5rmJweVh4NkoKgCAcApDCmqpbfIABabJCBfkIVSkC5SQVh732COqbRlBhjoE+fveQD4OANEzOmQwbIqxPmnDhBhHtmiKGYfYNOjZNzChhXC0RBQqyAypE0a+BkuTXi0l4XSmg5A8m0m4fYJxAkInFMiPcaJyVDgFLeLCuh8VyGvK6MsHMqxLScBcfF511wjweKYgA8nwXEsBeHvwVEK1Mrh1IIVaOmY6jQaQZg5kFQFZwOQXTLKhQZL81FhANbVJSGgsJaB5gUvprhnyehNZmPpXhaUcBaIM8Kg13WJX5PUJQx1eTc2VqyZ8zRKRBV4m1T0DpEafSsrG-IXUso2yJhmCOy4tDsOQJw0WQCi3yCpZSHMdLPQA3Vmyo4PJ6T8nUnofWlBDY1wDm8RtBQ5ZLWBs6bMx0466WOF0O2KceSoIIQAohDbyFTP2IpbGzQXS5lzM7JSb5JHNQQWyGtdbA7jsXK7CNl70z2FWDIrwcjagnAMAYZcd9iXaliQK8pYTx0CkMMijCtRSytBwqfGBD5dKK3UtDA4rIXrgpFKY4DujdUf3HUar1xkzU93WVaruaKE5dFKN4X03LVXBDKaE3R+HbQmoOBskjlrvJnzMFeMstRL5bD1vR8yQyRljLvc4TpKguj2D2EmuQTKM3wJONSRo6lrxbNw-q7dXzdieu9W4HCLt-VwbsLUPyBhJXaWVqcVBuyMBDroI8TA0IICgcRRB1F0GMVmemfUfYVJd3tr2JGkTBAwDSFEKB5tNKYaJvpR2rFvl9jeDWFSRNPM-B+CAA */
  id: "voucher",
  initial: "voucherMenu",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    mainMenu: {
      type: "final",
      description: "Returns user to main menu machine"
    },
    voucherMenu: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "loadingHeldVouchers", cond: "isOption1" },
          { target: "loadingVoucherDetails", cond: "isOption2" },
        ]
      },
      description: "Displays voucher menu."
    },

    // voucher selection states
    loadingHeldVouchers: {
      invoke: {
        src: "fetchHeldVouchers",
        onDone: { target: "selectingVoucher", actions: "setHeldVouchers" },
        onError: { target: "loadOptionsError", actions: "updateErrorMessages" }
      },
      description: "Loads and orders all voucher held by the user.",
      tags: "invoked"
    },
    loadOptionsError: {
      type: "final",
      description: "Held vouchers were not loaded successfully.",
      tags: "error"
    },
    selectingVoucher: {
      on: {
        BACK: "voucherMenu",
        TRANSIT: [
          { target: "enteringPin", cond: "isValidVoucherOption", actions: "saveVoucherSelection" },
          { target: "secondSet", cond: "isOption11" },
          { target: "exit", cond: "isOption00" },
          { target: "invalidSelection" },
        ]
      },
      description: "Expects user to select a voucher from the list.",
      tags: "resolved"
    },
    secondSet: {
      on: {
        TRANSIT: [
          { target: "enteringPin", cond: "isValidVoucherOption", actions: "saveVoucherSelection" },
          { target: "thirdSet", cond: "isOption11" },
          { target: "selectingVoucher", cond: "isOption22" },
          { target: "exit", cond: "isOption00" },
          { target: "invalidSelection" },
        ]
      },
      description: "Expects user to select a voucher from the second list.",
    },
    thirdSet: {
      on: {
        TRANSIT: [
          { target: "enteringPin", cond: "isValidVoucherOption", actions: "saveVoucherSelection" },
          { target: "secondSet", cond: "isOption22" },
          { target: "exit", cond: "isOption00" },
          { target: "invalidSelection" },
        ]
      },
      description: "Expects user to select a voucher from the third list."
    },
    invalidSelection: {
      entry: send( { type: "RETRY", feedback: "invalidVoucher" } ),
      on: { TRANSIT: "selectingVoucher" },
    },
    enteringPin: {
      on: {
        TRANSIT: [
          { target: "authorizingSelection", cond: "isNotBlocked" },
          { target: "accountBlocked" }
        ]
      }
    },
    authorizingSelection: {
      invoke: {
        id: "authorizingSelection",
        src: "authorizeSelection",
        onDone: { target: "setSuccess", cond: "succeeded" },
        onError: [
          { target: "invalidPin", cond: "isInvalidPin" },
          { target: "setError", cond: "isSetError" },
          { target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      description: "Authorizes the user's selection.",
      tags: "invoked"
    },
    invalidPin: {
      entry: send( { type: "RETRY", feedback: "invalidPin" } ),
      on: { RETRY: "enteringPin" },
      tags: "error"
    },

    // voucher details states
    loadingVoucherDetails: {
      invoke: {
        id: "loadingVoucherDetails",
        src: "fetchVoucherInfo",
        onDone: { target: "voucherDetails", actions: "setInfo" },
        onError: { target: "loadDetailsError", actions: "updateErrorMessages" }
      },
      description: "Loads voucher details.",
      tags: "invoked"
    },
    loadDetailsError: {
      type: "final",
      description: "Voucher details were not loaded successfully.",
      tags: "error"
    },
    voucherDetails: {
      on: {
        BACK: "voucherMenu",
      },
      description: "Displays voucher details.",
      tags: "resolved"
    },

    // final states
    setSuccess: {
      on: {
        BACK: "voucherMenu",
        TRANSIT: { target: "exit", cond: "isOption9" }
      },
      description: "Active voucher has been set successfully.",
      tags: "resolved"
    },
    setError: {
      type: "final",
      description: "Exits the ussd session.",
      tags: "error"
    },
    accountBlocked: {
      type: "final",
      description: "Exits the ussd session.",
      tags: "error"
    },
    exit: {
      type: "final",
      description: "Exits the ussd session."
    }
  }
}, {
    actions: {
      setHeldVouchers,
      saveVoucherSelection,
      updateActiveVoucher,
      setInfo,
      updateErrorMessages
    },
    guards: {
      isValidVoucherOption,
      isOption1,
      isOption2,
      isOption9,
      isOption11,
      isOption22,
      isOption00,
      succeeded,
      isInvalidPin,
      isSetError,
      isBlocked,
      isNotBlocked: (context: VoucherContext) => !isBlocked(context)
    },
    services: {
      fetchVoucherInfo,
      fetchHeldVouchers,
      setActiveVoucher,
      authorizeSelection
    }
})


async function authorizeSelection(context: VoucherContext, event: any) {

  const { user: { account: { password } } } = context
  const { input } = event

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(VoucherErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(VoucherErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  // set active voucher.
  try {
    await setActiveVoucher(context)
    return { success: true }
  } catch (error) {
    throw new MachineError(VoucherErrors.SET_FAILED, "PIN is incorrect.")
  }

}

export function succeeded(context: BaseContext, event: any) {
  return event.data.success
}

function isInvalidPin(context: VoucherContext, event: any) {
  return event.data.code === VoucherErrors.INVALID_PIN || event.data.code === VoucherErrors.UNAUTHORIZED
}

function isSetError(context: VoucherContext, event: any) {
  return event.data.code === VoucherErrors.SET_FAILED
}

function isBlocked(context: VoucherContext) {
  const { user: { account: { pin_attempts } } } = context
  return pin_attempts === 3
}

async function fetchHeldVouchers(context: VoucherContext) {
  const { resources: { p_redis }, user: { account: { address }, activeVoucher } } = context;
  const held = await getVouchers<ActiveVoucher>(address, p_redis, VoucherMetadata.HELD);
  const statement = await getAccountMetadata<Transaction[]>(address, p_redis, AccountMetadata.STATEMENT);
  const info = await fetchVoucherInfo(context);
  const formatted = await formatVouchers(activeVoucher, held, statement);
  return { held: formatted, info };
}

async function fetchVoucherInfo(context: VoucherContext) {
  const { resources: { db, p_redis }, user: { activeVoucher: { address } }  } = context;

  // attempt to fetch voucher information from cache.
  const iCache = new Cache(p_redis, `address-info:${address}`);
  let info = await iCache.getJSON();

  // if cache is empty, build info from cache and db and save to cache.
  if (!info) {
    // get voucher metadata from cache.
    const vCache = new Cache<Voucher>(p_redis, address);
    const voucher = await vCache.getJSON();

    if (!voucher) {
      throw new Error("Could not load voucher voucher.");
    }

    // get backer from database.
    const backer = await findById(db, voucher.backer);

    // format the voucher info.
    info = {
      contact: backer?.phone_number,
      description: voucher.voucher_description,
      location: voucher.location_name,
      name: voucher.voucher_name,
      symbol: voucher.symbol,
    };

    // save info to cache.
    await iCache.setJSON(info);
  }
  return info;
}

async function formatVouchers(active: ActiveVoucher, held: ActiveVoucher[], statement: Transaction[]) {
  // get credits and debits in one loop
  let credits = [];
  let debits = [];
  for (const element of statement) {
    if (element.type === TransactionType.CREDIT) {
      credits.push(element);
    } else if (element.type === TransactionType.DEBIT) {
      debits.push(element);
    }
  }

  // get the last credit, debit and active voucher symbol
  let lastCreditSymbol = credits.length > 0 ? credits[credits.length - 1].symbol : null;
  let lastDebitSymbol = debits.length > 0 ? debits[debits.length - 1].symbol : null;
  const activeSymbol = active.symbol;

  // sort the held vouchers by balance
  const sortedHeld = held.slice().sort((a, b) => a.balance - b.balance);

  // if last credit, debit or active voucher are present and not the same as the active voucher or each other, add them to the top of the list
  const lastCreditIndex = lastCreditSymbol && lastCreditSymbol !== activeSymbol && lastCreditSymbol !== lastDebitSymbol ? sortedHeld.findIndex((v) => v.symbol === lastCreditSymbol) : null;
  const lastDebitIndex = lastDebitSymbol && lastDebitSymbol !== activeSymbol && lastDebitSymbol !== lastCreditSymbol ? sortedHeld.findIndex((v) => v.symbol === lastDebitSymbol) : null;

  // create an ordered array with the last credit, debit and active voucher at the top
  const orderedHeld = [];
  if (lastCreditIndex) {
    orderedHeld.push(sortedHeld[lastCreditIndex]);
  }
  if (lastDebitIndex) {
    orderedHeld.push(sortedHeld[lastDebitIndex]);
  }

  // add the active voucher
  orderedHeld.push(sortedHeld.find((v) => v.symbol === activeSymbol));

  // add the rest of the vouchers
  const filteredHeld = sortedHeld
    .filter((v) => v.symbol !== lastCreditSymbol && v.symbol !== lastDebitSymbol && v.symbol !== activeSymbol);
  orderedHeld.push(...filteredHeld);

  // format the vouchers
  return orderedHeld
    .slice(0, 9)
    .map((voucher, index) => `${index + 1}. ${voucher.symbol} ${voucher.balance.toFixed(2)}`);
}

function isValidVoucherOption(context: VoucherContext, event: any) {
  const vouchers = context.data.held;
  const input = event.input.toLowerCase();
  let isValid = false;

  for (const v of vouchers) {
    const [i, s] = v.split('. ');
    if (i === input || s.toLowerCase() === input) {
      isValid = true;
      break
    }
  }

  return isValid;
}

async function setActiveVoucher(context: VoucherContext) {
  const { resources: { p_redis }, user: { account: { address } } } = context
  const av = await getVouchers<ActiveVoucher[]>(address, p_redis,VoucherMetadata.HELD)
  const fs = context.data.selected.toUpperCase();
  const voucher = av.find(v => v.symbol === fs);
  await setVouchers(address, p_redis, voucher, VoucherMetadata.ACTIVE);
  return voucher;
}

function setHeldVouchers(context: VoucherContext, event: any) {
  context.data.held = event.data.held;
  context.data.info = event.data.info
  return context;
}

function setInfo(context: VoucherContext, event: any) {
  context.data.info = event.data;
  return context;
}

function saveVoucherSelection(context: VoucherContext, event: any) {
  const vouchers = context.data.held;
  const input = event.input.toLowerCase();

  for (const v of vouchers) {
    const [i, s] = v.split('. ');
    if (i === input || s.toLowerCase() === input) {
        context.data.selected = s.split(" ")[0];
        break
    }
  }
  return context;
}

function updateActiveVoucher(context: VoucherContext, event: any) {
  context.user.activeVoucher = event.data;
  return context
}

export async function voucherTranslations(context: VoucherContext, state: string, translator: any) {
  const { data, user: { account: { language }, activeVoucher: { balance, symbol } } } = context;
  const noMoreVouchers = tHelpers("noMoreVouchers", language)

  let result;
  switch (state) {
    case "selectingVoucher":
      result = await translate(state, translator, { vouchers: data.held[0] });
      break;
    case "secondSet":
      if (data.held.length > 3){
        result = await translate(state, translator, { vouchers: data.held[1] });
      } else {
        result = noMoreVouchers;
      }
      break;
    case "thirdSet":
      if (data.held.length > 6){
        result = await translate(state, translator, { vouchers: data.held[2] });
      } else {
        result = noMoreVouchers;
      }
      break;
    case "enteringPin":
    case "voucherDetails":
      result = await translate(state, translator, {
        contact: data.info.contact,
        description: data.info.description,
        location: data.info.location,
        name: data.info.name,
        symbol: symbol
      });
      break;
    case "setSuccess":
      result = await translate(state, translator, { symbol: data.selected });
      break;
    case "mainMenu":
      result = await translate(state, translator, { balance: balance, symbol: symbol });
      break;
    default:
      result = await translate(state, translator);
  }

  return result;
}

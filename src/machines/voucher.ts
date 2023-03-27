import { createMachine, raise } from 'xstate';
import {
  BaseContext,
  BaseEvent,
  isOption00,
  isOption1,
  isOption11,
  isOption2,
  isOption22,
  isOption9,
  isSuccess,
  MachineId,
  translate,
  updateErrorMessages
} from '@src/machines/utils';
import { ActiveVoucher } from '@lib/ussd/voucher';
import { isBlocked, validatePin } from '@src/machines/auth';
import { Cache } from '@utils/redis';
import { Voucher } from '@lib/graph/voucher';
import { findById } from '@db/models/account';
import { Transaction, TransactionType } from '@machines/statement';
import { tHelpers } from '@src/i18n/translator';
import { MachineError } from '@lib/errors';

enum VouchersError {
  SET_FAILED = "SET_FAILED",
}


export const voucherMachine = createMachine<BaseContext, BaseEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QDcD2BXAxgCzAJwDo0tc8BZMAO3QGIAhAQQGEBpAbQAYBdRUAB1SwAlgBchqSrxAAPRACYAzAE4lBACwBWBRwBsGgOwcAHBw4KdAGhABPREv2q5GpwoVO1ajkrkBfH1eIcfCIMIPIqWgAVACUGADkAZQBJSM4eJBABYTEJKVkERRV1LV0DY1NzK1sEI30dAh0dJQUARjMvFrldPwDQ0hCSfApqGhj45NSW9P5BUXFJDPzC1U1tPUMTM0sbRBb9FpaCBSMuuTqjbxUNHpBA-oAbVABDCCFKKAAJMHuIADU+-CwGgQCRgAhvNAAazBd2Cjxeb0+3z+ALwsAQENQmCeOUoaTSUiyc1yi3kHgUBA0ah0RgO9g0GgOVUQan0FI4igUrLUKns+jkOhusMI8Ne7y+P3+gzRNHweFQhD49xxADMFQBbAZhAiixESlHS9GY7G4-HcQmzXF5RDaAwEE4mRp1DRKPTbapGcwEfT6F0mPlefZC1EEWDfMCYMTvKVhejMdjmjJEq2khAtIwaeocalKWoONm6NTMtMcfRGI5NFqurnaHm+fy3ENh+4RqNQGOkUaxRIpAlJy3za1pjNZnN5+xrIs7NN7VTmJQtZxGHTKakKYPS0PhyOIjv4LvjXtTC3ZQepzqtAgtTxGDOaHRlrTFzP6AhyEfpppsn1KDfa5utruqIHj2qRyNMmQDiSoD5OmmYENmTTjgWOhTtUOjXgQvJKAYvoFrUf79ABO7RsBYygWwCgQcmZ4wbsI4IWOP4oWhNpsuoKgXD6WgPuYhHBGGmASBACRgCIIETH2MyntBMi7J0r4aKYphNDSHAGAoxYtG4cj2poGi1AcZhtEY-GEIJwmieJ5GSce-YyQsdEIB4r7OusBlsgyGjPj63oZg4xwKM4XJmVuQmUCJYkSb24EnsSjlyTOZyUspuiuiYGnFhhrkjmWhhtNp9a9JuFkRVZ0WpFRcUpk5BzJUpymqRlbLFvo1Jvv5ajvr6Bh7KFpWRdZ3aSWo1FQQlsEKSljXpepLXTqcb4Nc4fJlnNoUiNgQh4INFVSZBDlDmomGlrSmg4QYNJab6uknHI76egWDimQ2woEJt227TZR5jYdqbHWoCFlteLoMucWXvh1mZKGYzg8gYG1bTt5XfWBv3xUdJ3A+dYNXdOy6vrDlbaV1HKCq9IYfcjUWo5R6M1YlANA2doOXUYxa0tNHJyPS1YcqFEJPPcQiRS2O4SHtibSRjqZdF6i4ru+OillWSjFm47KpReqEHI0oVUCI+CIgACm8kv07RiVVtmDS1Nl5TpvdWlqBcjG1M4Gmur+FObgbRvvKblB7XZ0sM0sygrCU6zlFs10YfaJzGHUlxct7xXak86CbQqQgAF6IqJYu4sCoLgpQUJgpn2d4HnBfbqaUsHTLtVTQ1KmzZl04HC09RaAZuaPWc1w+xnWfYDn+fvIXgES3KCoEEqqoagQVfjzXk9QNP4t4o3NGyZN9WpU1c2aV3K6Azz7teF1+bk+n-SrxPddF-Msp4PKirKiIap4Jqj-r8-GeeIQ5NzDvJQ+M01Kd2qAVXS74DKdAOMDTooV-61ynvXV+c9P5L1-ivMeT8MEvwkGwWK9lm5W1bkfDu80YEXHqJfEwahzAClaALcuQsRaBxoNEAAojEAAmvtPeE16LwUQrmZik4tKK29JI8+vEFxqFCrqUi0oAAiYknhCHuECEElAwSYmhDqZ4Yp2yok0SIbRujhHjSHLaV8DpdAPj0K6TMMie7eg5EFDkpgGTNBUaYoCGitE6KBNgheX8f6alUeYkJViwm2L+k5Bx9p3zOOdG490uxDCqD0FSW89g5YMlCsKSx1igSMFYEkih+Q3CmEpIuKkviPBeC0p0XSpgnBmDODoRQnp+piQSFgTAcBKnxhqWA4c4imL5mkV3To5ZlzeEzFyRoRhqSDJEMMzAozYBAlprvOx54GISOQvMmBHJHFNB5rmJweVh4NkoKgCAcApDCmqpbfIABabJCBfkIVSkC5SQVh732COqbRlBhjoE+fveQD4OANEzOmQwbIqxPmnDhBhHtmiKGYfYNOjZNzChhXC0RBQqyAypE0a+BkuTXi0l4XSmg5A8m0m4fYJxAkInFMiPcaJyVDgFLeLCuh8VyGvK6MsHMqxLScBcfF511wjweKYgA8nwXEsBeHvwVEK1Mrh1IIVaOmY6jQaQZg5kFQFZwOQXTLKhQZL81FhANbVJSGgsJaB5gUvprhnyehNZmPpXhaUcBaIM8Kg13WJX5PUJQx1eTc2VqyZ8zRKRBV4m1T0DpEafSsrG-IXUso2yJhmCOy4tDsOQJw0WQCi3yCpZSHMdLPQA3Vmyo4PJ6T8nUnofWlBDY1wDm8RtBQ5ZLWBs6bMx0466WOF0O2KceSoIIQAohDbyFTP2IpbGzQXS5lzM7JSb5JHNQQWyGtdbA7jsXK7CNl70z2FWDIrwcjagnAMAYZcd9iXaliQK8pYTx0CkMMijCtRSytBwqfGBD5dKK3UtDA4rIXrgpFKY4DujdUf3HUar1xkzU93WVaruaKE5dFKN4X03LVXBDKaE3R+HbQmoOBskjlrvJnzMFeMstRL5bD1vR8yQyRljLvc4TpKguj2D2EmuQTKM3wJONSRo6lrxbNw-q7dXzdieu9W4HCLt-VwbsLUPyBhJXaWVqcVBuyMBDroI8TA0IICgcRRB1F0GMVmemfUfYVJd3tr2JGkTBAwDSFEKB5tNKYaJvpR2rFvl9jeDWFSRNPM-B+CAA */
  id: MachineId.VOUCHER,
  initial: "voucherMenu",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    accountBlocked: {
      description: 'Account is blocked.',
      tags: 'error',
      type: 'final'
    },
    authorizingSelection: {
      description: 'Invoked service that authorizes the voucher selection.',
      invoke: {
        id: 'authorizingSelection',
        src: 'authorizeSelection',
        onDone: { target: 'setSuccess', cond: 'isSuccess' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'setError', cond: 'isSetError', actions: 'updateErrorMessages' },
          { target: 'invalidPin' }
        ]
      },
      tags: 'invoked'
    },
    displayVoucherInfo: {
      description: 'Displays voucher info.',
      on: {
        BACK: 'voucherMenu'
      },
      tags: 'resolved'
    },
    enteringPin: {
      description: 'Expects a valid pin entry.',
      on: {
        TRANSIT: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'authorizingSelection' },
        ]
      },
      tags: ['encryptInput', 'error']
    },
    exit: {
      description: 'Terminates USSD session.',
      type: 'final'
    },
    firstVoucherSet: {
      on: {
        BACK: 'voucherMenu',
        TRANSIT: [
          { target: 'enteringPin', cond: 'isValidVoucherOption', actions: 'saveVoucherSelection' },
          { target: 'secondVoucherSet', cond: 'isOption11' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidSelection' }
        ]
      },
      description: 'Expects user to select a voucher from the list.',
      tags: 'resolved'
    },
    invalidPin: {
      description: 'Entered PIN is invalid. Raises a RETRY event to prompt user to retry PIN entry.',
      entry: raise({ type: 'RETRY', feedback: 'invalidPin' }),
      on: { RETRY: 'enteringPin' }
    },
    invalidSelection: {
      description: 'Entered selection is invalid. Raises a RETRY event to prompt user to retry selection.',
      entry: raise({ type: 'RETRY', feedback: 'invalidVoucher' }),
      on: { RETRY: 'firstVoucherSet' }
    },
    loadInfoError: {
      description: 'Loading voucher info failed.',
      tags: 'error',
      type: 'final'
    },
    loadOptionsError: {
      description: 'Loading voucher options failed.',
      tags: 'error',
      type: 'final'
    },
    loadingHeldVouchers: {
      description: 'Invoked service that loads held vouchers.',
      invoke: {
        src: 'loadHeldVouchers',
        onDone: { target: 'firstVoucherSet', actions: 'saveHeldVouchers' },
        onError: { target: 'loadOptionsError', actions: 'updateErrorMessages' }
      },
      tags: 'invoked'
    },
    loadingVoucherInfo: {
      description: 'Invoked service that loads voucher info.',
      invoke: {
        id: 'loadingVoucherInfo',
        src: 'loadVoucherInfo',
        onDone: { target: 'displayVoucherInfo', actions: 'saveVoucherInfo' },
        onError: { target: 'loadInfoError', actions: 'updateErrorMessages' }
      },
      tags: 'invoked'
    },
    mainMenu: {
      description: 'Transits to main menu.',
      type: 'final'
    },
    secondVoucherSet: {
      description: 'Expects selection from second voucher set.',
      on: {
        TRANSIT: [
          { target: 'enteringPin', cond: 'isValidVoucherOption', actions: 'saveVoucherSelection' },
          { target: 'thirdVoucherSet', cond: 'isOption11' },
          { target: 'firstVoucherSet', cond: 'isOption22' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidSelection' }
        ]
      }
    },
    setError: {
      description: 'Setting active voucher failed.',
      tags: 'error',
      type: 'final'
    },
    setSuccess: {
      description: 'Active voucher has been set successfully.',
      on: {
        BACK: 'voucherMenu',
        TRANSIT: { target: 'exit', cond: 'isOption9' }
      },
      tags: 'resolved'
    },
    thirdVoucherSet: {
      on: {
        TRANSIT: [
          { target: 'enteringPin', cond: 'isValidVoucherOption', actions: 'saveVoucherSelection' },
          { target: 'secondVoucherSet', cond: 'isOption22' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidSelection' }
        ]
      },
      description: 'Expects user to select a voucher from the third list.'
    },
    voucherMenu: {
      description: 'Displays voucher menu.',
      on: {
        BACK: 'mainMenu',
        TRANSIT: [
          { target: 'loadingHeldVouchers', cond: 'isOption1' },
          { target: 'loadingVoucherInfo', cond: 'isOption2' }
        ]
      }
    }
  }
}, {
    actions: {
      saveVoucherSelection,
      saveHeldVouchers,
      saveVoucherInfo,
      updateActiveVoucher,
      updateErrorMessages
    },
    guards: {
      isBlocked,
      isOption00,
      isOption1,
      isOption11,
      isOption2,
      isOption22,
      isOption9,
      isSetError,
      isValidVoucherOption,
      isSuccess
    },
    services: {
      loadVoucherInfo,
      loadHeldVouchers,
      setActiveVoucher,
      authorizeSelection
    }
})


async function authorizeSelection(context: BaseContext, event: any) {
  const { input } = event

  await validatePin(context, input)

  // set active voucher.
  try {
    await setActiveVoucher(context)
    return { success: true }
  } catch (error) {
    throw new MachineError(VouchersError.SET_FAILED, error.message)
  }

}

function isSetError(context: BaseContext, event: any) {
  return event.data.code === VouchersError.SET_FAILED
}

async function loadHeldVouchers(context: BaseContext) {
  const { user: { transactions, vouchers: { active, held } } } = context;
  const info = await loadVoucherInfo(context);
  const formatted = await formatVouchers(active, held, transactions);
  return { held: formatted, info };
}

async function loadVoucherInfo(context: BaseContext) {
  const { resources: { db, p_redis }, user: { vouchers: {active: { address } } } } = context;

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

async function formatVouchers(active: ActiveVoucher, held: ActiveVoucher[], transactions: Transaction[]) {

  if (!transactions) {
    transactions = [];
  }
  // get credits and debits in one loop
  let credits = [];
  let debits = [];
  for (const element of transactions) {
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

function isValidVoucherOption(context: BaseContext, event: any) {
  const { held } = context.data.vouchers;
  const input = event.input.toLowerCase();
  const selection = held.find((voucher) => {
    const [index, symbol] = voucher.split('. ');
    return index === input || symbol.split(" ")[0].toLowerCase() === input;
  });

  return Boolean(selection);
}


async function setActiveVoucher(context: BaseContext) {
  const { resources: { p_redis }, user: { account: { phone_number }, vouchers: { held } } } = context
  const { selected } = context.data.vouchers
  const voucher = held.find(v => v.symbol === selected.toUpperCase())
  const cache = new Cache(p_redis, phone_number)
  await cache.updateJSON({
    vouchers: {
      active: voucher
    }
  })
}

function saveHeldVouchers(context: BaseContext, event: any) {
  context.data = {
    ...(context.data || {}),
    vouchers: {
      ...(context.data.vouchers || {}),
      held: event.data.held,
      info: event.data.info,
    }
  }
  return context;
}

function saveVoucherInfo(context: BaseContext, event: any) {
  context.data = {
    ...(context.data || {}),
    vouchers: {
      ...(context.data.vouchers || {}),
      info: event.data,
    }
  }
  return context;
}

function saveVoucherSelection(context: BaseContext, event: any) {
  const vouchers = context.data.vouchers.held;
  const input = event.input.toLowerCase();

  const selectedVoucher = vouchers.find((voucher) => {
    const [index, symbol] = voucher.split('. ');
    return index === input || symbol.split(" ")[0].toLowerCase() === input;
  });

  if (selectedVoucher) {
    const [_, symbol] = selectedVoucher.split('. ');
    context.data.vouchers = {
      ...context.data.vouchers,
      selected: symbol.split(" ")[0],
    };
  }

  return context;
}


function updateActiveVoucher(context: BaseContext, event: any) {
  context.user.vouchers.active = event.data;
  return context
}

export async function voucherTranslations(context: BaseContext, state: string, translator: any) {
  const { data,
    user: { account: { language }, vouchers: { active: { balance, symbol } } } } = context;
  const noMoreVouchers = tHelpers("noMoreVouchers", language)

  let result;
  switch (state) {
    case "firstVoucherSet":
      result = await translate(state, translator, { vouchers: data.vouchers.held[0] });
      break;
    case "secondVoucherSet":
      if (data.vouchers.held.length > 3){
        result = await translate(state, translator, { vouchers: data.vouchers.held[1] });
      } else {
        result = noMoreVouchers;
      }
      break;
    case "thirdVoucherSet":
      if (data.vouchers.held.length > 6){
        result = await translate(state, translator, { vouchers: data.vouchers.held[2] });
      } else {
        result = noMoreVouchers;
      }
      break;
    case "enteringPin":
    case "displayVoucherInfo":
      result = await translate(state, translator, {
        contact: data.vouchers.info.contact,
        description: data.vouchers.info.description,
        location: data.vouchers.info.location,
        name: data.vouchers.info.name,
        symbol: symbol
      });
      break;
    case "setSuccess":
      result = await translate(state, translator, { symbol: data.vouchers.selected });
      break;
    case "mainMenu":
      result = await translate(state, translator, { balance: balance, symbol: symbol });
      break;
    default:
      result = await translate(state, translator);
  }

  return result;
}

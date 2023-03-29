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
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOnQFcAXbAewCdcAvAqAZTABsxNLcb8AxBH5gSBAG40A1qIrV6TFuy48++ANoAGALqJQABxqxcvfnpAAPRAEZrAVgDsJO5tcA2F7YAcjuwBoQAE9ENwBmACYSBxdNRy948MSAXySAtCw8QlI5WgZmfDZOblNBMDo6ehJ9DnRKADN6VDIqXMUC5WK1LV0kEENjEvMrBFtHZ1dND01vXwDghFC3AE5xidDXBwAWTYcltxS0jBwCYmb5PKUi1X4BMoq6Kpr6xrPW-MKVEvVrHoMjEzUQxs9icMUmnmsPmic0Q4U0mxImnCoU29nCWwc1mimwOIHSxyyrwU7w611K5Uq1VqDToTRyxMuny64V+fX+g16w1GoImUxm0KCiAcbkiYLcDi82zsXixuPxmVOEFwsCpgQAajRyDgygBJfANAQAIQAggBhADS3XM-QBZk5iEWSycyM2dlCdnCSy9oSWMJG62sJCW1jcyx2mgiky8cqOCtIYHwlDKLAACgQBAAVABKxoAcqwdRmrb0bRzQMNPaEvCRXRFwo5Nuj4m4-UtQoHoq4llHHPZo6k8bGTvHE8mCmnBNm8wWiz9rezAfaEOFrCiSCuEt2InZxX7NvEomD4TKIl5wjiB-LhyQ6rg6LBKBqtdgyuxKEazZadPOBovy7DJicJY3RXBxI2Rc8-WsVFA02UJ4NRH19yROwYwya9b3vR9NW1Og30zHN80LYs-l-O1-2XQCgxArFwIiTYoPbOway8aZu3CNxbCdVDLyHQlMIfJ9cPwqciNnVlSz-SwbA4wNoMmEUvF2btQygtxNk0INXThPZ3U0MDQjQglTgE7Dn1fMB31Emd1BZH9bXwIFKPFaiIlouEIIYwURg4hEllYkN62sYD-IcIy4xvO9BJwl88Msgjp2I0IJIXcjpOcoCaLAjz6KghxNBWOwQ1DGUz1iJZwnC68JHQDhcAgCcBCzABRbMAE0SLZMjHKXOEXOAtzsqRXLvOFQMJn0-cJQ3fZePQwkarqiBSRKJrWqzDrvxLVKeooxJ1KiDx8vWeDQkxNS7BWaZQw07Z4Vmw55tODgaHQJUCgACU4CAhNi2AhBEMR8EkGQSCvQkXrelgvo4H6YrKWAEAkGhMFqLodE6yS0orUKSB8YCV1O4CHAcKCiqceENhRNwI2DQy5uM0hIfeqAYbh8z71uCkHipZ5aTBvjntelm2d+hGkeBlG0f4bpMZ2pz3TA9cTyWTZlmDVcoM2YC8bA26XCUiV6cexmSGZlgxboPUDWEQggZB0RzYKS3rZoOXuoVxxQmV1dVfV2xQig6DA2WaZYiNk6LxNiKnagF39RoLn7keakXlj+OGndhzPaV8IVbVr0A6g48ojOiM4Pu7XrCqwlYG4fh2eE+LrOIrbSOzpduVWcFpkhWZvNsFdxkWFCwJDMKGYiuvMAby2RMImy522j2lzVpxhR3D1gq8YNdhbAfhQRDiSoKtsd5XGvTmn2f4biqyF+Iuzl47iiu7FCEoX8Afllg7SzrO0MDgL6T2vNffAjdYrz0SkWZK9kyzpTfryD+-d5jWH0uNCMYQx7rBcA9QcT1SBgIgRZe+0D1CbBSivV+IJu58j7gKVBXh1jrlDNKJh6wwhVkvoQyyrAtSYDgP9E0Fos7wIrFRAaoE6KQW8upZimgmGom0lCJS3CSB10oHwzAAjYD-RbkWNuXUX7pT6plQa0ivLzEugiaUKJtYcUlCKY2+DTbUDvMQu+CUxKiKksMOCCJ9Ini9h6WmljEAqWcMiIq8FlgomCmotxdAPFQO8UvduYjED+MRBKVcwS4RISgjKBEwoboijsBpBRPFo7XkSck5uD8ixP3Sb4zJa5Am5LAiEgp3kZQ1i9MGHe48kTxASXgJJc96lkNgc-DJCAsntMVu6fJqsoLAXGsVEKyIPA+DUZIDmABZBM5APwiMMVjXaJiz41hAvWLYTYvD71QUiSIxUgEen3AXKOLiIp7Nwoc-Axz9E+OxrCK5tZEgNnuY8mwjZIihkAQZCI6kJ7VMJL82K-zAUNO+JQ4xOMqzXLrJCiUDyg5wRrOPFwER-IuCWCkAc+AaAQDgOYcGxA4EtIQAAWmhdy5i-SBWCubGorAM9yCJkNC9TAMgIAcpBQsHSJAPBhAeeKMIsQwkIB3t7eFmIdysSrHBEVLQGTtCuPA85TkwKghyaxJ08ISak1kWeCl4o85l2lOeNRSoVQ1HVLfV2cqLnDCrNMQ80xHAkzcEpX0A9fJKvhZdNBCj1hfLZSOJMDBxwECDU5c8WwoirhFDsNW6J0StjQYiCYl11LQX3M49NJAwAWBMLm3qjY3CErhBsDSyI-TSk0pwxs-lclMKqd8jCUUzJN0oG21+R0SBVk9JMc8TDQIXU7csLeG4JTChRROhawNar1QnHOhBbp+VumCiGIqaswh+kxKKCYQDVZokmGoxa9UVpSUte2jiXbn29sDgfZYSrirwVAk4htgsmbC1ds1bmZ6Q0BXDSCKNMbi5qyDGEHcWwzqsXHY25mAB5fQJRYAIfuEhh0KHOxoeFBhge2sAn9JAk448ajY6i1vvAGZnK6yFTArEPO0xFh2C-qgnY1YURenUmECpEpOPCwtgGhO1GFUFSVTuKsgD1XlKDvCBN8LFhRNVWojABBMXqcjCsZVOm1U4M1f0kgryt4IWjfuxtRCJmzr4-K3YmkDXyZvSTHceVWKImKmgjwIZ6JqI0ZR+g6n7DulctemLd7gPzA8uubWexe1nm2PF3h-DBHJdDJpTB4mB3nnKdYP0NNCoTFdJdPOYZRnuJ8+pxsqzXCHVYY4MItFPMwZIOisoVm-PBthMW5wIJkQ4KNhJmwZ15Hj1DeUkmat6VJCAA */
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
        BACK: 'loadingHeldVouchers',
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
      ...(context.data?.vouchers || {}),
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
      ...(context.data?.vouchers || {}),
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

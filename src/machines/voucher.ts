import { createMachine, send } from 'xstate';
import {
  isOption00,
  isOption1,
  isOption11,
  isOption2,
  isOption22,
  isOption9,
  isSuccess,
  MachineEvent,
  MachineId,
  updateErrorMessages,
  UserContext
} from '@machines/utils';
import { isBlocked, validatePin } from '@machines/auth';
import { tHelpers, translate } from '@i18n/translators';
import { ContextError, MachineError } from '@lib/errors';
import { Locales } from '@i18n/i18n-types';
import { CachedVoucher, getVoucherByAddress, handleResults, menuPages } from '@lib/ussd';
import { Transaction, TransactionType } from '@services/transfer';
import { UserService } from '@services/user';

enum VouchersError {
  SET_FAILED = "SET_FAILED",
}

interface VoucherInfo {
  description: string,
  location: string,
  name: string,
  symbol: string,
}

export interface VouchersContext extends UserContext {
  data: {
    heldVouchers: string[];
    heldVouchersInfo: {
      [key: string]: VoucherInfo
    };
    selectedVoucher: string;
    voucherBalances: string[];
    voucherInformation: VoucherInfo
  }
}

export const stateMachine = createMachine<VouchersContext, MachineEvent>({
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
          { target: 'exit', cond: 'isOption00' },
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
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
      on: { RETRY: 'enteringPin' }
    },
    invalidSelection: {
      description: 'Entered selection is invalid. Raises a RETRY event to prompt user to retry selection.',
      entry: send({ type: 'RETRY', feedback: 'invalidVoucher' }),
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


async function authorizeSelection(context: VouchersContext, event: any) {
  const { input } = event

  await validatePin(context, input)

  // set active voucher.
  try {
    await setActiveVoucher(context)
    return { success: true }
  } catch (error: any) {
    throw new MachineError(VouchersError.SET_FAILED, error.message)
  }

}

function isSetError(context: VouchersContext, event: any) {
  return event.data.code === VouchersError.SET_FAILED
}

async function loadHeldVouchers(context: VouchersContext) {
  const { connections: { graphql, redis }, user: { account, statement, vouchers: { active, held } } } = context
  const vouchers = new Set([...(held || []), active]);
  const voucherInfoPromises = Array.from(vouchers).map(async (voucher) => {
    const info = await getVoucherByAddress(voucher.address, graphql, redis.persistent)
    if(info){
      return {
        description: info.voucher_description,
        location: info.location_name,
        name: info.voucher_name,
        symbol: info.symbol
      }
    }
    return null
  })
  const results = await Promise.allSettled(voucherInfoPromises)
  const voucherInfo = await handleResults<VoucherInfo>(results)
  let heldVouchersInfo: { [key: string]: VoucherInfo } = {}
  voucherInfo.forEach(info => {
    heldVouchersInfo[info.symbol] = info
  })
  const heldVouchers = await formatVouchers(active, held, account.language, statement || []);
  return { heldVouchers, heldVouchersInfo }
}

async function loadVoucherInfo(context: VouchersContext) {
  const {
    connections: {
      graphql,
      redis
    },
    user: {
      vouchers: { active: { address } }
    }
  } = context;

  const voucher = await getVoucherByAddress(address, graphql, redis.persistent)

  if (!voucher) {
    throw new Error("Could not load voucher voucher.");
  }

  return {
    description: voucher.voucher_description,
    location: voucher.location_name,
    name: voucher.voucher_name,
    symbol: voucher.symbol,
  };
}

async function formatVouchers(active: CachedVoucher, held: CachedVoucher[], language: Locales, transactions: Transaction[]) {
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
  const sortedHeld = (held || []).slice().sort((a, b) => a.balance - b.balance);

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
  const activeVoucher = sortedHeld.find((v) => v.symbol === activeSymbol) || active;
  orderedHeld.push(activeVoucher);

  // add the rest of the vouchers
  const filteredHeld = sortedHeld
    .filter((v) => v.symbol !== lastCreditSymbol && v.symbol !== lastDebitSymbol && v.symbol !== activeSymbol);
  orderedHeld.push(...filteredHeld);

  // format the vouchers
  const formattedVouchers = orderedHeld
    .map((voucher, index) => `${index + 1}. ${voucher?.symbol} ${voucher?.balance.toFixed(2)}`);
  const placeholder = tHelpers("noMoreVouchers", language)
  return await menuPages(formattedVouchers, placeholder)
}

function isValidVoucherOption(context: VouchersContext, event: any) {
  const { heldVouchers } = context.data;
  const input = event.input.toLowerCase();

  // Use for loop instead of find to break early when a match is found
  for (const voucher of heldVouchers) {
    // Get the tokens from each voucher string
    const tokens = voucher.split("\n")

    // Check if the voucher can be split and do the split
    for (const token of tokens) {
      if (token.includes('. ')) {
        const [index, symbol] = token.split('. ');

        // Check if the index or symbol matches the input and return true if found
        if (index === input || (symbol.includes(" ") && symbol.split(" ")[0].toLowerCase() === input)) {
          return true;
        }
      }
    }
  }

  // Return false if no match is found
  return false;
}

async function setActiveVoucher(context: VouchersContext) {
  const {
    data,
    connections: {
      redis
    },
    user: {
      account: { phone_number },
      vouchers
    }
  } = context

  if (!data.selectedVoucher) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Selected voucher is missing from context.");
  }

  const voucher = vouchers.held.find(v => v.symbol === data.selectedVoucher?.toUpperCase())
  await new UserService(phone_number, redis.persistent).update({ vouchers: { active: voucher } })
}

function saveHeldVouchers(context: VouchersContext, event: any) {
  context.data.heldVouchers = event.data.heldVouchers;
  context.data.heldVouchersInfo = event.data.heldVouchersInfo;
  return context;
}

function saveVoucherInfo(context: VouchersContext, event: any) {
  context.data.voucherInformation = event.data;
  return context;
}

function saveVoucherSelection(context: VouchersContext, event: any) {
  const input = event.input.toLowerCase();

  if (!context.data.heldVouchers) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Held vouchers are missing from context data.");
  }

  let selectedVoucher = null;
  for (const voucher of context.data.heldVouchers) {

    const tokens = voucher.split("\n")

    for (const token of tokens) {
      if (token.includes('. ')) {
        const [index, symbol] = token.split('. ');
        if (index === input || (symbol.includes(" ") && symbol.split(" ")[0].toLowerCase() === input)) {
          selectedVoucher = token;
          break;
        }
      }
    }
  }

  if (selectedVoucher) {
    const [_, symbol] = selectedVoucher.split('. ');
    context.data.selectedVoucher = symbol.split(" ")[0]
  }

  return context;
}

function updateActiveVoucher(context: VouchersContext, event: any) {
  context.user.vouchers.active = event.data;
  return context
}

async function voucherTranslations(context: VouchersContext, state: string, translator: any) {
  const { data, user: { vouchers } } = context;

  switch (state) {
    case "firstVoucherSet":
      return await translate(state, translator, { vouchers: data.heldVouchers[0] });
    case "secondVoucherSet":
      return await translate(state, translator, { vouchers: data.heldVouchers[1] });
    case "thirdVoucherSet":
      return await translate(state, translator, { vouchers: data.heldVouchers[2] });
    case "enteringPin":
      const selectedVoucher = data.heldVouchersInfo[data.selectedVoucher];
      return await translate(state, translator, {
        description: selectedVoucher?.description,
        location: selectedVoucher?.location,
        name: selectedVoucher?.name,
        symbol: data.selectedVoucher
      })
    case "displayVoucherInfo":
      return await translate(state, translator, {
        description: data.voucherInformation?.description,
        location: data.voucherInformation?.location,
        name: data.voucherInformation?.name,
        symbol: vouchers.active.symbol
      });
    case "setSuccess":
      return await translate(state, translator, { symbol: data.selectedVoucher });
    case "mainMenu":
      return await translate(state, translator, { balance: vouchers.active.balance, symbol: vouchers.active.symbol });
    default:
      return await translate(state, translator);
  }
}

export const voucherMachine = {
  stateMachine,
  translate: voucherTranslations
}

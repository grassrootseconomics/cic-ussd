import {
  BaseContext,
  BaseEvent,
  isOption1,
  isOption2,
  isOption9,
  translate,
  updateErrorMessages
} from "@src/machines/utils";
import {createMachine, send} from "xstate";
import {retrieveWalletBalance} from "@lib/ussd/account";
import {Cache} from "@utils/redis";
import {Voucher} from "@lib/graph/voucher";
import {isBlocked, updateAttempts} from "@machines/auth";
import {succeeded} from "@machines/voucher";
import {MachineError} from "@lib/errors";
import bcrypt from "bcrypt";

export interface BalancesContext extends BaseContext {
  data: {
    communityBalance?: number;
  };
}

type BalancesEvent =
  BaseEvent

enum BalancesErrors {
  INVALID_PIN = "INVALID_PIN",
  UNAUTHORIZED = "UNAUTHORIZED",
  FETCH_ERROR = "FETCH_ERROR",
}

export const balancesMachine = createMachine<BalancesContext, BalancesEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCGAbVA7AxmAsqjgBYCWWYAdGprnPmFgK4DEAQgIIDCA0gNoAGALqJQABwD2sUgBdSErKJAAPRAGYAnAEZKAJi0AOAOwBWADQgAnogAsJm5Rs2NL1241qAvp4s1seQhJyKj86WAZmFgAVACUOADkAZQBJKMERJBBJaTkFJVUETR19Y3MrRBMTA0oANnd6jW9fDH8CIjIKahawiNZYhJS0rQzxKVl5RUyCor1DUwtrBF0TXT0TDQMNKrUdneWmkFCA9uDKVCYZYgkAJ1IAL3IoDhwcCSYsGTZuvAA1UjAAO7ROJJVLpJTZcZ5KaILRaGwCSgCIwGLTLBYVAQmJHrTbbXZqXQ1A5HNpBTrnS43e6PZ6vd6fb5gP6A4EDMHDCFjXKTUAFOEIpEotFlRY1LQ1SgNeokpmBDpUSlXW4PLBPF5vD5fWi-f5A-qgtK6EZZbkTfKw+GI5Go9HlQobSibQm6bQ1d0e2U6skKyjvJXUu6QOmaxnellAmIAUViAE1wZlITyLQh4Vpsa6aqUMQgTO7HNK3F7WvLTugJKgILSNQzta0WBAFFRyAA3CQAaxCcpOnXLler9K1TIQrYkOFQPPSCdGOXNMNTBnsjhK83tJgEakoBO3uyJxbopd7FarapDtaZLDA12uN0oYkwMgAZjcALZdb2Hqh9k-qwdh1ojlgbbjpOwjTqas7QnysKLg4NgrqK6gaEYTo7tue4+Ic3bkoqFzKjSapcBIL4vu8siWHWdARmyhrgUmc7QamVpCraiFLDUqyVBsWwGOhxKYaSn5nHhgaPERJFkTIFFMtRBqDHwnKJmaUEqJago2iKOZaGoOiFm4Nj7scOHCVSKpicRpFYORlG6qyclgsaXKQbyqlMepwp2osag2NUmgum6HruoZPqnP6IkqpA4mWdZMl6iw0ZxnRykufyNjpnoGhZquiyopQJjBUJ37mRJVlSTZYANk2lCjp274lj2X7HsV0VlcOo4gRMU7CE5UIpTBS7wXMbHptiaF8QVDWUEVhEWZJ0nepe163veE7Ptcb6CZN01QFFc3lYBwETp1YHdUpzkpoYA0ITmRKIrxY17PxmFYBIEBwEom04T1ybzgAtDUOb-RNxkvqg5C9N9DGue6qyDdm9o2DpjjOHpwO+qS4SMEwkMqQU8E5ojqx1HpHho6cAZmaeNZDuGeo431CA1EYKECJl8OLCYaiShoKOFmTnRhaZ9zBtT-5UXTZ29RdKzcwYiPZYgNQblurN4vdBL841-ZU3+5X09LVROhoAgcWxNj5moqs8eNAnYb6RC60yAAyx6QPr876AI1RbDpnmYjoXFqzbzQfpNDuhuVLuVgAYmD6Bu5LP2MZ73uc5p9qaJKWLcfiu78SH9XGRTBE7bNpXza0Ebu4xMPLkNN2W3lVu53s+W26HxmC-hQYQLt5flVXidQ-yMtSnLagK0xvnN+rj2a1NTUzSVMXetXrnpubtTinYs+7DduibgYM-B1hHe+q8y+td6UdvRAa8FCnUpp37qac3luLWwSGEFwek0Xy1Fc6A31jqQeOd8h640QI-H26dFjLA0DiHOu9v6n0LvbUWbByw4E7OAmcUt5zpiJGPeWbEuZ3WPl-J6nggA */
  id: "balances",
  initial: "balancesMenu",
  predictableActionArguments: true,
  states: {
    mainMenu: {
      type: "final",
      description: "User is returned to the main menu."
    },
    balancesMenu: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "enteringPinA", cond: "isOption1" },
          { target: "enteringPinC", cond: "isOption2" },
        ]
      },
      description: "User is prompted to select which balance to view."
    },
    enteringPinA: {
      on: {
        BACK: "balancesMenu",
        TRANSIT: [
          { target: "authorizingBalanceViewA", cond: "isNotBlocked" },
          { target: "accountBlocked" }
        ]
      }
    },
    authorizingBalanceViewA: {
      invoke: {
        id: "authorizingBalanceViewA",
        src: "fetchAccountBalance",
        onDone: { target: "loadedASuccess", cond: "succeeded" },
        onError: [
          { target: "invalidPinA", cond: "isInvalidPin" },
          { target: "loadAError", cond: "isFetchError" },
          { target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      tags: "invoked"
    },
    invalidPinA: {
      entry: send( { type: "RETRY", feedback: "invalidPin" } ),
      on: {
        RETRY: "enteringPinA"
      },
      description: "User is prompted to re-enter their PIN.",
      tags: "error"
    },

    enteringPinC: {
      on: {
        BACK: "balancesMenu",
        TRANSIT: [
          { target: "authorizingBalanceViewC", cond: "isNotBlocked" },
          { target: "accountBlocked" }
        ]
      }
    },
    authorizingBalanceViewC: {
      invoke: {
        id: "authorizingBalanceViewC",
        src: "fetchCommunityBalance",
        onDone: { target: "loadedCSuccess", cond: "succeeded" },
        onError: [
          { target: "invalidPinC", cond: "isInvalidPin" },
          { target: "loadCError", cond: "isFetchError" },
          { target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      tags: "invoked"
    },
    invalidPinC: {
      entry: send( { type: "RETRY", feedback: "invalidPin" } ),
      on: {
        RETRY: "enteringPinA"
      },
      description: "User is prompted to re-enter their PIN.",
      tags: "error"
    },

    // final states
    loadedASuccess: {
      on: {
        BACK: "balancesMenu",
        TRANSIT: { target: "exit", cond: "isOption9" }
      },
      description: "User is informed that their account balance has been loaded.",
      tags: "resolved"
    },
    loadedCSuccess: {
      on: {
        BACK: "balancesMenu",
        TRANSIT: { target: "exit", cond: "isOption9" }
      },
      description: "User is informed that their community balance has been loaded.",
      tags: "resolved"
    },
    loadAError: {
      type: "final",
      description: "An error occurred while loading the account balance.",
      tags: "error"
    },
    loadCError: {
      type: "final",
      description: "An error occurred while loading the community balance.",
      tags: "error"
    },
    accountBlocked: {
      type: "final",
      description: "User is informed that their account is blocked.",
      tags: "error"
    },
    exit: {
      type: "final",
      description: "User is returned to the main menu.",
    }
  }
}, {
  actions: {
    saveCommunityBalance,
    updateErrorMessages
  },
  guards: {
    isBlocked,
    isFetchError,
    isNotBlocked: (context: BalancesContext) => !isBlocked(context),
    isInvalidPin,
    isOption1,
    isOption2,
    isOption9,
    succeeded: (context: BalancesContext, event: any) => event.data.success
  },
  services: {
    fetchAccountBalance,
    fetchCommunityBalance,
  }
})

async function fetchAccountBalance(context: BalancesContext, event: any) {
  const { resources: { provider }, user: {  account: { address, password }, activeVoucher: { address: voucherAddress } } } = context;
  const { input } = event;

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(BalancesErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(BalancesErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  // retrieve balance.
  try {
    const balance = await retrieveWalletBalance(address, voucherAddress, provider);
    return { balance, success: true }
  } catch (error) {
    throw new MachineError(BalancesErrors.FETCH_ERROR, "PIN is incorrect.")
  }
}

async function fetchCommunityBalance(context: BalancesContext, event: any) {
  const { resources: { provider, p_redis }, user: { account: { password }, activeVoucher: { address: voucherAddress, symbol } } } = context;
  const { input } = event;

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(BalancesErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(BalancesErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  try {
    const cache = new Cache(p_redis, symbol);
    const voucher = await cache.getJSON() as Voucher;
    const balance = await retrieveWalletBalance(voucher.sink_address, voucherAddress, provider);
    return { balance, success: true }
  } catch (error) {
    throw new MachineError(BalancesErrors.FETCH_ERROR, "PIN is incorrect.")
  }
}

function saveCommunityBalance(context:BalancesContext, event: any) {
  context.data.communityBalance = event.data;
  return context;
}

function isFetchError(context: BalancesContext, event: any) {
  return event.data.code === BalancesErrors.FETCH_ERROR;
}

function isInvalidPin(context: BalancesContext, event: any) {
  return event.data.code === BalancesErrors.INVALID_PIN || event.data.code === BalancesErrors.UNAUTHORIZED
}

export async function balancesTranslations(context: BalancesContext, state: string, translator: any) {
  const { data, user: { activeVoucher: { balance, symbol } } } = context;
  switch (state) {
    case "mainMenu":
    case "loadedASuccess":
      return translate(state, translator, { balance, symbol });
    case "loadedCSuccess":
      return translate(state, translator, { balance: data.communityBalance, symbol });
    default:
      return translate(state, translator);
  }
}

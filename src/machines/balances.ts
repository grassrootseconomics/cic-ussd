import { BaseContext, BaseEvent } from "@src/machines/utils";
import { createMachine, send } from "xstate";
import { retrieveWalletBalance } from "@lib/ussd/account";
import { Cache } from "@utils/redis";
import { Voucher } from "@lib/graph/voucher";

export interface BalancesContext extends BaseContext {
  data: {
    communityBalance?: number;
  };
}

type BalancesEvent =
  BaseEvent

export const balancesMachine = createMachine<BalancesContext, BalancesEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QCMCGAbVA7AxmAsqjgBYCWWYAdGprnPmFgK4DEAQgIIDCA0gNoAGALqJQABwD2sUgBdSErKJAAPRAGYAnAEZKAJi0AOAOwBWADQgAnogAsJm5Rs2NL1241qAvp4s1seQhJyKj86WAZmFgAVACUOADkAZQBJKMERJBBJaTkFJVUETR19Y3MrRBMTA0oANnd6jW9fDH8CIjIKahawiNZYhJS0rQzxKVl5RUyCor1DUwtrBF0TXT0TDQMNKrUdneWmkFCA9uDKVCYZYgkAJ1IAL3IoDhwcCSYsGTZuvAA1UjAAO7ROJJVLpJTZcZ5KaILRaGwCSgCIwGLTLBYVAQmJHrTbbXZqXQ1A5HNpBTrnS43e6PZ6vd6fb5gP6A4EDMHDCFjXKTUAFOEIpEotFlRY1LQ1SgNeokpmBDpUSlXW4PLBPF5vD5fWi-f5A-qgtK6EZZbkTfKw+GI5Go9HlQobSibQm6bQ1d0e2U6skKyjvJXUu6QOmaxnellAmIAUViAE1wZlITyLQh4Vpsa6aqUMQgTO7HNK3F7WvLTugJKgILSNQzta0WBAFFRyAA3CQAaxCcpOnXLler9K1TIQrYkOFQPPSCdGOXNMNTBnsjhK83tJgEakoBO3uyJxbopd7FarapDtaZLDA12uN0oYkwMgAZjcALZdb2Hqh9k-qwdh1ojlgbbjpOwjTqas7QnysKLg4NgrqK6gaEYTo7tue4+Ic3bkoqFzKjSapcBIL4vu8siWHWdARmyhrgUmc7QamVpCraiFLDUqyVBsWwGOhxKYaSn5nHhgaPERJFkTIFFMtRBqDHwnKJmaUEqJago2iKOZaGoOiFm4Nj7scOHCVSKpicRpFYORlG6qyclgsaXKQbyqlMepwp2osag2NUmgum6HruoZPqnP6IkqpA4mWdZMl6iw0ZxnRykufyNjpnoGhZquiyopQJjBUJ37mRJVlSTZYANk2lCjp274lj2X7HsV0VlcOo4gRMU7CE5UIpTBS7wXMbHptiaF8QVDWUEVhEWZJ0nepe163veE7Ptcb6CZN01QFFc3lYBwETp1YHdUpzkpoYA0ITmRKIrxY17PxmFYBIEBwEom04T1ybzgAtDUOb-RNxkvqg5C9N9DGue6qyDdm9o2DpjjOHpwO+qS4SMEwkMqQU8E5ojqx1HpHho6cAZmaeNZDuGeo431CA1EYKECJl8OLCYaiShoKOFmTnRhaZ9zBtT-5UXTZ29RdKzcwYiPZYgNQblurN4vdBL841-ZU3+5X09LVROhoAgcWxNj5moqs8eNAnYb6RC60yAAyx6QPr876AI1RbDpnmYjoXFqzbzQfpNDuhuVLuVgAYmD6Bu5LP2MZ73uc5p9qaJKWLcfiu78SH9XGRTBE7bNpXza0Ebu4xMPLkNN2W3lVu53s+W26HxmC-hQYQLt5flVXidQ-yMtSnLagK0xvnN+rj2a1NTUzSVMXetXrnpubtTinYs+7DduibgYM-B1hHe+q8y+td6UdvRAa8FCnUpp37qac3luLWwSGEFwek0Xy1Fc6A31jqQeOd8h640QI-H26dFjLA0DiHOu9v6n0LvbUWbByw4E7OAmcUt5zpiJGPeWbEuZ3WPl-J6nggA */
  id: "balanceMachine",
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
          { target: "authorizingAccountBalanceView", cond: "isOption1" },
          { target: "authorizingCommunityBalanceView", cond: "isOption2" },
        ]
      },
      description: "User is prompted to select which balance to view."
    },
    authorizingAccountBalanceView: {
      on: {
        TRANSIT: [
          { target: "loadingAccountBalance", cond: "authorizedAccountBalanceView" },
          { target: "unauthorizedAccountBalanceView", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "User is prompted to enter their pin to view their account balance."
    },
    unauthorizedAccountBalanceView: {
      entry: send( { type: "RETRY", feedback: "unauthorizedAccountBalanceView" } ),
      on: {
        RETRY: "authorizingAccountBalanceView"
      }
    },
    loadingAccountBalance: {
      invoke: {
        src: "loadAccountBalance",
        onDone: { target: "accountBalanceLoaded", actions: "updateAccountBalance" },
        onError: { target: "accountBalanceLoadFailed", actions: "updateErrorMessages" }
      },
      description: "Loads account balance from contract."
    },
    accountBalanceLoaded: {
      type: "final",
      description: "Account balance was successfully loaded."
    },
    accountBalanceLoadFailed: {
      type: "final",
      description: "Account balance load failed."
    },
    authorizingCommunityBalanceView: {
      on: {
        TRANSIT: [
          { target: "loadingCommunityBalance", cond: "authorizedCommunityBalanceView" },
          { target: "unauthorizedCommunityBalanceView", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "User is prompted to enter their pin to view their community balance."
    },
    unauthorizedCommunityBalanceView: {
      entry: send( { type: "RETRY", feedback: "unauthorizedCommunityBalanceView" } ),
      on: {
        RETRY: "authorizingCommunityBalanceView"
      }
    },
    loadingCommunityBalance: {
      invoke: {
        src: "loadCommunityBalance",
        onDone: { target: "communityBalanceLoaded", actions: "updateCommunityBalance" },
        onError: { target: "communityBalanceLoadFailed", actions: "updateErrorMessages" }
      },
      description: "Loads community balance from contract."
    },
    communityBalanceLoaded: {
      type: "final",
      description: "Community balance was successfully loaded."
    },
    communityBalanceLoadFailed: {
      type: "final",
      description: "Community balance load failed."
    },
    accountBlocked: {
      type: "final",
      description: "Account is blocked."
    },
  }
})

async function loadAccountBalance(context: BalancesContext) {
  const { resources: { provider }, user: {  account: { address }, activeVoucher: { address: voucherAddress } } } = context;
  return await retrieveWalletBalance(address, voucherAddress, provider);
}

async function loadCommunityBalance(context: BalancesContext) {
  const { resources: { provider, redis }, user: { activeVoucher: { address: voucherAddress, symbol } } } = context;
  const cache = new Cache(redis, symbol);
  const voucher = await cache.getJSON() as Voucher;
  return await retrieveWalletBalance(voucher.sink_address, voucherAddress, provider);
}

function updateAccountBalance(context: BalancesContext, event: any) {
  const { user: { activeVoucher } } = context;
  activeVoucher.balance = event.data;
  return context;
}

function updateCommunityBalance(context: BalancesContext, event: any) {
  return context.data.communityBalance = event.data;
}
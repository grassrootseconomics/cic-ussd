import {
  isOption1,
  isOption2,
  isOption9,
  isSuccess,
  MachineEvent,
  MachineId,
  MachineInterface,
  updateErrorMessages,
  UserContext
} from '@machines/utils';
import { createMachine, send } from 'xstate';
import { isBlocked, validatePin } from '@machines/auth';
import { MachineError, SystemError } from '@lib/errors';
import { getSinkAddress, retrieveWalletBalance } from '@lib/ussd';
import { translate } from '@i18n/translators';


enum BalancesError {
  FETCH_ERROR = "FETCH_ERROR",
  LOAD_ERROR = "LOAD_ERROR",
}

export interface BalancesContext extends UserContext {
  data: {
    communityBalance: number,
  }
}

export const stateMachine = createMachine<BalancesContext, MachineEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOnQFcAXbAewCdcAvAqAIXQBt19MwA1XGADuAQQDEEGoRIEAbjQDWYMlVoNm+Np268BwkQG0ADAF1EoAA41YuSrinmQAD0QAWAOwBGEp4BMrgE53dyMAZl9fIPcAVgAaEABPRHcANl8SfwCAzxSAoyMU0PcAX2L4tCw8QlIKanomFnYuHn5BUTEwOjp6EgsuSgAzelQVOvVG7Ra9UWMzJBArGzsHeZcED28-QOCwiKi4xMRPV1dvLKyU0+j3V1yADlLyjBwCYlG1Bs0mnVb9Dq6en10INhu96hotM1dG1DJ45pZrLZ7PhHGsNj5MjtwpFggckgg7ikUiRAgE7q5fClPHd3GSSmUQBUXtUweMvpNoX9Ot06L1+kM6CNah8Id8pjCDL54QtEcsUas3F4MdsQtj9vF8Z5PO47iTzkYdXcaXdor5HoznlU3sLwRMob8hABhCRSZRyRTKG1syE-aaO2aORZIlagNFKrZRXY4mIaxApaIBDLRfKeUIm7UU81Mq01VS29n2v3-Hl84ECoV571izlOgPzINy1GKzaY1V7XGxgneZP5Iw5W7+A0BLOW165safH3i4TO7mA-mgr2T6sO-1wwOy5FN9bh1tR9WHBDRY8kXv5AIJ1x3UKmkeVMes5cc1fF+dlxeVp+Ftr+qUbpZbgqO4tiq+4doeFKuKevYRISN4BFcd7Mm8ABGz6wAAsmA+DkGIrAiI6ADSdYIgBIbOEc5K6q4BRGKangIXcZK+J2fhBCQNxZEYQS3GSoSeEhOYkGh9qYdhuEACoAEoiAAcgAygAkhJJEymR8qhpRV4krR9GMcxnZ3H4p7XqEQ40seNyCQ+Ik-GJOFiNJclKSp671pu5FrNS2k0SkdG+AxV4GYeZneDEKapIEoSnNZLLYZQnQsAACgQ4j4URqkNoBmkIL4fbRKeAQ3q4xV+f4LGHoS6TRKZnjJn5+QmrFbzxYlmgpfg4hOQpymZR5GkUblrjRGcpo0nxRR3P4nbDUYPhEiEOoIaEVIpM1pCtQw7WpY5Mk9a50pZZ5lHBCQRQeEVgQ5FNoSsfk7gcYETEre44Rma460kJtyUEM66XEaY-7BgNax5XVhXFaVRjlZ2vgjUmKZ0akRpktEn3fdt+DOt1Ll9ep27+PDF6+ONpk6tNh4ROk4V9iaK1hMmH0MtmD4Y1AHXY3tuNuaRwPbtSp3nbS0XZCkN2w-kHE9gzRgnGm7hmszo4sgMYCUDg8nkJgvCwLAeEEQDh39fzoQISQAQBTE2y5NxKSdrSD2nES-GRMx8afar6vYJr2twHrOO9YD7n40BqZmxb2rRNbeQBHbh6XKE5s5ESRoMfxYufXInC4BAHXiFJACi0kAJp43zoem1BEdW0ENux6x2rEuceRpJ4BrXPSTz3iyWccDnHNiIXJdl42Ffh5bUe1zHcf4hS1UwVqJrRESUefRwNDoBAPs63r-0j9lg1h1XE-R7bhkeEnzvXgrvjBGtSvd286+b9vfu7c5gdGyHOVH+bJ9T2fQ8Nwm7J3KrfIo0RQilAZPgGgEA4COBZtUIGo8coAFoZ6IAwZ9LAmAaDkHwJQVg69MBKAgCgg+oMvBzQjgmPIdVY5TXPj4UkZItQW1lgUHBn5RTPmmCIChx0EB+QxMmY4k80xpgqviC8iZWF+FSDcOiw4H7IXHCKO0vofyCJBm4aRiAihhWlm3NuK0EKfVsi0ey5AdH8ypFBSIKQQjxhFhse2eQzqhHCEZW4yjobo0IW1dmqVbFAQCoEEgflsiQJCCYmMEESYkmTkZF6lc0aqKEmzDmoScrhMTFEuqRQ+x9nifiPKNDm7lJbg7dGThbA5MPvYjIsdnGQMCG4+OK1oL5FgkVAolwPZqxwAXAEdAGlrCYukCOdxoZ5GvCcdwnZIFzWlkUOGRUGICQyQ+T2GstY73GUcXYZ0ZlbFSLkCknhOyFAKs3E0lwnEeEVl3NRMh8CyGzrnEJwdy45UmX-aksyjDzI8A3RJpImIK24sNe+LyhK937r9Q5BILYApmZEYF0VQUhRuN0vsAVySUhGmvDeEARk8mRf86ZQKQWLMqqcc2WRaQZmGmsklL99l+2RW3bSlw6LJljseEqt0gGmzxcNYI-FwidwtI-UgsA1Z2E0NY5FeTIncUKbEkpeIji3ygpxQk-KDTtOgcUIAA */
  id: MachineId.BALANCES,
  initial: "balancesMenu",
  predictableActionArguments: true,
  states: {
    accountBlocked: {
      description: 'Account is blocked.',
      tags: 'error',
      type: 'final'
    },
    authorizingBalanceViewA: {
      description: 'Invoked service that authorizes viewing account balance.',
      invoke: {
        id: 'authorizingBalanceViewA',
        src: 'loadAccountBalance',
        onDone: { target: 'loadSuccess', cond: 'isSuccess' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'loadError', cond: 'isLoadError', actions: 'updateErrorMessages' },
          { target: 'invalidPinA' }
        ]
      },
      tags: 'invoked'
    },
    authorizingBalanceViewC: {
      description: 'Invoked service that authorizes viewing community balance.',
      invoke: {
        id: 'authorizingBalanceViewC',
        src: 'fetchCommunityBalance',
        onDone: { target: 'fetchSuccess', cond: 'isSuccess', actions: 'saveCommunityBalance' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'fetchError', cond: 'isFetchError', actions: 'updateErrorMessages' },
          { target: 'invalidPinC' }
        ]
      },
      tags: 'invoked'
    },
    balancesMenu: {
      description: 'Displays the balances menu.',
      on: {
        BACK: 'settingsMenu',
        TRANSIT: [
          { target: 'enteringPinA', cond: 'isOption1' },
          { target: 'enteringPinC', cond: 'isOption2' }
        ]
      }
    },
    enteringPinA: {
      description: 'Expects valid PIN matching account\'s PIN.',
      on: {
        BACK: 'balancesMenu',
        TRANSIT: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'authorizingBalanceViewA' }
        ]
      },
      tags: ['encryptInput', 'error']
    },
    enteringPinC: {
      description: 'Expects valid PIN matching account\'s PIN.',
      on: {
        BACK: 'balancesMenu',
        TRANSIT: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'authorizingBalanceViewC' }
        ]
      },
      tags: ['encryptInput', 'error']
    },
    exit: {
      description: 'Terminates USSD session.',
      type: 'final'
    },
    fetchError: {
      description: 'An error occurred while fetching the community balance.',
      tags: 'error',
      type: 'final'
    },
    fetchSuccess: {
      description: 'Community balance has been fetched.',
      on: {
        BACK: 'balancesMenu',
        TRANSIT: { target: 'exit', cond: 'isOption9' }
      },
      tags: 'resolved'
    },
    invalidPinA: {
      description: 'Entered PIN is invalid. Raises a RETRY event to prompt user to retry pin entry.',
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPinA'
      }
    },
    invalidPinC: {
      description: 'Entered PIN is invalid. Raises a RETRY event to prompt user to retry pin entry.',
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPinA'
      }
    },
    loadError: {
      description: 'An error occurred while loading the account balance.',
      tags: 'error',
      type: 'final'
    },
    loadSuccess: {
      description: 'Account balance has been loaded.',
      on: {
        BACK: 'balancesMenu',
        TRANSIT: { target: 'exit', cond: 'isOption9' }
      },
      tags: 'resolved'
    },
    settingsMenu: {
      description: 'Transitions to the settings menu.',
      type: 'final'
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
    isLoadError,
    isOption1,
    isOption2,
    isOption9,
    isSuccess,
  },
  services: {
    loadAccountBalance,
    fetchCommunityBalance,
  }
})

async function loadAccountBalance(context: BalancesContext, event: any) {
  const { user: { vouchers: { active: { balance } } } } = context;
  const { input } = event;

  // validate pin.
  await validatePin(context, input)

  // load balance from context object.
  try {
    return { balance, success: true }
  } catch (error) {
    throw new MachineError(BalancesError.LOAD_ERROR, "Failed to load account balance.")
  }
}

async function fetchCommunityBalance(context: BalancesContext, event: any) {
  const {  connections: { graphql, provider, redis }, user: { vouchers: { active: { address: contractAddress } } } } = context;
  const { input } = event;

  await validatePin(context, input)

  const sinkAddress = await getSinkAddress(contractAddress, graphql, redis.persistent)

  if(!sinkAddress) throw new SystemError(`Failed to fetch sink address for contract ${contractAddress}.`)

  try {
    const balance = await retrieveWalletBalance(sinkAddress, contractAddress, provider);
    return { balance, success: true }
  } catch (error) {
    throw new MachineError(BalancesError.FETCH_ERROR, "Failed to fetch community balance.")
  }
}

function saveCommunityBalance(context: BalancesContext, event: any) {
  context.data.communityBalance = event.data.balance;
  return context;
}

function isFetchError(_: any, event: any) {
  return event.data.code === BalancesError.FETCH_ERROR;
}

function isLoadError(_: any, event: any) {
  return event.data.code === BalancesError.LOAD_ERROR;
}

async function balancesTranslations(context: BalancesContext, state: string, translator: any) {
  const { data, user: { vouchers: { active: { balance, symbol } } } } = context;
  switch (state) {
    case "loadSuccess":
      return await translate(state, translator, { balance, symbol });
    case "fetchSuccess":
      return await translate(state, translator, { balance: data.communityBalance, symbol });
    default:
      return await translate(state, translator);
  }
}

export const balancesMachine: MachineInterface = {
  stateMachine,
  translate: balancesTranslations
}

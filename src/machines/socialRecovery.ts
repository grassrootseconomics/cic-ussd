import { createMachine, send } from 'xstate';
import {
  isOption00,
  isOption1,
  isOption11,
  isOption2,
  isOption22,
  isOption3,
  isOption9,
  isSuccess,
  isValidPhoneNumber,
  MachineEvent,
  MachineId,
  MachineInterface,
  updateErrorMessages,
  UserContext,
  validateTargetUser
} from '@machines/utils';
import { isBlocked, isValidPin, validatePin } from '@machines/auth';
import { ContextError, MachineError, SystemError } from '@lib/errors';
import { tHelpers, translate } from '@i18n/translators';
import { Redis as RedisClient } from 'ioredis';
import { Locales } from '@i18n/i18n-types';
import { getUserTag } from '@services/user';
import { AccountService } from '@services/account';
import { menuPages } from '@lib/ussd';


enum SocialRecoveryError {
  ALREADY_ADDED = "ALREADY_ADDED",
  GUARDIAN_ADDITION_ERROR = "GUARDIAN_ADDITION_ERROR",
  GUARDIAN_REMOVAL_ERROR = "GUARDIAN_REMOVAL_ERROR",
  LOAD_ERROR = "LOAD_ERROR",
  NOT_ADDED = "NOT_ADDED",
}

export interface SocialRecoveryContext extends UserContext {
  data: {
    guardianToAddEntry: string,
    guardianToRemoveEntry: string,
    loadedGuardians: string[],
    validGuardianToAdd: string,
    validGuardianToRemove?: string,
  }
}


export const stateMachine = createMachine<SocialRecoveryContext, MachineEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOnQFcAXbAewCdcAvAqAcXPTol3XwEEI3Srhr4AxBFFgSBAG40A1tIrV6TFu07deAoSPwBtAAwBdRKAAONWLmGjzIAB6IALAE4AzCSM+jAJiMANgCAwIAOFwAaEABPRABGIxc-EjcwzzSwvwj4j0CAX3zotCw8QlIVWgZmfDYOLh5+QVt9MTA6OnoSCwAbdEoAM3pUMioq9VrNBp1mu0NTBysbOYdnBHcvX38gkKCI6LiEeICAdhI-eIBWNKNLv0vAtIKikBKcAmJR1WqNeu0mvSiNodLq9fpDOgjSpqGp1LSNXQtUQGeJmJAgJZI-CrVyeby+UK7cJRWIJDwnS4kE4eDKJS7uQJGMKFYoYd7lL7jWFTf6IubAzp0bp9QbDTkw37wmaAwx+NGWaxYnHrPFbQnbYkHBLhM7UtwuLIuW7pQKXFmvNllT7Qn6TP6NABKYFQNFk6B6EikMnw8iU4ttcOm+CdLrdPWM8oxipW6LWfhciRINNuJ1T8ROfguJy1CA8Hhc3jyeaNHni6UzLnNbytFTGErtUuDztd7oFoJFEKhdYDPMdzbDEcW0f0yvjieTl1TJ3TmfTOcSYTObkCjPTl3puVuVctH1r3wmgf+IZbHvaguF4LFNoPvd4x4HqKHyxHscQY6MSbcKbTGazObH3hhB4fh5vq-ggYElYvNWu7+je9p3v2rZnu2l6QnB3IIU2obugYcpPkqr4IO+n7ftOv5zqSRzAfiPjxFc06BPETFQaypSwdesIAGq4GAADut74LAnqEN6vrKN2B48fxgmwIO6KYjGoBrBstEakS+xUQE64kGE1zMamWSlqa27sRynEsNJAlYcJKFCmCoroRZtRWbJ8kKs+9hEapao7BqmmHMc9JUlcX6QeEQHuKZ7LWpJ3G8dZja2SC9kdlecWWQlbmPgpw5ecpuKbASfmhAFb7MR+iRuBVwThCB0U1hhmUyTZbapWhXb7vFLVJXhkaKS+BUqkVPjqqVJKHH4wRhCQVUBEYuSeGWZrQTuHJgPglDtJKQYACo0PeYBiAAQnwADCADS7lRp52JEX4JyQSQBouAaIEeEYH2BPOn1nC4K6fek9HAYEJwNbBG1bQwDZ7Qd-ZHbtDp8AAcgAygAkrt10DflThvicRokIy+r6h4RmXPEE2IBmBYgfqLgE8EZN+OD62bdttTIz1QYnedV0LLlt2jo9BYvW9eafUE84Gmc9JuFNJxuNObiXMyq1mZ8kMc1AXOJTziMoxjWMCx5hFDQ9hPE+4LjMx4FNU0ci5nBcLHxG48vHG4rOa+z0NQAACgQfCsLzl3Y3ld3mwmH4TlOM5-lR6b0c9K70aajzvWD6sxaQWt+4H-AhwbaOY+HQtEWulIPCBBMJgEbvzpcNIhdcYSgwEealt7ue+ywBcOiHp1hybN1m3jRwM2cE5ky41z-Q9OaMl4Br6qrlNGDcHjdyQed9wQA9iMXRtl2PayU6mpFNxEc-BNmVH5vERPTYu67kiBK1sTnO+97UBdcYPfMT5KXHg9J6YsjIfS+v+ZIbgSCqyYgEBMj0VxZ0-o1Xev8CD-0PkjEuxt+oR1HKaSq04gKlgpKDKWWkDQfiZIye4wQrgmWzo1KAWE+T6FRuQTAmA4DCSHvzAh5chrnynl+K+s99S32lmTFuYQsjrkeKFbebDGwcNEFwnhfCcGG1LiPHGkdx6iMvjPG+C8qLrhSGkfUit3BhHTMwtBsFVFBnvO6TRvDYD8MAfowh90RbPQiOLSBVDDjJECKkdIDMmQ2wWnmD+FoNakBcUeJCPQPHaKPnooRp9EB5mnGpfMdiLhuBzAmR+K9Xr2PXCcW4W8WGwTkO6XAEAC7BzEA6AAoojAAmkAwaRjJ4mOvlI8xgVakzWXExZiDx5b5m3k0noLT+4hy6b0-puM4wUinscG28j5F+CmTmexz13bu2CBvO2Ss1ZOI5Is5ZWDVndIdH03xwijFKwLBOScG9alXH-JBWB8TIofSmg8beFgCCyQADI0HQBASAodBEEWAWfIZ08RnzzvoFFe5xQr5kCGTYIs8IVQpsrC+FiKsn4JRQMtFF8MWSKxf+DeH5qrVQuPGYkD1t6wBoJgHgPQnSYFdO0GIABZDa5AkUbMMXGaOl844UWxWSNucD3DMTJkyekRhUGJK-nygV7phWiroBKqVOi8GytHAq2OP5ZwqonuSbw7gLiqy-PGTwvL+WCpNbIMVkr8DSupSiHJqK3y2vEUqh1OYnipFNE8LIy4yz1NuZ8Q1vqwAiv9WawNwbcHH3woLXJxFI1kXjpRSa5JYHao9rPexMtt5hhaf0Ha-x9q6BEtIOQihpDNogK2mG7aaC6GtRXdF4jTGjMdWuWB-16HpmpLkbITbmkDuEEOxoHbBBtQvI5EY-bB2Hi3SOwQY6RETrqZi6Rid3ZLgBqvMCJw26rqWeuttJ7DpdrEr2kgh6N3Ht4PtQ657x4+WKhc8aOZVZWKiZcJIrc7gswaRyf9H6gNw1DEdOye7Ox-rXUewSwH4agZUqqCDGkHZBMiaTUGQFn1QRePgGgCL4DohguUWlmzEAAFpvpUR45SM5wmRP0e3lgEV5BNrHR6PypQEAuNyrfIuGtvgrhtyCCg+cZYUjTlbm7FWIF0ziYypu6UY8DHKmSPOFi6r6Y-OAsxVi+rGrOUA9hE8inlRuwJpfH5SsFqXH-HiOuel5YXGvvMlDsUurNT1v8Njptw3rD8P+dcBZ2WaptiuGe28MHueI1hrz90VNqXU4yFcoNjmvRTtccLQQ6vOY4z7KGLBdaCWK+bUrWxyuaaq4ncIsDGK-SyIuY4eWf4ByDqwTrID-BVwetkexZYjT8cCoNkKS9n3ZGnMhtNPdWuYODDN4tyX6IUl0j4aci0vzVTCNB64VIaSz0sc+q+E3DtTfwP-WbcZutqfgX1x18YKaFmmeEBNoQ8uOFsL9vJ1wY6M38ISg0jxoOHJo9E1uG94gqPYbMfQnSUpw4QCrGO4i3ZZDdokB2uRqTxrnjtzwuq9XNeSfjmUGSvEk-opTOB8jiw0nloS1LickgpH+tcek9xjiHLx42NxPQieChJ0zsrgPKvA+bh9a5k5II-OpPL1xaSueJdHslw5jJUjJAJh9BjekcxkyG895IekjQC6a2tT49zWnTZJ2Ty+lOSk05s1b+dC1QH0UXJ7pJYk10rNV-9uiGutNUSyLpRIzEIj+DJm3VNLnGk+nj48nnl6JFmOB4yD8QFrjbffpTfPbOSCyfhcr+g-v4OB7SMHpI-51NJjtrt2eacVakvwDCuFCKFOnbpQkeiNamEgXuDA+7WlbiUniYrFcr1fpj-FbwdAMBUCQzzYnxW6uNOa-nEWOzVx3AxMsd6o1Qqs2mvNUG1XiQPyPXS3pMIOwVZpY7gqR3Z7hMxMw9IghX0W0AMiNT1p8ktZ8jgkhH4Jx0wgJ5Z1xV9JopovAa9ttO4kgvVotSA0MzN8BCtRUSdrMqJts5EhdztHgVpCggA */
  id: MachineId.SOCIAL_RECOVERY,
  initial: "socialRecoveryMenu",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    accountBlocked: {
      description: 'Account is blocked.',
      tags: 'error',
      type: 'final'
    },
    authorizingGuardianAddition: {
      description: 'Invoked service that adds a guardian.',
      invoke: {
        id: 'authorizingGuardianAddition',
        src: 'initiateGuardianAddition',
        onDone: { target: 'guardianAdditionSuccess', cond: 'isSuccess' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'guardianAdditionError', cond: 'isAdditionError', actions: 'updateErrorMessages' },
          { target: 'invalidPinAG', actions: 'updateErrorMessages' }
        ]
      },
      tags: 'invoked'
    },
    authorizingGuardianRemoval: {
      description: 'Invoked service that removes a guardian.',
      invoke: {
        id: 'authorizingGuardianRemoval',
        src: 'initiateGuardianRemoval',
        onDone: { target: 'guardianRemovalSuccess', cond: 'isSuccess' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'guardianRemovalError', cond: 'isRemovalError', actions: 'updateErrorMessages' },
          { target: 'invalidPinRG', actions: 'updateErrorMessages' }
        ]
      },
      tags: 'invoked'
    },
    authorizingViewGuardians: {
      description: 'Invoked service that loads the guardians.',
      invoke: {
        id: 'authorizingViewGuardians',
        src: 'loadPinGuardians',
        onDone: { target: 'firstGuardiansSet', cond: 'isSuccess', actions: 'saveLoadedGuardians' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'loadError', cond: 'isLoadError', actions: 'updateErrorMessages' },
          { target: 'invalidPinVG', actions: 'updateErrorMessages' }
        ]
      },
      tags: 'invoked'
    },
    enteringGuardianToRemove: {
      description: 'Expects valid guardian entry.',
      on: {
        BACK: 'socialRecoveryMenu',
        TRANSIT: [
          { target: 'validatingGuardianToRemove', actions: 'saveGuardianToRemoveEntry' }
        ]
      },
      tags: 'error'
    },
    enteringNewGuardian: {
      description: 'Expects valid guardian entry.',
      on: {
        BACK: 'socialRecoveryMenu',
        TRANSIT: [
          { target: 'validatingGuardianToAdd', actions: 'saveGuardianToAddEntry' }
        ]
      },
      tags: 'error'
    },
    enteringPinAG: {
      description: 'Expects valid pin entry.',
      on: {
        BACK: 'enteringNewGuardian',
        TRANSIT: [
          { target: 'authorizingGuardianAddition', cond: 'isValidPin' }
        ]
      },
      tags: ['encryptInput', 'error']
    },
    enteringPinRG: {
      description: 'Expects valid pin entry.',
      on: {
        BACK: 'enteringGuardianToRemove',
        TRANSIT: [
          { target: 'authorizingGuardianRemoval', cond: 'isValidPin' }
        ]
      },
      tags: ['encryptInput', 'error']
    },
    enteringPinVG: {
      description: 'Expects valid pin entry.',
      on: {
        BACK: 'socialRecoveryMenu',
        TRANSIT: [
          { target: 'authorizingViewGuardians', cond: 'isValidPin' }
        ]
      },
      tags: ['encryptInput', 'error']
    },
    exit: {
      description: 'Terminates USSD session.',
      type: 'final'
    },
    firstGuardiansSet: {
      description: 'Displays guardians in first guardian set.',
      on: {
        BACK: 'socialRecoveryMenu',
        TRANSIT: [
          { target: 'secondGuardiansSet', cond: 'isOption11' },
          { target: 'exit', cond: 'isOption00' }
        ]
      },
      tags: 'resolved'
    },
    guardianAdditionError: {
      description: 'Guardian addition failed.',
      tags: 'error',
      type: 'final'
    },
    guardianAdditionSuccess: {
      description: 'Guardian addition successful.',
      on: {
        BACK: 'socialRecoveryMenu',
        TRANSIT: [
          { target: 'exit', cond: 'isOption9' }
        ]
      },
      tags: 'resolved'
    },
    guardianRemovalError: {
      description: 'Guardian removal failed.',
      tags: 'error',
      type: 'final'
    },
    guardianRemovalSuccess: {
      description: 'Guardian removal successful.',
      on: {
        BACK: 'socialRecoveryMenu',
        TRANSIT: [
          { target: 'exit', cond: 'isOption9' }
        ]
      },
      tags: 'resolved'
    },
    invalidPinAG: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPinAG'
      }
    },
    invalidPinRG: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPinRG'
      }
    },
    invalidPinVG: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPinVG'
      }
    },
    loadError: {
      description: 'Guardian loading failed.',
      tags: 'error',
      type: 'final'
    },
    pinManagementMenu: {
      description: 'Displays PIN management menu.',
      type: 'final'
    },
    secondGuardiansSet: {
      description: 'Displays guardians in second guardian set.',
      on: {
        TRANSIT: [
          { target: 'thirdGuardiansSet', cond: 'isOption11' },
          { target: 'firstGuardiansSet', cond: 'isOption22' },
          { target: 'exit', cond: 'isOption00' }
        ]
      }
    },
    socialRecoveryMenu: {
      description: 'Displays social recovery menu.',
      on: {
        BACK: 'pinManagementMenu',
        TRANSIT: [
          { target: 'enteringNewGuardian', cond: 'isOption1' },
          { target: 'enteringGuardianToRemove', cond: 'isOption2' },
          { target: 'enteringPinVG', cond: 'isOption3' }
        ]
      }
    },
    thirdGuardiansSet: {
      description: 'Displays guardians in third  guardian set.',
      on: {
        TRANSIT: [
          { target: 'secondGuardiansSet', cond: 'isOption22' },
          { target: 'exit', cond: 'isOption00' }
        ]
      }
    },
    validatingGuardianToAdd: {
      description: 'Invoked service that validates the guardian to add.',
      invoke: {
        id: 'validatingGuardianToAdd',
        src: 'validateGuardianToAdd',
        onDone: { target: 'enteringPinAG', cond: 'isSuccess', actions: 'saveValidatedGuardianToAdd' },
        onError: { target: 'enteringNewGuardian', actions: 'updateErrorMessages' }
      },
      tags: 'invoked'
    },
    validatingGuardianToRemove: {
      description: 'Invoked service that validates the guardian to remove.',
      invoke: {
        id: 'validatingGuardianToRemove',
        src: 'validateGuardianToRemove',
        onDone: { target: 'enteringPinRG', cond: 'isSuccess', actions: 'saveValidatedGuardianToRemove' },
        onError: { target: 'enteringGuardianToRemove', actions: 'updateErrorMessages' }
      },
      tags: 'invoked'
    }
  }
}, {
  actions: {
    saveLoadedGuardians,
    saveValidatedGuardianToAdd,
    saveValidatedGuardianToRemove,
    saveGuardianToAddEntry,
    saveGuardianToRemoveEntry,
    updateErrorMessages
  },
  guards: {
    isAdditionError,
    isBlocked,
    isLoadError,
    isOption1,
    isOption2,
    isOption3,
    isOption9,
    isOption00,
    isOption11,
    isOption22,
    isRemovalError,
    isSuccess,
    isValidPhoneNumber,
    isValidPin
  },
  services: {
    initiateGuardianAddition,
    initiateGuardianRemoval,
    loadPinGuardians,
    validateGuardianToAdd,
    validateGuardianToRemove
  }
})

function isLoadError(context: SocialRecoveryContext, event: any) {
  return event.data.code === SocialRecoveryError.LOAD_ERROR;
}

function isAdditionError(context: SocialRecoveryContext, event: any) {
  return event.data.code === SocialRecoveryError.GUARDIAN_ADDITION_ERROR;
}

function isRemovalError(context: SocialRecoveryContext, event: any) {
  return event.data.code === SocialRecoveryError.GUARDIAN_REMOVAL_ERROR;
}

function saveValidatedGuardianToAdd(context: SocialRecoveryContext, event: any) {
  context.data.validGuardianToAdd = event.data.guardian;
  return context;
}

function saveValidatedGuardianToRemove(context: SocialRecoveryContext, event: any) {
  context.data.validGuardianToRemove = event.data.guardian;
  return context;
}

function saveLoadedGuardians(context: SocialRecoveryContext, event: any) {
  context.data.loadedGuardians = event.data.guardians;
  return context;
}

function saveGuardianToAddEntry(context: SocialRecoveryContext, event: any) {
  context.data.guardianToAddEntry = event.input;
  return context;
}

function saveGuardianToRemoveEntry(context: SocialRecoveryContext, event: any) {
  context.data.guardianToRemoveEntry = event.input;
  return context;
}

async function initiateGuardianAddition(context: SocialRecoveryContext, event: any) {
  const {
    data,
    connections: { db, redis },
    user: { account: { phone_number } } } = context
  const { input } = event

  await validatePin(context, input)

  if(!data.validGuardianToAdd) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Guardian to add missing from context.")
  }

  try {
    await new AccountService(db, redis.persistent).addGuardian(data.validGuardianToAdd, phone_number)
    return { success: true }
  } catch (error: any) {
    throw new MachineError(SocialRecoveryError.GUARDIAN_ADDITION_ERROR, error.message)
  }
}

async function initiateGuardianRemoval(context: SocialRecoveryContext, event: any) {
  const {
    data,
    connections: { db, redis },
    user: { account: { phone_number } } } = context
  const { input } = event

  await validatePin(context, input)

  if(!data.validGuardianToRemove) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Guardian to remove missing from context.")
  }

  try {
    await new AccountService(db, redis.persistent).removeGuardian(data.validGuardianToRemove, phone_number)
    return { success: true }
  } catch (error: any) {
    throw new MachineError(SocialRecoveryError.GUARDIAN_REMOVAL_ERROR, error.message)
  }
}

async function loadPinGuardians(context: SocialRecoveryContext, event: any) {
  const { connections: { db, redis }, user: { account: { language, phone_number } } } = context
  const { input } = event

  await validatePin(context, input)

  try {
    const guardians = await new AccountService(db, redis.persistent).getAllGuardians(phone_number) || []
    const formattedGuardians = await formatGuardians(guardians, language, redis.persistent)
    return { guardians: formattedGuardians, success: true }
  } catch (error: any) {
    throw new MachineError(SocialRecoveryError.LOAD_ERROR, error.message)
  }

}

async function formatGuardians(guardians: string[], language: Locales, redis: RedisClient) {
  const placeholder = tHelpers("noMoreGuardians", language)
  const formattedGuardians = []
  for (const guardian of guardians) {
    const tag = await getUserTag(guardian, redis)
    formattedGuardians.push(tag)
  }
  return await menuPages(formattedGuardians, placeholder)
}

async function validateGuardianToAdd(context: SocialRecoveryContext, event: any) {
  const guardians = context.user.account.guardians || [];
  const guardian = await validateTargetUser(context, event.input)

  if(!guardian?.account?.phone_number) {
    throw new SystemError("Guardian phone number missing.")
  }

  if (guardians.includes(guardian.account.phone_number)) {
    throw new MachineError(SocialRecoveryError.ALREADY_ADDED, "Already a guardian.")
  }
  return { guardian: guardian.account.phone_number, success: true }
}

async function validateGuardianToRemove(context: SocialRecoveryContext, event: any) {
  const guardians = context.user.account.guardians || [];
  const guardian = await validateTargetUser(context, event.input)

  if(!guardian?.account?.phone_number) {
    throw new SystemError("Guardian phone number missing.")
  }
  if (!guardians.includes(guardian.account.phone_number)) {
    throw new MachineError(SocialRecoveryError.NOT_ADDED, "Not a guardian.")
  }
  return { guardian: guardian.account.phone_number, success: true }
}

async function socialRecoveryTranslations(context: SocialRecoveryContext, state: string, translator: any){
  const { data} = context

  switch (state) {
    case 'guardianAdditionSuccess':
    case 'guardianAdditionError': {
      return await translate(state, translator, { guardian: data.validGuardianToAdd });
    }

    case 'guardianRemovalSuccess':
    case 'guardianRemovalError': {
      return await translate(state, translator, { guardian: data.validGuardianToRemove });
    }

    case "firstGuardiansSet": {
      return await translate(state, translator, { guardians: data.loadedGuardians[0] });
    }
    case "secondGuardiansSet": {
      return await translate(state, translator, { guardians: data.loadedGuardians[1] });
    }
    case "thirdGuardiansSet": {
      return await translate(state, translator, { guardians: data.loadedGuardians[2] });
    }
    default:
      return await translate(state, translator)
  }
}

export const socialRecoveryMachine: MachineInterface = {
  stateMachine,
  translate: socialRecoveryTranslations
}
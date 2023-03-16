import {createMachine, send} from "xstate";
import {BaseContext, BaseEvent, isOption1, isOption2, isOption3, isOption9, menuPages} from "@machines/utils";
import {sanitizePhoneNumber} from "@utils/phoneNumber";
import {isBlocked, isValidPin, updateAttempts} from "@machines/auth";
import {MachineError} from "@lib/errors";
import bcrypt from "bcrypt";
import {addGuardian, removeGuardian} from "@db/models/guardian";
import {Cache} from "@utils/redis";
import {tHelpers} from "@src/i18n/translator";
import {Redis as RedisClient} from "ioredis";
import {Account} from "@db/models/account";


interface SocialRecoveryContext extends BaseContext {
  data?: {
    loadedGuardians?: string[];
    validatedToAdd?: string;
    validatedToRemove?: string;
    guardianToAdd?: string;
    guardianToRemove?: string;
  }
}

type SocialRecoveryEvent = BaseEvent

enum SocialRecoveryErrors {
  GUARDIAN_ADDITION_ERROR = "GUARDIAN_ADDITION_ERROR",
  GUARDIAN_REMOVAL_ERROR = "GUARDIAN_REMOVAL_ERROR",
  INVALID_PIN = "INVALID_PIN",
  LOADED_ERROR = "LOADED_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  SELF_REMOVAL = "SELF_REMOVAL",
  SELF_ADDITION = "SELF_ADDITION",
  INVALID_PHONE = "INVALID_PHONE",
  INVALID_GUARDIAN = "INVALID_GUARDIAN",
  NOT_GUARDIAN = "NOT_GUARDIAN",
  ALREADY_ADDED = "ALREADY_ADDED",
}


export const socialRecoveryMachine = createMachine<SocialRecoveryContext, SocialRecoveryEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5SwPYGMCWBDANgJTDRQDcwAnATwDpVNcCjTKBZMAOwFcBiAIQEEAwgGkA2gAYAuolAAHFLAwAXDCjbSQAD0QBGAJwBWbVQDM+3cYAsAJmPHtFgGwWLAGhAUdF3QHYqF7-oOABxi2rYOThYAvlFutNj4hCTk1PH0SUwUrJxcACp4fAByAMoAkrniUkggcgrKqupaCHqGJmaWNnaOzm4ezfr+VD6BujZiPqExcegJDMmUNDPpjCnZ3PlFZRXaVbLySipq1U0tRqbm1rb2kb06VhZGVgEO2lZvug5WelMgaYkrCz+c0yazyBRK5REVl2NX29SOoBOBjO7UuXRu7h0HSoT0Cxgc+iC2gcBmisV+S3+82o7EU5AwbCghTAAHcAOIcLBkCDYNi8QSiSTqWoHBrHRBfbS+bxiYzjfEfIIfYy3fq6IJ+AIy5xBfTeYzeMnTOhUzJUWn0xnM9mc7m8sGbSFC6oi+GNCXjBxUMSOIJeCxBP2B-Sqt5PKh+n0WPUkqx64w-IEZFJUYi4DAQLDKRkcrk8rBsXIoPgQCBcCCqMBUBnEFAAayraZwGazDKgubtBaLJYglWFcMO7uaT10fj9piJhO0gVD2m0Ym9uh9xnV3gMhMTlOBKabLez7dt+cLxdLXHIZBQZCoMhwWYAZpeALap9OZ-cdo-d0t9l0DsWIu41zHCwJ2nScHFDUwF3GH1DAMJxLG8TcTW3BYLTINsAAUGT4Nl+WEH89jqQdxWaZE2guTprh6TEECscYNQ+AZCQsMQHFCbRkNmZM0LYOkMMZbC2Fwh0IQqZ0iNFBFNE8BxjCoQ1dB8bwrCJKxPhVWjtF1CwI1Y1T9VsXR7CCLjlmpKgsA4RQAAtLwwAAvNsP15HspPLStqzYWsG0s6y7Iwpyc0PVzSykwjYWI-8ZIQaN5LEBKEv0MxWN0aMQy0kkjH0J41wMoIIjEKwzNNFMrNs+ygoPPNQp5eEzzIC8rxve8nz8irAuckKCzc+EItdEiANi-R4sSsRkrS8Z0tDNijBg6xvBCdSQgcErUOocqAscrqap6sL6vPS9r1vRQHzIZ9NsqnbO2E-bDhEHZ+yi6Smji70xom1Lpq05S9NlJ47Ho9S1p4jb-Ku4LdtuurDgaprjta872q2qqXL2mHVChGEBui16RvexLPqm5LVTCOUcTUuM5PMUkQYBaga1fISRLwABRfIAE1+r-F7ANHAMQKnIWINo+izCoMwfVy2Ucs48kk3p80+MtaqbqLAhH2SfDBWxnmh0laVZXlElgmVUmrGMhTnnuVjAkJVb5a3UGlf467PxQDWtY2MTuee-XPW9X1-UDANdVVFd5K8JS5LlAwlTpizdzfN3eXVsBNdIDy2CrGt60bV9W0htWPfT5JfakodXiAgXQOF0MAgUqO9QedUlQd41uMVpPC9V93Pczw7mpOs7n2799uuPfuwHLt1SKr-nxyF8DVUMfRG+jtKPm8CJdATs10Kwhk8Dw-gCIkyKK7n8jzg6K5ulcUWnCoT5-RlEbDFMfQ95TA-BKPvDvZbBnoNGK1x5KKWUqpV4GlVREglmNIqsp77FUdihZ2l1OpFyPP3XAWcc7eTzsjCGvdeQ4JwMA3GiA3oIKJmlEmtF2IanGvRYyU5HAJlQZ3CyGDtpYNIaXJscMjotVOm1HhqMJ5kIobzYao1CYpWJhlPobwvQQLiiBUINhv4LHESnAsZChFD0RhdcGmCSH6IEbgB6us-akWoR9BRdClGIBlEYOc0ZRivH8PibRYMOq8PMWwAxg8EaiKRrovhFiM5WOhE9S+Q17HyMmk482QQrAKTUmECIxJvDb18V5JOQlj5cDZpzaRlcRzAVrsvUWcYcRR2jPcYwupVJGgpGgxWv8oBCQAGonwFOU0iBsFJG3MCbNumk+hhFGFbQIAYtT6hQR3cy+9lYCW6QyPpokgHnxxjI+iPpn7eG0slAMDhXHaFgeNHE+gEovBsDYIIuT8kRKgD0jArI0ZsFgHggphDXnvM+RPWAgyhrzyqUvacIspliBlH4YIMpjkWwGO3dpXCzQAo+TaKGPyQkiJHkQsxgLsU3RBbsvWc9Kk10hTOWiBgFy3MSnJY55gRovNMQE4lXzcWNWEcPMRHKqpcuBdYuJs8wVUsXpOGpfRghejjAlL4jSzDJXZf4oVWLuWGNCQSzFQKcVYzFSAk4krBbSqhaTYk8kRqvFhecqBu9OErJTIzZsEBel4VKXgLm5LbFguvqiKi99VSbwJncp4uUzD5KgBPXqhxigcDQGgOAPzT46yNZQ4c1cpVgQtVpZwo4bU2GJKpOMbSFYWRjVDONqgE1JpTdsp0Nj4mgNNdUvNUyWU4jjMc8a+oAgbidaVBYVabpkLrcm2AqaBm+pbSa7NZrc20tlaYBSjLxhPAJISUyQ71pUFHdgyxOAJ0NsAU2jNMjwXUvNcuxAeJ6lKSJP4HU0Z8kyAZNygAMigLAEBIDa1BTFYZMpY4KlNnJUmzg14hCXFKYIrE0lvo-cC79v7-1nvEs28VQGRoaicH2v0ERjAW0mZ4A0Ckqa5Nue0Z5Pw2AoD-fAaoFbMgXqHAAWmhYgTjYbYVvGI7C+wjrlnDuoO+tgzACxYBgI+Wkaw2NDNaYHeD1hCTbylJBj4FG9Q+leEEZpgZ8ksdWOwDgCmwXHPkl4j47ERrEdI80Zw6TFp6f1H6PU9x8ldOtF88zQGlM+hU3GJ5LxvCQXxDcmUS5mlrjYvkseejjw9j800AqGpqVU1Yi8ZxdEWgmFYmc0YJJjJebWYfYSbIUs6BUrpKUTFQ7sQeEEGaSl4XJVCIaHKI0kK7vQYKxLNbpJ7KHNYUmaT0mWCKoi8aSlpz5NdRmZmlXfx+pikpBc1htKNbMHJJwM0IuSwNHYNc+mnClddpEyeAiwBVbogFoOqmQsaa0puoY1h0rJUMP4L+vWu4F3HlDNOGcbsrbnYgNLELMuzRy-iBcSklKOGCMSAk+pzsqyKctyS2GTg1aoHVgkDXdPNcfmvazxH2JRcM797h-XLtkNu6N2iKUTC2DsMZA005Frze8kzf+t31t+C+AVWCyo9uiyKjcplFsTKqTR+sj1t23h+mU36R76mwtaQNKOFSgQvjrYJDukTe69UkqPExrHxrwfBEh3M6HIawhDHh23HUOVUXGYWAt91mzMcX2x9ViL+OzAWw3WEEN6kw3nIE1luWRvnYHtqlJE9U7+eGgyZEYIAMP6k0syYGCKiwJnep2aeP6MpKs15WQW7TzI6Lyh9l0mwwJZLhI5t8wxHo2SKPUn83vvLcIB8PJAk851J8cMg-WVFsIys6+HYAqEQfux8ViXoJR7y9NSr-qG3+H68MPVBGJwyU0mWAQhwxfFlxNfp-X+iAiuLajhsKSbeTz1Ia6mSBDUbxAhyRmzlSw+ScBX5r6Xi3ZSgO7WaFR2Y2CqjBDyTw6ri663Ky5F5lRJooAcB8Q8AAFoANg36g5+7NA57gG2a2BQFaRmC+A+DsSzZKhhCvBeYaBKCK7bxegEifBFTqis7bzZ5sRDDPCBDjjH47oxBAA */
  id: "socialRecovery",
  initial: "socialRecoveryMenu",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    pinManagementMenu: {
      type: "final"
    },
    socialRecoveryMenu: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: [
          {target: "enteringNewGuardian", cond: "isOption1"},
          {target: "enteringGuardianToRemove", cond: "isOption2"},
          {target: "enteringPinVG", cond: "isOption3"},
        ]
      }
    },

    // add guardian
    enteringNewGuardian: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          {target: "validatingGuardianToAdd"},
        ]
      }
    },
    validatingGuardianToAdd: {
      invoke: {
        id: "validatingGuardianToAdd",
        src: "validateGuardianToAdd",
        onDone: {target: "enteringPinAG", cond: "succeeded"},
        onError: "enteringNewGuardian"
      },
      tags: "invoked"
    },
    enteringPinAG: {
      on: {
        BACK: "enteringNewGuardian",
        TRANSIT: [
          {target: "authorizingGuardianAddition", cond: "isValidPin"},
        ]
      },
      tags: "resolved"
    },
    authorizingGuardianAddition: {
      invoke: {
        id: "authorizingGuardianAddition",
        src: "initiateGuardianAddition",
        onDone: {target: "guardianAdditionSuccess", cond: "succeeded", actions: "saveValidatedGuardianToAdd"},
        onError: [
          {target: "invalidPinAG", cond: "isInvalidPin"},
          {target: "guardianAdditionError", cond: "isError"},
          {target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      tags: "invoked"
    },
    invalidPinAG: {
      entry: send({type: "RETRY", feedback: "invalidPin"}),
      on: {
        RETRY: "enteringPinAG",
      }
    },

    // remove guardian
    enteringGuardianToRemove: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          {target: "validatingGuardianToRemove"}
        ]
      }
    },
    validatingGuardianToRemove: {
      invoke: {
        id: "validatingGuardianToRemove",
        src: "validateGuardianToRemove",
        onDone: {target: "enteringPinRG", cond: "succeeded"},
        onError: "enteringGuardianToRemove"
      },
      tags: "invoked"
    },
    enteringPinRG: {
      on: {
        BACK: "enteringGuardianToRemove",
        TRANSIT: [
          {target: "authorizingGuardianRemoval", cond: "isValidPin"},
        ]
      }
    },
    authorizingGuardianRemoval: {
      invoke: {
        id: "authorizingGuardianRemoval",
        src: "initiateGuardianRemoval",
        onDone: {target: "guardianRemovalSuccess", cond: "succeeded", actions: "saveValidatedGuardianToRemove"},
        onError: [
          {target: "invalidPinRG", cond: "isInvalidPin"},
          {target: "guardianRemovalError", cond: "isError"},
          {target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      tags: "invoked"
    },
    invalidPinRG: {
      entry: send({type: "RETRY", feedback: "invalidPin"}),
      on: {
        RETRY: "enteringPinRG",
      }
    },

    // view guardians
    enteringPinVG: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          {target: "authorizingViewGuardians", cond: "isValidPin"},
        ]
      }
    },
    authorizingViewGuardians: {
      invoke: {
        id: "authorizingViewGuardians",
        src: "loadPinGuardians",
        onDone: {target: "pinGuardiansLoaded", cond: "succeeded", actions: "saveLoadedGuardians"},
        onError: [
          {target: "invalidPinVG", cond: "isInvalidPin"},
          {target: "loadError", cond: "isError"},
          {target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      tags: "invoked"
    },
    invalidPinVG: {
      entry: send({type: "RETRY", feedback: "invalidPin"}),
      on: {
        RETRY: "enteringPinVG",
      }
    },

    // final states
    guardianAdditionSuccess: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          {target: "exit", cond: "isOption9"},
        ]
      },
      tags: "resolved"
    },
    guardianAdditionError: {
      type: "final",
      tags: "error"
    },
    guardianRemovalSuccess: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          {target: "exit", cond: "isOption9"}
        ]
      },
      tags: "resolved"
    },
    guardianRemovalError: {
      type: "final",
      tags: "error"
    },
    pinGuardiansLoaded: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          {target: "exit", cond: "isOption9"}
        ]
      },
      tags: "resolved"
    },
    loadError: {
      type: "final",
      tags: "error"
    },
    accountBlocked: {
      type: "final",
      tags: "error"
    },
    exit: {
      type: "final"
    }
  }
}, {
  actions: {
    saveLoadedGuardians,
    saveValidatedGuardianToAdd,
    saveValidatedGuardianToRemove
  },
  guards: {
    isBlocked,
    isError,
    isInvalidPin,
    isOption1,
    isOption2,
    isOption3,
    isOption9,
    isValidPhoneNumber,
    isValidPin,
  },
  services: {
    initiateGuardianAddition,
    initiateGuardianRemoval,
    loadPinGuardians
  }
})

function isError(context: BaseContext, event: any) {
  return event.data.code === SocialRecoveryErrors.LOADED_ERROR
    || event.data.code === SocialRecoveryErrors.GUARDIAN_ADDITION_ERROR
    || event.data.code === SocialRecoveryErrors.GUARDIAN_REMOVAL_ERROR
}

function isValidPhoneNumber(context: BaseContext, event: any) {
  const { ussd: { countryCode } } = context;
  try {
    sanitizePhoneNumber(event.input, countryCode);
    return true
  } catch (e) {
    return false;
  }
}

function isInvalidPin(context: SocialRecoveryContext, event: any) {
  return event.data.code === SocialRecoveryErrors.INVALID_PIN || event.data.code === SocialRecoveryErrors.UNAUTHORIZED
}

function saveValidatedGuardianToAdd(context: SocialRecoveryContext, event: any) {
  context.data.validatedToAdd = event.data.guardian;
  return context;
}

function saveValidatedGuardianToRemove(context: SocialRecoveryContext, event: any) {
  context.data.validatedToRemove = event.data.guardian;
  return context;
}

function saveLoadedGuardians(context: SocialRecoveryContext, event: any) {
  context.data.loadedGuardians = event.data;
  return context;
}

async function initiateGuardianAddition(context: SocialRecoveryContext, event: any) {
  const { data: { validatedToAdd }, resources: { db, p_redis }, user: { account: { password, phone_number } } } = context
  const { input } = event

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(SocialRecoveryErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(SocialRecoveryErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  // add guardian to db and redis.
  try {
    await addGuardian(db, validatedToAdd, p_redis, phone_number)
    return { success: true }
  } catch (error) {
    throw new MachineError(SocialRecoveryErrors.GUARDIAN_ADDITION_ERROR, error.message)
  }
}

async function initiateGuardianRemoval(context: SocialRecoveryContext, event: any) {
  const { data: { validatedToRemove }, resources: { db, p_redis }, user: { account: { password, phone_number } } } = context
  const { input } = event

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(SocialRecoveryErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(SocialRecoveryErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  // remove guardian from db and redis.
  try {
    await removeGuardian(db, validatedToRemove, p_redis, phone_number)
    return { success: true }
  } catch (error) {
    throw new MachineError(SocialRecoveryErrors.GUARDIAN_REMOVAL_ERROR, error.message)
  }
}

async function loadPinGuardians(context: SocialRecoveryContext, event: any) {
  const { resources: { p_redis }, user: { account: { language, password, phone_number } } } = context
  const { input } = event

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (!isValidPin) {
    await updateAttempts(context)
    throw new MachineError(SocialRecoveryErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (!isAuthorized) {
    await updateAttempts(context)
    throw new MachineError(SocialRecoveryErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  // load guardians from redis.
  try {
    const cache = new Cache(p_redis, phone_number);
    const account = await cache.getJSON()
    const { guardians } = account
    const formattedGuardians = await formatGuardians(guardians, language, p_redis)
    return { guardians: formattedGuardians, success: true }
  } catch (error) {
    throw new MachineError(SocialRecoveryErrors.LOADED_ERROR, error.message)
  }

}

async function formatGuardians(guardians: string[], language: string, redis: RedisClient) {
  const placeholder = tHelpers("noMoreGuardians", language)
  if (guardians.length === 0) {
    return [placeholder]
  }
  return await menuPages(guardians, placeholder)
}

async function validateGuardianToAdd(context: SocialRecoveryContext, event: any) {
  const { resources: { p_redis }, user: { account: { address, guardians } }, ussd: { countryCode } } = context
  const { input } = event

  let guardian: string, guardianAccount: Account;

  // check that phone number is valid
  try{
    guardian = sanitizePhoneNumber(input, countryCode)
  } catch (error) {
    throw new MachineError(SocialRecoveryErrors.INVALID_PHONE, error.message)
  }

  // check that account is known to the system.
  const cache = new Cache<Account>(p_redis, guardian)
  guardianAccount = await cache.getJSON()
  if (!guardianAccount) {
    throw new MachineError(SocialRecoveryErrors.INVALID_GUARDIAN, "Unrecognized recipient")
  }

  // check that account is not same with user.
  if (guardianAccount.address === address) {
    throw new MachineError(SocialRecoveryErrors.SELF_ADDITION, "Cannot reset your own PIN")
  }

  // check that user is not already a guardian.
  if (guardians.includes(guardian)) {
    throw new MachineError(SocialRecoveryErrors.ALREADY_ADDED, "Already a guardian")
  }

  return { guardian: guardian, success: true }

}

async function validateGuardianToRemove(context: SocialRecoveryContext, event: any) {
  const { resources: { p_redis }, user: { account: { address, guardians } }, ussd: { countryCode } } = context
  const { input } = event

  let guardian: string, guardianAccount: Account;

  // check that phone number is valid
  try{
    guardian = sanitizePhoneNumber(input, countryCode)
  } catch (error) {
    throw new MachineError(SocialRecoveryErrors.INVALID_PHONE, error.message)
  }

  // check that account is known to the system.
  const cache = new Cache<Account>(p_redis, guardian)
  guardianAccount = await cache.getJSON()
  if (!guardianAccount) {
    throw new MachineError(SocialRecoveryErrors.INVALID_GUARDIAN, "Unrecognized recipient")
  }

  // check that account is not same with user.
  if (guardianAccount.address === address) {
    throw new MachineError(SocialRecoveryErrors.SELF_REMOVAL, "Cannot remove yourself")
  }

  // check that user is not already a guardian.
  if (!guardians.includes(guardian)) {
    throw new MachineError(SocialRecoveryErrors.NOT_GUARDIAN, "Not a guardian")
  }

  return { guardian: guardian, success: true }

}

export async function socialRecoveryTranslations(context: BaseContext, state: string, translator: any){

}
import {
  BaseContext,
  BaseEvent,
  isOption1,
  isOption2,
  isOption3,
  isOption9,
  translate,
  updateErrorMessages
} from "@src/machines/utils";
import {createMachine, send} from "xstate";
import {createPINHash, encryptInput, isBlocked, isValidPin, pinsMatch, updateAttempts} from "@src/machines/auth";
import {sanitizePhoneNumber} from "@utils/phoneNumber";
import {succeeded} from "@machines/voucher";
import {Account, resetAccount, updatePin} from "@db/models/account";
import {MachineError} from "@lib/errors";
import bcrypt from "bcrypt";
import {Cache} from "@utils/redis";

export interface PinsContext extends BaseContext {
  data: {
    initialPin?: string;
    ward?: {
      entry?: string;
      validated?: string;
    }
  }
}

type PinEvent =
  BaseEvent

enum PinErrors {
  INVALID_PIN = "INVALID_PIN",
  UNAUTHORIZED = "UNAUTHORIZED",
  CHANGE_ERROR = "CHANGE_ERROR",
  WARD_RESET_ERROR = "WARD_RESET_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",
  INVALID_WARD = "INVALID_WARD",
  SELF_RESET_ERROR = "SELF_RESET_ERROR",
  NOT_GUARDIAN = "NOT_GUARDIAN",
}

export const pinManagementMachine = createMachine<PinsContext, PinEvent>({
  /** @xstate-layout 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-PSOTv5-R0Bk9wRhdI8ucXKT0GAf3y2sXvPNHRQwYpOCByd-I1Dci5AYQwndIz8uIu+T8Q5EMo1aMmIC6dcFWgOuaTGKYIQ9WUAdNoXaLrCWkZJBD1Fa1WHymk60XIdzNDDHYc0RVGT0mOAoJQOwuVcdsnEmaJtKM8Mw+soq4iji2lKq0NQXgwK42cOCKK-SeOENhpppYf7CqAacMB0qMYIzHFxnCZkmMVPYHBmLSmtmBOMvRT9bmXhcqoOfm4f+Ja+h+wDpQIOdnED5Vk83bw+VsZTpTloFM+UNbQWFBoGKQ8tFehSwgQ0nEcUihtKyXGCZuaRj3l8oU6Zsq7h1WAuRlXz26kvRoa9hhb1BIxfsOOOxGtxi9uUzRLC5EKI4ZVtkZxTGQeZAYBThp0Fxgfc0BwRoMUi262pxe6AYh9fnHvLzxMhQJxZLyDOM4n3hP4hyLwVnNFDIbKMiZmIrvpj8uoDiOggrtt5EuNcf93rNHBONEjQLJUQFuZV6jzKdiOHoxiprNQhSMhioUtDCdmgnfKQM8SriVvCZnKJr6En0wpzW4T6w7GAaRm1U6l1VD+1eup8cFD70YSrXnGF0DjJOm6C8OoGEUadUxpRxwmSIqMQra6etsMintvaEMpCQnJXgn8jnXsj1ghaBUEYHiQQoMOwQEqy7WwLQGTMgskptWYIJdqtJ7CdOwoykEuuGRXtyuJ5q7FBrzbPk3A6+5uKYaZwTiQY6Ep-d1vUCiQoeDZsmJzDHr6-CAbS4hsfRGxOhAek9hJ-ep07wHhX3lLANIUQV20b-r0K4YKWH6LCj1A6BTdR04QgMHFoPZ5eeJup6mewJnUw6inO7vkQ1u7qF2OxdOQo-B+CAA */
  id: 'pin',
  initial: "pinManagementMenu",
  predictableActionArguments: true,
  states: {
    settingsMenu: {
      type: "final"
    },
    pinManagementMenu: {
      on: {
        BACK: "settingsMenu",
        TRANSIT: [
          { target: "enteringOldPin", cond: "isOption1" },
          { target: "enteringWard", cond: "isOption2" },
          { target: "socialRecoveryMenu", cond: "isOption3" },
        ]
      },
      description: "The main menu for pin management."
    },

    // pin change states
    enteringOldPin: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: [
          {target: "authorizingPinChange", cond: "isNotBlocked"},
          {target: "accountBlocked"}
        ]
      }
    },
    authorizingPinChange: {
      invoke: {
        id: "authorizingPinChange",
        src: "authorizePinChange",
        onDone: {target: "enteringNewPin", cond: "succeeded"},
        onError: [
          {target: "invalidOldPin", cond: "isInvalidPin"},
          {target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      description: "User is prompted to enter their new PIN.",
      tags: "invoked"
    },
    invalidOldPin: {
      entry: send({type: "RETRY", feedback: "invalidPin"}),
      on: {
        RETRY: "enteringOldPin"
      },
      description: "User is prompted to re-enter their PIN.",
      tags: "error"
    },
    enteringNewPin: {
      on: {
        BACK: "enteringOldPin",
        TRANSIT: [
          {target: "confirmNewPin", cond: "isValidPin", actions: ["savePin", "encryptInput"]},
          {target: "exit", cond: "isOption9"},
          {target: "invalidNewPin"}
        ]
      },
      description: "User is prompted to confirm their new PIN.",
      tags: "resolved"
    },
    invalidNewPin: {
      entry: send({type: "RETRY", feedback: "invalidNewPin"}),
      on: {
        RETRY: "enteringNewPin"
      }
    },
    confirmNewPin: {
      on: {
        BACK: "enteringNewPin",
        TRANSIT: [
          {target: "updatingPin", cond: "pinsMatch", actions: ["encryptInput"]},
          {target: "exit", cond: "isOption9"},
          {target: "pinMismatch"}
        ]
      }
    },
    pinMismatch: {
      entry: send({type: "RETRY", feedback: "pinMismatch"}),
      on: {
        RETRY: "confirmNewPin"
      },
      description: "The pin entered by the user did not match the saved pin. Offers the user a chance to retry entering the pin."
    },
    updatingPin: {
      invoke: {
        id: "updatingPin",
        src: "initiatePinUpdate",
        onDone: {target: "pinChangeSuccess", cond: "succeeded"},
        onError: {target: "pinChangeError", cond: "isChangeError"}
      },
      tags: "invoked"
    },

    // reset ward pin states
    enteringWard: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: [
          {target: "validatingWardToReset"},
        ]
      },
      tags: "error"
    },
    validatingWardToReset: {
      invoke: {
        id: "validatingWardToReset",
        src: "validateWardToReset",
        onDone: {target: "enteringPinR", cond: "succeeded", actions: "saveValidatedWard"},
        onError: { target: "enteringWard", actions: "updateErrorMessages" }
      },
      tags: "invoked"
    },
    enteringPinR: {
      on: {
        BACK: "enteringWard",
        TRANSIT: [
          {target: "authorizingWardReset", cond: "isNotBlocked"},
          {target: "accountBlocked"}
        ]
      },
      tags: "resolved"
    },
    authorizingWardReset: {
      invoke: {
        id: "authorizingWardReset",
        src: "initiateWardPinReset",
        onDone: {target: "wardResetSuccess", cond: "succeeded"},
        onError: [
          {target: "invalidPinR", cond: "isInvalidPin"},
          {target: "wardResetError", cond: "isWardResetError"},
          {target: "accountBlocked", cond: "isBlocked"}
        ]
      },
      description: "User is prompted to enter their new PIN.",
      tags: "invoked"
    },
    invalidPinR: {
      entry: send({type: "RETRY", feedback: "invalidPin"}),
      on: {
        RETRY: "enteringPinR"
      },
      description: "User is prompted to re-enter their PIN.",
      tags: "error"
    },

    // final states
    wardResetSuccess: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: {target: "exit", cond: "isOption9"}
      },
      description: "User is prompted to confirm their new PIN.",
      tags: "resolved"
    },
    wardResetError: {
      type: "final",
      tags: "error"
    },
    accountBlocked: {
      type: "final",
      tags: "error"
    },
    pinChangeError: {
      type: "final",
      tags: "error"
    },
    socialRecoveryMenu: {
      type: "final",
    },
    exit: {
      type: "final"
    },
    pinChangeSuccess: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: [
          {target: "exit", cond: "isOption9"},
        ]
      },
      tags: "resolved"
    }
  }
}, {
  actions: {
    savePin,
    encryptInput,
    saveValidatedWard,
    updateErrorMessages
  },
  guards: {
    isOption1,
    isOption2,
    isOption3,
    isOption9,
    isNotBlocked: (context: PinsContext) => !isBlocked(context),
    isValidPin,
    pinsMatch,
    isValidPhoneNumber,
    succeeded,
    isInvalidPin,
    isBlocked,
    isChangeError,
    isWardResetError
  },
  services: {
    authorizePinChange,
    initiatePinUpdate,
    initiateWardPinReset,
    validateWardToReset
  }
})

function isInvalidPin(context: BaseContext, event: any) {
  return event.data.code === PinErrors.INVALID_PIN || event.data.code === PinErrors.UNAUTHORIZED
}

function isChangeError(context: BaseContext, event: any) {
  return event.data.code === PinErrors.CHANGE_ERROR
}

function isWardResetError(context: BaseContext, event: any) {
  return event.data.code === PinErrors.WARD_RESET_ERROR
}

export function isValidPhoneNumber(context: BaseContext, event: any) {
  const { ussd: { countryCode } } = context;
  try {
    sanitizePhoneNumber(event.input, countryCode);
    return true
  } catch (e) {
    return false;
  }
}
function savePin(context: PinsContext, event: any) {
  context.data.initialPin = createPINHash(event.input);
  return context
}

function saveValidatedWard(context: PinsContext, event: any) {
  context.data.ward.validated = event.data;
  return context
}

async function authorizePinChange(context: PinsContext, event: any) {
  const {user: { account: {password } } } = context;
  const { input } = event

    // check that pin has valid format.
    const isValidPin = /^\d{4}$/.test(input)
    if (isValidPin === false) {
      await updateAttempts(context)
      throw new MachineError(PinErrors.INVALID_PIN, "PIN is invalid.")
    }

    // check that pin is correct.
    const isAuthorized = await bcrypt.compare(input, password)
    if (isAuthorized === false) {
      await updateAttempts(context)
      throw new MachineError(PinErrors.UNAUTHORIZED, "PIN is incorrect.")
    }

    return { success: true }
}

async function initiatePinUpdate(context: PinsContext) {
  const { data: { initialPin }, resources: { db, p_redis }, user: { account: { phone_number } } } = context;
  try {
    await updatePin(db, initialPin, phone_number, p_redis);
    return { success: true }
  } catch (error) {
    console.log(`PIN UPDATE ERROR STACK: ${error.stack}`)
    throw new MachineError(PinErrors.CHANGE_ERROR, error.message)
  }
}

async function initiateWardPinReset(context: PinsContext, event: any) {
  const { data: { ward: { validated } }, resources: { db, p_redis }, user: { account: {password } } } = context;
  const { input } = event

    // check that pin has valid format.
    const isValidPin = /^\d{4}$/.test(input)
    if (isValidPin === false) {
      await updateAttempts(context)
      throw new MachineError(PinErrors.INVALID_PIN, "PIN is invalid.")
    }

    // check that pin is correct.
    const isAuthorized = await bcrypt.compare(input, password)
    if (isAuthorized === false) {
      await updateAttempts(context)
      throw new MachineError(PinErrors.UNAUTHORIZED, "PIN is incorrect.")
    }

    // attempt to reset ward pin.
    try {
      await resetAccount(db, validated, p_redis);
      return { success: true }
    } catch (error) {
      throw new MachineError(PinErrors.WARD_RESET_ERROR, error.message)
    }
}

async function validateWardToReset(context: PinsContext, event: any) {
  const { resources: { p_redis }, user: { account: { address, phone_number } }, ussd: { countryCode } } = context
  const { input } = event
  let ward: string, wardAccount: Account;

  // check that phone number is valid
  try{
    ward = sanitizePhoneNumber(input, countryCode)
  } catch (error) {
    throw new MachineError(PinErrors.INVALID_PHONE_NUMBER, error.message)
  }

  // check that account is known to the system.
  const cache = new Cache<Account>(p_redis, ward)
  wardAccount = await cache.getJSON()
  if (!wardAccount) {
    throw new MachineError(PinErrors.INVALID_WARD, "Unrecognized recipient")
  }

  // check that account is not same with user.
  if (wardAccount.address === address) {
    throw new MachineError(PinErrors.SELF_RESET_ERROR, "Cannot reset your own PIN")
  }

  // check that user is ward of account.
  const { guardians } = wardAccount;
  if (!guardians.includes(phone_number)) {
    throw new MachineError(PinErrors.NOT_GUARDIAN, "You are not a guardian of this account")
  }

  return { success: true, ward: wardAccount.phone_number }
}

export async function pinTranslations(context: PinsContext, state: string, translator: any) {
  if (state ===  "wardResetSuccess" ) {
    const { data: { ward: { validated } } } = context;
    return await translate(state, translator, { ward: validated })
  }

  if (state === "wardResetError") {
    const { data: { ward: { entry } } } = context;
    return await translate(state, translator, { ward: entry })
  }

  return await translate(state, translator)
}
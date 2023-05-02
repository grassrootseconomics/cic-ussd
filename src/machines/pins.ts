import {
  isOption1,
  isOption2,
  isOption3,
  isOption9,
  isSuccess,
  isValidPhoneNumber,
  MachineEvent,
  MachineId,
  MachineInterface,
  updateErrorMessages
} from '@machines/utils';
import { createMachine, raise } from 'xstate';
import { AuthContext, hashValue, isBlocked, isValidPin, pinsMatch, validatePin } from '@machines/auth';
import { ContextError, MachineError } from '@lib/errors';
import { AccountService } from '@services/account';
import { translate } from '@i18n/translators';
import { validatePhoneNumber } from '@lib/ussd';


enum PinsError {
  CHANGE_ERROR = "CHANGE_ERROR",
  UNAUTHORIZED_GUARDIAN = "UNAUTHORIZED_GUARDIAN",
  WARD_RESET_ERROR = "WARD_RESET_ERROR",
}

export interface PinManagementContext extends AuthContext {
  data: {
    initialPin: string,
    wardEntry: string,
    validatedWardEntry: string,
  }
}

const stateMachine = createMachine<PinManagementContext, MachineEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOnQFcAXbAewCdcAvAqABQIGFt18YBiCDUIkCANxoBrMGSq0GzXu3xceMANoAGALqJQABxqxclXEN0gAHogCMAJmsBmErYcAWDQHYArK68OAbNYAHA4ANCAAnoiu1gCcJBqJGr6xDkHWGtaurgC+OeFoWHiEpBTU9EwsSiq8YHxgdHT0JHoANuiUAGb0qDLl8lWc3LWaOkggBkYmZuNWCHaOzm6ePn6BIeFRCOkkXknW1h6HXn7WXnkFGDgExH1ylYpDqnUNTXQt7V09dxUKbE8jaxjfSGYymfDmOYLJwudzeXwBYJhSKIBxHXZJXxBVy2IIaByxC4gQrXEo-Aa8ADq6DoEAASnAwJQBEJpGJJNIyvc-tTaQzYEzRuZJmCZqAofYYct4WskZsbK43CRFQdDrYPOqHHYiSTircub8WLz6Yzma9mm0Ot06L0DRSoMb+YLtMLQdMIbMbJKlnDVoiNiiELZbP5XCQ8VkNEF-LFkkdcvliVc9aVZIaqTSTQKzY0LZ9rba0-bHaa1EDXVNwZCvYtYSsEetkVtrP5ErsPK5Wx4gh2HF4PA4dcmbqn+g8HZmnTm3h8rd87eOS9m1LZgRM3VXPfNvXWZf6m4hbBpYv5dl5HK5YrGvEeAkOiiOSJghJ1cDaAHJgADuSj4ACEAEEOAAaSFcYRXdasEEVeIPHxRICRcG9LwPeYtScfx0gODRg0VI5CUTXVH2ffBXw-b9fwAFTpAD3wAZQASUosCQUrMVLGiAkSDghwENiJDbBQ+UEG7JwgiwjVg2STsE0uB8yRIsjUE-H8CD4ajaMY5jy3Ajd2LmGDuPg-F+L7QTUmEjIDhINIMgHQTkhjQdCOHBSXzfZSKLUjT6KYlc1wgzdxU42DjMQsyhMDM5jwSLJsm8I9O3Ve9SVuMB8EoBoWBU39AJAlj1zYj1gqDLJT2vPFzwHBw0ksxxbBIRw7L2ZJj1SFKUxIdLMoYXgcu8mjfOYl1dKKqDI1PTxu1wnw3E7Or+JIVIDkErVL1sWIgg6x9uqyvqvPwdTBq0ssAr04qONKzslo0LxKsOGraqi4IGv8LUmrRaMb2cuTUtIXbeqgfrDp8k7VwrUULrmexroq26HpqoJLNxDCtRWTJQ1vbayQBlgAHlWggXKgNAkbWMhqCHHseIgju2IvHp2JL1iFthLg+IWt42NgxjTtsbSjK9qgAmiYGzS-LJwqKa3Pt6e44JzxvYNNo8YSXA0JaW38c8Ag2jso35-7BcBkWqOOvydPJyCZajBrI0VE44jegc1bbbxEmDGrO1bc4XPkgWesGfBKTpf8SYKwL9NRW6Go8E9+0VLUNtsLxLOjDWrzsE5eLj3FZKTf2jcDx5g9D0GJbOsabZvbj497JP+NTqKWesZUWeDI4Q3SQTDa642g5Do7xe0yvpZK3Cgl2fwkIyNEdab5tG-DTJ7EyGrMhOXvcYzWkw-yyXI6h1FqfDOmGYZ5nWcDK8GrutxsUSG9xK3-ud4gIehoj87KbiLwluxM4sZaYp1VlFBmGs3DdhONrDw08foFz+iIfAoh0CtFwBAYGfA6QAFFqIAE0v5V3HmieIGR+KZFcHicSyMaqNXeviOI3gAjwKImSMQqD0GmzUjg-BhCx6XV4jXOOMDE52EbsJNEGskiZA8DxQ4XZe7sLQaLUuWDcF0gIQfb+W4YblVuvdaqT0thHjlvDGqLg+z4lcB4XuegAQwDouQTAmA4CwD3qTUe1tx5lRundeGhikaBndrsaxLNvZMwHPnVhtw7HKGGA4pxLjYBuPLsNTxQVLq6N8QYx6gStjYgamtXigQNq-xYa5GJBAACyPB0AwFQN1Kp6VyDuL4V4gRMda4iJqmIlObNWwJA9lQmI-Zoy2OqbU+pjTmkfxOloohHShF11EcnBeiBtbxGkSENYeJcTjPwDU-AdSwANIyk0-ALTUmnQhu0uYgjY7LJ6as4STMGpRllv4DsR4Bz7MOcc05lBzmXPNsxcGo1+F3M6cIhOTzxGBi+hiRIm0vDrB8LYX5uBYAYEoDgNRvD5kQsQAzDmnY4IhnxEeFFlksS7CyASA4KRjw2L9og8gegIAdCDiyYQ7IpAkDZRykwJc2kZIlLWaUfpGz9L-uJOwBI4IdlSOUwu-L2WcpLvUXM7xLRfBtKqwVQcRVR23OK30DY5TwrgnQg4JwbyYR8L3FByj1UTlpJRGgU5uVsmQRyEgTr0EuuNO6qcRqj5XT0X4qquS05U3DKEvYHY7DT38I6jhBq37BtNJqmcOqCx+rTYGzMmblwEtuYeHxcMo2I0skcVuTKTwP1uphFNLLOpfknKaRxzjXGtNLaK8tsN9H+OjVFGImzYhQJReeJKLbfpto7dmLtSSUkgtDVBLJlaEZGIVDGXYE6vlhM+bAvIiZ8A0AgHAcw0SiA3P7QgAAtP4YSj7e5YGfOQDKf5Wg0EwFICAt7jVpB8CQTCA45UDjglkYS2JGotW+e4E4OJmVzsfAuP41R4lgAA2G3ZSwCTZyqrnSy2sQPSJcOkaeDbX1FkXAupk2GoK4YsfTPwhH+Jp1kWeRwARm3dg1L3RSHlgYMa3DiOq3Zwz0zSFeAcrZNov2LkDA6ImSrBDOLFDaex-AxjpuJ1uamsiIY2tiBTQsuEXUPpTXWzh6pXgZsEWmrtSHac+SnFmOETOtp2q-f4pcVOZI2eGI4gQGEUdumnPwCQOwMzxCebIN5TOA2NP5u5fYwxomsRqQIapUJM0nkkRKGoNCtm1lvCwxgUuHh8BrYRmFu6MwndB66MkcTRTukiRRyC03CfBWWoM1Wul1bEcS0BzYTEJEy8U2Bnh0idf9RAczlX+vuEG7KzTMmJH2ERYkIIgkYg4V8HNtNSgQ5LZbNkXxLMggTvO2soMjkuNU1xN4E81h9k1BgNgrVZ3QxhmvFdm7oY7vYj-m9DIsqNSUPPO9zDS7XFnZCPEK8E6ows1WGcNmOIQNJ0TtrT6s6EGdViX8qZZzmlLfVFt3OgR278VkaNxAvZlRA9gTGHsBwCIobJMTzF2KcBLdrT6YIjc4gp1QnSsMKoDgahl0nXu2YhVQFgECpbNVgMZdkSGaXLg2ZokGThNG-YSHKsQbAH9uBUEMmfKIBoEQVe9bvWr9LHZNfZY1KhApiL7DdnEjfTnhPHwCpdUoJbu2Na+HVLGT5exDOY7-k1QBQCrIE+vfm51iug0etNGd+ME23p+EvFGXbrhiM7ATuA2B2zFS93bXyU0X23g-Yu-94XwXfCWX7JNDsrYCQBH1shgPZJa9ZiZHD5JCOVsRhd9PHmHZqXWQM9iSBAQtonqAA */
  id: MachineId.PIN_MANAGEMENT,
  initial: "pinManagementMenu",
  predictableActionArguments: true,
  states: {
    accountBlocked: {
      description: 'Account is blocked.',
      tags: 'error',
      type: 'final'
    },
    authorizingPinChange: {
      description: 'Invoked service that authorizes the PIN change.',
      invoke: {
        id: 'authorizingPinChange',
        src: 'authorizePinChange',
        onDone: { target: 'enteringNewPin', cond: 'isSuccess' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'invalidOldPin', actions: 'updateErrorMessages' },
        ]
      },
      tags: 'invoked'
    },
    authorizingWardReset: {
      description: "Invoked service that authorizes resetting a ward's PIN.",
      invoke: {
        id: 'authorizingWardReset',
        src: 'initiateWardPinReset',
        onDone: { target: 'wardResetSuccess', cond: 'isSuccess' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'wardResetError', cond: 'isWardResetError', actions: 'updateErrorMessages' },
          { target: 'invalidPinWR', actions: 'updateErrorMessages' }
        ]
      },
      tags: 'invoked'
    },
    confirmNewPin: {
      description: 'Expects PIN that matches the previously entered PIN.',
      on: {
        BACK: 'enteringNewPin',
        TRANSIT: [
          { target: 'updatingPin', cond: 'pinsMatch' },
          { target: 'exit', cond: 'isOption9' },
          { target: 'pinMismatch' }
        ]
      },
      tags: ["encryptInput", "error"]
    },
    enteringNewPin: {
      description: 'Expects valid PIN entry.',
      on: {
        BACK: 'enteringOldPin',
        TRANSIT: [
          { target: 'confirmNewPin', cond: 'isValidPin', actions: 'savePin' },
          { target: 'exit', cond: 'isOption9' },
          { target: 'invalidNewPin' }
        ]
      },
      tags: ['encryptInput', 'resolved']
    },
    enteringOldPin: {
      description: 'Expects valid PIN entry.',
      on: {
        BACK: 'pinManagementMenu',
        TRANSIT: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'authorizingPinChange' },
        ]
      },
      tags: ["encryptInput", "error"]
    },
    enteringPinWR: {
      description: 'Expects valid PIN entry.',
      on: {
        BACK: 'enteringWard',
        TRANSIT: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'authorizingWardReset' },
        ]
      },
      tags: ["encryptInput", "error"]
    },
    enteringWard: {
      description: 'Expects valid ward entry.',
      on: {
        BACK: 'pinManagementMenu',
        TRANSIT: [
          { target: 'validatingWardToReset' }
        ]
      },
      tags: 'error'
    },
    exit: {
      description: "Terminates USSD session",
      type: 'final'
    },
    invalidNewPin: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: raise({ type: 'RETRY', feedback: 'invalidNewPin' }),
      on: {
        RETRY: 'enteringNewPin'
      }
    },
    invalidOldPin: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: raise({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringOldPin'
      }
    },
    invalidPinWR: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: raise({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPinWR'
      }
    },
    pinChangeError: {
      description: 'Pin change failed.',
      tags: 'error',
      type: 'final'
    },
    pinChangeSuccess: {
      description: 'Pin change successful.',
      on: {
        BACK: 'pinManagementMenu',
        TRANSIT: [
          { target: 'exit', cond: 'isOption9' }
        ]
      },
      tags: 'resolved'
    },
    pinManagementMenu: {
      description: 'Displays PIN management menu.',
      on: {
        BACK: 'settingsMenu',
        TRANSIT: [
          { target: 'enteringOldPin', cond: 'isOption1' },
          { target: 'enteringWard', cond: 'isOption2' },
          { target: 'socialRecoveryMenu', cond: 'isOption3' }
        ]
      },
    },
    pinMismatch: {
      description: 'Entered PIN does not match the previously entered PIN. Raises a RETRY event to prompt user to retry pin entry.',
      entry: raise({ type: 'RETRY', feedback: 'pinMismatch' }),
      on: {
        RETRY: 'confirmNewPin'
      }
    },
    settingsMenu: {
      description: 'Displays settings menu.',
      type: 'final'
    },
    socialRecoveryMenu: {
      description: 'Displays social recovery menu.',
      type: 'final'
    },
    updatingPin: {
      description: 'Invoked service that updates the PIN.',
      invoke: {
        id: 'updatingPin',
        src: 'initiatePinUpdate',
        onDone: { target: 'pinChangeSuccess', cond: 'isSuccess' },
        onError: { target: 'pinChangeError', cond: 'isChangeError' }
      },
      tags: 'invoked'
    },
    validatingWardToReset: {
      description: "Invoked service that validates ward whose PIN is to be reset.",
      invoke: {
        id: 'validatingWardToReset',
        src: 'validateWardToReset',
        onDone: { target: 'enteringPinWR', cond: 'isSuccess', actions: 'saveValidatedWard' },
        onError: { target: 'enteringWard', actions: 'updateErrorMessages' }
      },
      tags: 'invoked'
    },
    wardResetError: {
      description: 'Ward reset failed.',
      tags: 'error',
      type: 'final'
    },
    wardResetSuccess: {
      description: 'Ward reset successful.',
      on: {
        BACK: 'pinManagementMenu',
        TRANSIT: { target: 'exit', cond: 'isOption9' }
      },
      tags: 'resolved'
    }
  }
}, {
  actions: {
    savePin,
    saveValidatedWard,
    updateErrorMessages
  },
  guards: {
    isBlocked,
    isChangeError,
    isOption1,
    isOption2,
    isOption3,
    isOption9,
    isSuccess,
    isValidPhoneNumber,
    isValidPin,
    isWardResetError,
    pinsMatch
  },
  services: {
    authorizePinChange,
    initiatePinUpdate,
    initiateWardPinReset,
    validateWardToReset
  }
})

function isChangeError(context: PinManagementContext, event: any) {
  return event.data.code === PinsError.CHANGE_ERROR
}

function isWardResetError(context: PinManagementContext, event: any) {
  return event.data.code === PinsError.WARD_RESET_ERROR
}

function savePin(context: PinManagementContext, event: any) {
  context.data = {
    ...(context.data || {}),
    initialPin: event.input
  }
  return context
}

function saveValidatedWard(context: PinManagementContext, event: any) {
  context.data = {
    ...(context.data || {}),
    validatedWardEntry: event.data.ward
  }
  return context
}

async function authorizePinChange(context: PinManagementContext, event: any) {
  await validatePin(context, event.input)
  return { success: true }
}

async function initiatePinUpdate(context: PinManagementContext) {
  const { connections: { db, redis: { persistent } }, data: { initialPin }, user: { account: { phone_number } } } = context;

  if (!initialPin) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Initial PIN missing from context.")
  }
  const hashedPin = await hashValue(initialPin)
  try {
    await new AccountService(db, persistent).updatePin(phone_number, hashedPin)
    return { success: true }
  } catch (error) {
    throw new MachineError(PinsError.CHANGE_ERROR, "Failed to update PIN.")
  }
}

async function initiateWardPinReset(context: PinManagementContext, event: any) {
  const { connections: { db,  redis: { persistent } }, data: { validatedWardEntry } } = context;
  const { input } = event

  await validatePin(context, input)

  if(!validatedWardEntry) {
    throw new MachineError(ContextError.MALFORMED_CONTEXT, "Validated ward missing from context.")
  }

  try {
    await new AccountService(db, persistent).reset(validatedWardEntry)
    return { success: true }
  } catch (error) {
    throw new MachineError(PinsError.WARD_RESET_ERROR, "Failed to reset ward's PIN.")
  }
}

async function validateWardToReset(context: PinManagementContext, event: any) {
  const { user: { account: { phone_number } } } = context;
  const { input } = event
  const wardPhoneNumber = validatePhoneNumber(context.ussd.countryCode, input)
  const guardian = await new AccountService(context.connections.db, context.connections.redis.persistent).getGuardian(wardPhoneNumber, phone_number)
  if (!guardian) {
    throw new MachineError(PinsError.UNAUTHORIZED_GUARDIAN, "You are not a guardian of this account")
  }
  return { success: true, ward: wardPhoneNumber }
}

export async function pinsTranslations(context: PinManagementContext, state: string, translator: any) {
  const { data: { validatedWardEntry, wardEntry } } = context;
  if (state ===  "wardResetSuccess" ) {
    return await translate(state, translator, { ward: validatedWardEntry })
  }

  if (state === "wardResetError") {
    return await translate(state, translator, { ward: wardEntry })
  }

  return await translate(state, translator)
}

export const pinManagementMachine: MachineInterface = {
  stateMachine,
  translate: pinsTranslations
}
import {
  BaseContext,
  isOption00,
  isOption11,
  isOption22,
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
import { ContextError, MachineError } from '@lib/errors';
import { Locales } from '@i18n/i18n-types';
import { AccountService } from '@services/account';
import { getLanguage, languageOptions, supportedLanguages, translate } from '@i18n/translators';

enum LanguageError {
  CHANGE_ERROR = "CHANGE_ERROR"
}

export interface LanguagesContext extends UserContext {
  data: {
    selectedLanguage: Locales,
  }
}


const stateMachine = createMachine<LanguagesContext, MachineEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgDNcAnWAFwBl18oBXdGAZTBoGIAhAQQDCAaQDaABgC6iUAAcA9rFw1c8-DJAAPRAEYALHvEkA7AFZx4vQGZxVgBx6AnI70AaEAE9EAJgBsdklM7KxCdKx07HUdg3wBfWPc0LDxCUgpqekYWNjBOHgAVACV+ADl2AEl8iWkkEAUlFTUNbQR9QxNzSxt7Jxd3LwRHK2MSHV9x40mo6zH4xIwcAmJyKloGJlYOLm4i0oqqnRq5RWVVdVqWtqMzC2tbB2c3T0RhvRJxYKi7R18b39M5iAkotUisMutslsCsUypVRN4jnUTo1zqBLgZrp07j1Hv1dN4bCRvI4dMZxDpvHYJh9AcCUstYGBMGoIBDNrltrtYVUpBp6qcmhdEHpjFZ3hYLFZib9vuM8QhjEMSL4rKY9N5iXpPr9aQt6aRGcz8Kysuy8jsYftRIc+cizs1haLxRKpT9jLLfPKdDpTKYSFZrJM7MZKdM9LrkksDUyWWycuauVaEbaGvahQgRWKJZLpe6fp7noMyaNfBqxqZvOJTNFHBGQQyY8a41CLXs4VZEfyUQ6M07s7Zcx6vYYdIE9KTLL4tWZTFY6-qSDQ8JQTRt45zLXDebUu2m0boMR1bt0Hn1CzoPmKQyTvuYbKYKfOo4vl6vIRzoW2Dp27YL9wgVUcf1HHEXxxEVYIQLsUwvQvN4HGGYwpypOxLABBIgT1Z8lyoN8zQ3L94R-VM-y0A92huLp7l6J4BgpVCTBJMlVUpUCqyfUECAAN3QAAbXA8JyAB5WQUW4QoAFEigATWqFMBVRMjWinMVemcaDRT0O9YMVRixmcNDQx0DjljAfAaDASgCCgAAFAg+CEMRt2OEjFMuXxzBIQNzDVMDMwLOjbDFDUbxDXwxnC9D5kjUEzIsqymDs-BW25OSd1-NyfD8AJ3TCC9vGsKcAsQOwCS8iLInHYx1RFEzSDiyzrKSlKrRtdLXJ7H0KVGcQXF60sqrCeURQCEkJl9cRK0cd04gwuln3QZgl3kKyAC9rObMBBGwLIwG4CA1DAEhuPkABrI7FuWtaNtNHJtt2tKXIUntM2dHM3SHQsCVUiLzB9e87GDOqSEu7AVtwdamE2+6mD2yzKBWkhZF49AaDIFbUBBpaweuqHbpgGGYEepEOvTV7+1dGV83lECSDG3wmM0sIPOB0HwchqBoZ22HuHhxHkdR9HKExtncc5-Gtu5om2qe7syb7bNKbzOVCynIDxgmJCJg01nsfZm61wJqW4coBHKCRlG0YxrGrohg330JsAiPkuX-3JxXB2pwsQhGDWp0pbxfWg7xge4viBOaySZOJ3dSPRCisRPGj5WQksJjA8wqrnOasNBHBdvYZhMEwOBYAckQY4yzrD0o7FT1onwIneYJXXA-wPmMYH89hwvi9Llqt2I570yuI8qJxM8BilMUgnCN0-G9YxjMBfB5AgOANHm1IXb3JSAFpioQPe-WcdSgiXjzfSsWsc5i5Z0jWCW8h3uPdEnf1TCX3129VFUaa1cqGpvA+ipKBEIwNDSxiflwF+mUAIBEnFSTO0FSqinlKVMUEUNYiiCH4cMt96ykBwiuTaz92rD3-NEP01ZELAK6JWYwXpeoBBoTOCkk1vghwIQuMO-FBIwBEq7EmFClKkiQiYSI3h3TQUsAYQ+3poh0yquSH4wZl7RUISQBqCVbIEFgZ1VCfpJogQmnQiwjh0HkmVNgwG4EbDjl1rbDmXNdr6LJt4dBIwQjeMmFWLSjguEaJ4fgHifCkpuMoU3Si3opwVmmjBQs1Z1Yay1hqRUUjWbF3kMwcyvBeLyEwOdCAESlKBw+KMUwpYhjhW9NWBJAxIiBGzKSJwPo-CBMwnfUg3cYASVNitEpLQbxjxiVpYkZh5ThEwRrD4thmLsW4c+HpuQi4l1gPAchQjLi9WuNfGpyFwgGHlHQtODMKSTGqpKYGYBNDKEGboSYvgJHnMBpnORkyfTWI8peCIGotL4KCc+RkNAVBMFgAAWTMswe5rRHnPKka82RehD4nIitVb0wx9DZ3iEAA */
  id: MachineId.LANGUAGES,
  initial: "firstLanguageSet",
  predictableActionArguments: true,
  preserveActionOrder: true,
  states: {
    accountBlocked: {
      description: 'Account is blocked.',
      tags: 'error',
      type: 'final'
    },
    authorizingLanguageChange: {
      description: 'Invoked service to authorize language change.',
      invoke: {
        id: 'authorizingLanguageChange',
        src: 'initiateLanguageChange',
        onDone: { target: 'changeSuccess', cond: 'isSuccess' },
        onError: [
          { target: 'accountBlocked', cond: 'isBlocked', actions: 'updateErrorMessages' },
          { target: 'changeError', cond: 'isChangeError', actions: 'updateErrorMessages' },
          { target: 'invalidPin', actions: 'updateErrorMessages' },
        ]
      },
      tags: 'invoked'
    },
    changeError: {
      description: 'Language change failed.',
      tags: 'error',
      type: 'final'
    },
    changeSuccess: {
      description: 'Language change is successful.',
      on: {
        BACK: 'settingsMenu',
        TRANSIT: { target: 'exit', cond: 'isOption9' }
      },
      tags: 'resolved'
    },
    enteringPin: {
      description: "Expects valid PIN matching account's PIN.",
      on: {
        BACK: 'firstLanguageSet',
        TRANSIT: [
          { target: 'accountBlocked', cond: 'isBlocked' },
          { target: 'authorizingLanguageChange' }
        ]
      },
      tags: ['encryptInput', 'error']
    },
    exit: {
      description: 'Terminates USSD session.',
      type: 'final'
    },
    firstLanguageSet: {
      description: 'Expects language selection from first language set.',
      on: {
        BACK: 'settingsMenu',
        TRANSIT: [
          { target: 'enteringPin', cond: 'isValidLanguageOption', actions: 'saveLanguageSelection' },
          { target: 'secondLanguageSet', cond: 'isOption11' },
          { target: 'exit', cond: 'isOption00' },
          { target: 'invalidLanguageOption' }
        ]
      }
    },
    invalidLanguageOption: {
      description: 'The entered language option is invalid. Raises a RETRY event to prompt user to retry language selection.',
      entry: send({ type: 'RETRY', feedback: 'invalidLanguageOption' }),
      on: {
        RETRY: 'firstLanguageSet'
      }
    },
    invalidPin: {
      description: 'Entered PIN is invalid. Raises a RETRY event to prompt user to retry PIN entry.',
      entry: send({ type: 'RETRY', feedback: 'invalidPin' }),
      on: {
        RETRY: 'enteringPin'
      }
    },
    secondLanguageSet: {
      description: 'Expecting language selection from second language set.',
      on: {
        TRANSIT: [
          { target: 'enteringPin', cond: 'isValidLanguageOption', actions: 'saveLanguageSelection' },
          { target: 'thirdLanguageSet', cond: 'isOption11' },
          { target: 'firstLanguageSet', cond: 'isOption22' },
          { target: 'invalidLanguageOption' }
        ]
      }
    },
    settingsMenu: {
      description: 'Transitions to settings menu.',
      type: 'final'
    },
    thirdLanguageSet: {
      on: {
        TRANSIT: [
          { target: 'enteringPin', cond: 'isValidLanguageOption', actions: 'saveLanguageSelection' },
          { target: 'secondLanguageSet', cond: 'isOption22' },
          { target: 'invalidLanguageOption' }
        ]
      },
      description: 'Expecting language selection from third language set.'
    }
  }
}, {
  actions: {
    saveLanguageSelection,
    updateErrorMessages
  },
  guards: {
    isBlocked,
    isChangeError,
    isOption9,
    isOption00,
    isOption11,
    isOption22,
    isSuccess,
    isValidLanguageOption
  },
  services: {
    initiateLanguageChange
  }
})

async function initiateLanguageChange(context: LanguagesContext, event: any) {
  const {
    connections: {
      db, graphql, redis
    },
    user: { account: { address, phone_number }, graph: { user: { id } } },
    data } = context
  const { input } = event

  await validatePin(context, input)

  if(!data?.selectedLanguage){
    throw new MachineError(ContextError.MALFORMED_CONTEXT, 'Selected language is not set.')
  }

  try {
    await new AccountService(db, redis.persistent).updateLanguage(address, graphql, id, data.selectedLanguage, phone_number)
    return { success: true }
  } catch (error: any) {
    throw new MachineError(LanguageError.CHANGE_ERROR, `${error.message} - ${error.stack}`)
  }
}

function isValidLanguageOption(context: LanguagesContext, event: any) {
  return Object.keys(supportedLanguages).includes(getLanguage(event.input))
}

function saveLanguageSelection(context: LanguagesContext, event: any) {
  context.data.selectedLanguage = getLanguage(event.input)
  return context
}

function isChangeError(context: LanguagesContext, event: any) {
  return event.data.code === LanguageError.CHANGE_ERROR || event.data.code === ContextError.MALFORMED_CONTEXT
}

async function languagesTranslations(context: BaseContext, state: string, translator: any){
  const languages = await languageOptions()
  switch(state) {
    case "firstLanguageSet":
      return await translate(state, translator, {languages: languages[0]})
    case "secondLanguageSet":
      return await translate(state, translator, {languages: languages[1]})
    case "thirdLanguageSet":
      return await translate(state, translator, {languages: languages[2]})
    default:
      return await translate(state, translator)
  }
}

export const languagesMachine: MachineInterface = {
  stateMachine,
  translate: languagesTranslations
}
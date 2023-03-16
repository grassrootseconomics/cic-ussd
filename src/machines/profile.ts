import {
  BaseContext,
  BaseEvent,
  isOption1,
  isOption2,
  isOption3,
  isOption4,
  isOption5,
  isOption6,
  translate,
  updateErrorMessages
} from "@src/machines/utils";
import {createMachine, send} from "xstate";
import {Gender, PersonalInformation, upsertPersonalInformation} from "@lib/graph/user";
import {AccountMetadata, getAccountMetadata} from "@lib/ussd/account";
import {isBlocked, updateAttempts} from "@machines/auth";
import {succeeded} from "@machines/voucher";
import {MachineError} from "@lib/errors";
import bcrypt from "bcrypt"
import redis from "@plugins/redis";

export interface ProfileContext extends BaseContext {
  data: {
    familyName: string,
    gender: Gender,
    givenNames: string,
    locationName: string,
    yearOfBirth: number,
  };
}

type ProfileEvent =
  BaseEvent


enum ProfileErrors {
  CHANGE_ERROR = "CHANGE_ERROR",
  INVALID_PIN = "INVALID_PIN",
  LOAD_ERROR = "LOAD_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
}


export const profileMachine = createMachine<ProfileContext, ProfileEvent>({
  /** @xstate-layout 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-FW8Ew9mvDBmF2H-R2Dw3LRoToiN2opP0ihB0rGuisNy6SsFZLXiw9mS+nNcwqHBHSRFeVeqaZVXq+B4NbLJn0w6RsdQFDynwWWZcHH-iuhrKZz2xhRLuFaOdeqCVrrqkc09HDMmK5ycIy4IqvUyM2FdOpP6cs4EIIhvNGGuii7nIMMRBcwJKMODLGoXGzpHnznDCsRVVmhM0RE+LSLlteoyY8OWQBZWBOrmKC6EERwmiVw05luzGcs6VEk2PA605K7uGJHsLWkI66ljqINsEWhm5vIUUeAlSCLb5ZmzUFQ82aSGCWwYQaChGZSgpIVskY0MvWdTjZA7YgUHZ1a5xGwtQUnAgmdA5oC8pTcYBsTMsxJDpaY1as45mjvsvicIGNTbdqgLhXJzOQ1ZquAJpKVEEO3M0jp7fgPdiOqgDP6TUckeh0WY9FHSZ0o0FxDbLHkmHXre0+oRwxqdcgl7ymMLOH8jRzvMoRVY0qchhttC7Qc2HfKfUU4UOuCiex1LR1Swz2Qct9KazlYcZwy4qLWaNDFGK6BN1CHoLgPuISIAU5gQIxowzHD+mOKM6OOTgRtq1p7ZVjWCAxWOfZf5LinfAhd56Fw7ujAgM5uCMumLCyQml0RCSdujQQDD9UinhWOsle68TXrnNlzVkdar+bO4aG7cCM+tVrid2QpgBT33+uAYAw+r+YH-wQTVn6lMrcnhgvWYb9m5vY7yUU7SyocHlEQqjQTd1R7VJSzbi1rXzNEBsCwELeYUnYB8-taBJ10rJeKv-j1ifFNeE9zC9oy3sAcRqAW7gBJqtU7nd1Bj-jj3CfRR44b0xpiZbA6sDAfAfAgA */
  id: "profile",
  initial: "profileMenu",
  predictableActionArguments: true,
  states: {
    settingsMenu: {
      type: "final",
      description: "Displays the settings menu. User can select an option to proceed."
    },
    profileMenu: {
      on: {
        BACK: "settingsMenu",
        TRANSIT: [
          { target: "enteringGivenNames", cond: "isOption1" },
          { target: "selectingGender", cond: "isOption2" },
          { target: "enteringYOB", cond: "isOption3" },
          { target: "enteringLocation", cond: "isOption4" },
          { target: "enteringProfileViewPin", cond: "isOption5" }
        ]
      },
      description: "Displays the profile menu. User can select an option to proceed."
    },

    // name states
    enteringGivenNames: {
      on: {
        BACK: "profileMenu",
        TRANSIT: [
          { target: "enteringFamilyName", cond: "isValidName", actions: "saveGivenNames" },
          { target: "invalidName" }
        ]
      },
      description: "Asks the user to enter their given names."
    },
    enteringFamilyName: {
      on: {
        BACK: "enteringGivenNames",
        TRANSIT: [
          { target: "selectingGender", cond: "genderAbsent", actions: "saveFamilyName" },
          { target: "enteringProfileChangePin", cond: "isValidName" },
          { target: "invalidName" }
        ]
      },
      description: "Asks the user to enter their family name."
    },
    invalidName: {
      entry: send({ type: "RETRY", feedback: "inValidName" }),
      on: {
        RETRY: "enteringGivenNames"
      },
      description: "Displays an error message and asks the user to try again."
    },


    // gender states
    selectingGender: {
      on: {
        BACK: "profileMenu",
        TRANSIT: [
          { target: "enteringYOB", cond: "YOBAbsent", actions: "saveGender" },
          { target: "enteringProfileChangePin", cond: "isValidGender" },
          { target: "invalidGenderOption" }
        ]
      },
      description: "Expects user to enter a valid option from the provided gender options.",
    },
    invalidGenderOption: {
      entry: send({ type: "RETRY", feedback: "inValidGenderOption" }),
      on: {
        RETRY: "selectingGender"
      }
    },

    // YOB states
    enteringYOB: {
      on: {
        BACK: "profileMenu",
        TRANSIT: [
          { target: "enteringLocation", cond: "locationAbsent", actions: "saveYOB" },
          { target: "enteringProfileChangePin", cond: "isValidYOB" },
          { target: "invalidYOBEntry" }
        ]
      },
      description: "Expects user to enter a valid option from the provided gender options.",
    },
    invalidYOBEntry: {
      entry: send({ type: "RETRY", feedback: "inValidYOBOption" }),
      on: {
        RETRY: "enteringYOB"
      }
    },

    // location states
    enteringLocation: {
      on: {
        BACK: "profileMenu",
        TRANSIT: [
          { target: "enteringProfileChangePin", cond: "isValidLocation", actions: "saveLocation" },
          { target: "invalidLocationEntry" }
        ]
      },
      description: "Expects user to enter a valid option from the provided gender options.",
    },
    invalidLocationEntry: {
      entry: send({ type: "RETRY", feedback: "inValidLocationOption" }),
      on: {
        RETRY: "enteringLocation"
      }
    },
    enteringProfileChangePin: {
      on: {
        BACK: "profileMenu",
        TRANSIT: "authorizingProfileChange"
      },
      description: "Asks the user to enter their PIN.",
      tags: "error"
    },
    authorizingProfileChange: {
      invoke: {
        id: "authorizingProfileChange",
        src: "initiateProfileChange",
        onDone: { target: "profileChangeSuccess", cond: "succeeded" },
        onError: [
          { target: "accountBlocked", cond: "isBlocked", actions: "updateErrorMessages" },
          { target: "changeError", cond: "isError", actions: "updateErrorMessages" },
          { target: "unauthorizedProfileChange", actions: "updateErrorMessages" }
          ]
      },
      description: "Asks the user to enter their PIN.",
      tags: "invoked"
    },

    // profile view states
    enteringProfileViewPin: {
      on: {
        BACK: "profileMenu",
        TRANSIT: "authorizingProfileView"
      },
      description: "Asks the user to enter their PIN.",
      tags: "error"
    },
    authorizingProfileView: {
      invoke: {
        id: "authorizingProfileView",
        src: "loadPersonalInformation",
        onDone: { target: "displayingProfile", cond: "succeeded" },
        onError: [
          { target: "accountBlocked", cond: "isBlocked" },
          { target: "loadError", cond: "isError" },
          { target: "unauthorizedProfileView" }
        ]
      },
      description: "Asks the user to enter their PIN.",
      tags: "invoked"
    },

    // final states
    accountBlocked: {
      type: "final",
      description: "Account is blocked.",
      tags: "error"
    },
    changeError: {
      type: "final",
      description: "Error changing profile.",
      tags: "error"
    },
    loadError: {
      type: "final",
      description: "Error loading profile.",
      tags: "error"
    },
    unauthorizedProfileChange: {
      entry: send({ type: "RETRY", feedback: "unauthorizedProfileChange" }),
      on: {
        RETRY: "enteringProfileChangePin"
      },
    },
    unauthorizedProfileView: {
      entry: send({ type: "RETRY", feedback: "unauthorizedProfileView" }),
      on: {
        RETRY: "enteringProfileViewPin"
      },
      description: "Displays an error message and asks the user to try again.",
      tags: "error"
    },
    displayingProfile: {
      type: "final",
      description: "Displays the profile.",
      tags: "resolved"
    },
    profileChangeSuccess: {
      type: "final",
      description: "Profile change successful.",
      tags: "resolved"
    }

  }}, {
    guards: {
      isOption1,
      isOption2,
      isOption3,
      isOption4,
      isOption5,
      isOption6,
      genderAbsent,
      YOBAbsent,
      locationAbsent,
      isValidName,
      isValidGender,
      isValidYOB,
      isValidLocation,
      succeeded,
      isBlocked,
      isError: (context, event: any) => {
        const x = event.data?.code
        console.log(`STACK TRACE: ${event.data?.stack}`)
        return x === ProfileErrors.CHANGE_ERROR
      }
    },
    actions: {
      saveGivenNames,
      saveFamilyName,
      saveGender,
      saveYOB,
      saveLocation,
      updateErrorMessages,
    },
    services: {
      initiateProfileChange,
      loadPersonalInformation,
    }
})

async function initiateProfileChange(context: ProfileContext, event: any) {
  const { resources: { graphql, p_redis }, user: { account: { address, password }, graph: { id: graphUserId }} } = context
  const { input } = event

  // check that pin has valid format.
  const isValidPin = /^\d{4}$/.test(input)
  if (isValidPin === false) {
    await updateAttempts(context)
    throw new MachineError(ProfileErrors.INVALID_PIN, "PIN is invalid.")
  }

  // check that pin is correct.
  const isAuthorized = await bcrypt.compare(input, password)
  if (isAuthorized === false) {
    await updateAttempts(context)
    throw new MachineError(ProfileErrors.UNAUTHORIZED, "PIN is incorrect.")
  }

  try {
    let updatedProfile: Partial<PersonalInformation> = {};
    if (context.data.givenNames) {
      updatedProfile["given_names"] = context.data.givenNames
    }
    if (context.data.familyName) {
      updatedProfile["family_name"] = context.data.familyName
    }
    if (context.data.gender) {
      updatedProfile["gender"] = context.data.gender
    }
    if (context.data.yearOfBirth) {
      updatedProfile["year_of_birth"] = context.data.yearOfBirth
    }
    if (context.data.locationName) {
      updatedProfile["location_name"] = context.data.locationName
    }
    updatedProfile["user_identifier"] = graphUserId
    upsertPersonalInformation(address, graphql, updatedProfile, p_redis)
    return { success: true }
  } catch (error) {
    throw new MachineError(ProfileErrors.CHANGE_ERROR, `${error.message}`)
  }
}

function isValidName(context: ProfileContext , event: any) {
  return /^[A-Z][a-z]+([][A-Z][a-z]+)?$/.test(event.input)
}

function saveFamilyName(context: ProfileContext , event: any) {
  context.data.familyName = event.input
  return context
}

function saveGivenNames(context: ProfileContext , event: any) {
  context.data.givenNames = event.input
  return context
}

function isValidGender(context: ProfileContext , event: any) {
  return event.input === "1" || event.input === "2"
}

function saveGender(context: ProfileContext , event: any) {
  context.data.gender = event.input === "1" ? Gender.MALE : Gender.FEMALE
  return context
}

function isValidYOB(context: ProfileContext , event: any) {
  const year = parseInt(event.data)
  if (isNaN(year)) return false
  return year >= 1900 && year <= 2100;
}

function saveYOB(context: ProfileContext , event: any) {
  context.data.yearOfBirth = parseInt(event.input)
  return context
}

function isValidLocation(context: ProfileContext , event: any) {
  return /^[a-zA-Z\s]*$/.test(event.input)
}

function saveLocation(context: ProfileContext , event: any) {
  context.data.locationName = event.input
  return context
}

function genderAbsent(context: ProfileContext) {
  const { user } = context
  return user.graph?.personal_information?.gender === null || user.graph?.personal_information?.gender === undefined
}

function YOBAbsent(context: ProfileContext) {
  const { user } = context
  return user.graph?.personal_information?.year_of_birth === null || user.graph?.personal_information?.year_of_birth === undefined
}

function locationAbsent(context: ProfileContext) {
  const { user } = context
  return user.graph?.personal_information?.location_name === null || user.graph?.personal_information?.location_name === undefined
}

async function loadPersonalInformation(context: ProfileContext, event: any) {
  const {user: { account: {password } } } = context;
  const { input } = event

    // check that pin has valid format.
    const isValidPin = /^\d{4}$/.test(input)
    if (isValidPin === false) {
      await updateAttempts(context)
      throw new MachineError(ProfileErrors.INVALID_PIN, "PIN is invalid.")
    }

    // check that pin is correct.
    const isAuthorized = await bcrypt.compare(input, password)
    if (isAuthorized === false) {
      await updateAttempts(context)
      throw new MachineError(ProfileErrors.UNAUTHORIZED, "PIN is incorrect.")
    }

    return { success: true }

}

export async function profileTranslations(context: ProfileContext, state: string, translator: any) {
  const { language } = context.user.account;
  const { personal_information } = context.user.graph;
  const { balance, symbol } = context.user.activeVoucher;

  if (state === "mainMenu") {
    return await translate(state, translator, { balance, symbol });
  }

  if (state === "displayingProfile") {
    const translations = {
      name: {
        input: {
          key: "name",
          value: `${personal_information?.given_names} ${personal_information?.family_name}`,
        },
        language,
      },
      gender: {
        input: {
          key: "gender",
          value: personal_information?.gender,
        },
        language,
      },
      age: {
        input: {
          key: "age",
          value:
            personal_information?.year_of_birth !== null
              ? new Date().getFullYear() - personal_information?.year_of_birth
              : null,
        },
        language,
      },
      location: {
        input: {
          key: "location",
          value: personal_information?.location_name,
        },
        language,
      },
    };

    return await translate(state, translator, translations);
  }

  return await translate(state, translator);
}



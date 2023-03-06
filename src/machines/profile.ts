import { BaseContext, BaseEvent } from "@src/machines/utils";
import { createMachine, send } from "xstate";
import { isBlocked, isAuthorized } from "@src/machines/auth";
import { Gender, updatePI, upsertPI } from "@lib/graph/user";
import { getAccountMetadata, AccountMetadata } from "@lib/ussd/account";

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

export const profileMachine = createMachine<ProfileContext, ProfileEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAcBOB7AZgSwDZgFkBDAYwAtsA7MAOjSz0LEoFcBiAIQEEBhAaQDaABgC6iFOljYALtnSVxIAB6IAjKoBsAFhoBmVQCYArKoDsqgJwbzpjQBoQATzWmhQmqd0HTBiyYMGWkamAL4hDvQ4+MTkVLSRjATM7AAqAEpcAHIAygCSKcJiSCDIkjJyCsUqCOraeoYm5lY29k5qRlY0WgAc3vpGQhrdFqZaYREYUYSkFNR0k4nJbOlZeQWqRRJSsvKK1bU6+sZmltZmrc4IBoO6NBa9PlqW5gaq4yUL0TNx8wzRSyscvkBAZNiUyjtKqB9ppDg0Ts1zg5LgFVLdVEILAZuk8fBorO8El9YnMiUxWMsMkCCrowaVthU9mpYfVjk0zrZke1MTR1Lp9JYtLpug1CZ9piT4uKkhTAWsBFo6RDGVVmXUjo1Ti0uTVurojDQDF48aZzCKRmK-hLZrRIOVKFAAOLYABuzEyRAAtmBKatgaJFPTyrtVTULPc9ELRsNhhohNidaojCYPEYNGY3LoNAEDJapjEbTQ7bIHc63ZQPd7fdSBBtA8qQ9C1OHupHdNH7lZ491Ez5biK49mTE8jd084lvnMqC6iLhsBAy+6vT60gBRdIATUK9YZjeUiBzphowV6Iq82Pjiest30g90WmM2ez4+JheLVCgADEvXhHJWfXK-pKruUL7lc+JHh0wpWFoIyqEEFztL4qbpq4RjeD0GgaC+1o-O+Drfp6v7-tW8p1sUQaQky4EjMeFjQdocEIb2Tz1He9ymBYmhjuEHxWgWPzTrO86EcRy5sGum7bhRDagdU2IPjQ3QdCY3RCMEWJGFeFjuAOgw9OGTxYjhAlzEQLDSGQ6CoNgABeH7-jwZBEA6AFUvKAYySB1FaEIWg6AiWIio+aKJkYWhHrogwZvpGheBYJmTrQ5mWdZdkOcuTkuTApHAuRWzBnJiC+f5vJNEFDTprovbXLyuh+G48YPkaiWSjQKVWTZ9kOo5zmublBSgjuhU+X5AXldilWhW0NTtoc0UtFicY8RM-FJTQLCUB1aW2ZAvXZSu65pFunkFVRoZPMMXTtumUb8k8V74jQcUNZi+o+MErWFuQ2UZVWEDyLQ07oAA1lKa1tT9Dp-WACDAyQRCQoU0lnSqTYID0QjoscQjqFo6ZWL28HPfVAxY3Fn28WSpm0FDUAw2wANTpQLqg+D+brXTMNwyz6AI0joi1sBI0XWp2MmLj8EE4hNRxgYei+IOnjhfVuhfT8XM9eJYCoBgqB0LgiOYNZnq-BzkN9fTWvejzrP8xUyOneC3mi1jvI43j0uJrBGhKYrQjdKYHRDEY6tzLAYD4CQJZOswEA6wNKPOyL6PhaaSkdPjSZYoYia9L7oxPlx6nxsYYe0BHUcx46ccJ4B6zC+dqcRUeykWFnHSvAYvZGK2anplh+hqaX5c0EJc4LrXqASUdJ2N2jYFpshtjBEInF+EMvYB3o0XWAEDX46P21dR+NeUPHqBZf19dJ5RC-VMt8ueP5PQiuTPYzaogc6Gv2JRaMsFbChCptKdax90qlinlfHKN98rJybmBR+Hh7z+W6G-LMH8UR+V9jpAea8-JpnMEfCynUIGx3PjraBbk-SDXnnuB+Acn4oNfhiDBecjTHh8HqTQaYIrt1HptcBu1J4UMvpbQ6UknZ33oYgbM2IaCNXwe2PGylEzhl9r5AemhNCDD8KPTW5CL6M0BmPXmYMzYTgtr9SBojbZ80Rg7QWUjZLURDqoZ6gcjSaC8aYTBB5S4KNgu2XG4U0ShxARDb6ltT5T2MczVm5jqac2iTYi+dj7byGRnA6RRUEBuI8X2bx+hfHsNuMHbEIxlIBzXvolJhiE46z1gbI2JsLGvg1nUs+aT4YOMyU4uhuT8lDEKdmYpfiwzIUxNmCK+DPBf1HvhKAG4ADyHBE7OJdujCC7gdIdF8cPbM4zjDb2FN4QUvllYLIgPaJZqzE7ZJcaGCCOgehPCxuYDoSYdRGiMLcduBgB69wBcMUe495wrLWZJY6t9HlbOUu44ZXjRlmCOSVLoD50yEPUN0LCxDUonwdBCqh6yBnUXel0YZQpg7hU3jNYwLzwzhk8HGSw9U8WkO6rcjgxLYGktDOS-G399RWBpeMtEOLDScTjDpLu9x2U7Q-ES8RichpeRTmBAVlLhUaFFTqEUXRGXhn0r0a4K0+Lm0LIIkhO1IBKoOjPSRfL0YHFZJqREnJP6+QsAohamI9SjlqdYrlcSgZmPZpYqJQaIXpN6ZQR2TqwIuo1AiDkMsHzuL1PybwOquICmwhEi1HSo13KZqGhJ4b2lzAMdGnpAsRBC2GggmE6p4Tsm1HSvyCijRCjjMmQI0zA3Q0JXcxp1lmnSGNqgU2SSrFDq5TGutMLNmJpZMmttSIZpRW9ehe894sYYjcGXAtEa8LXJjgAGXsZCEljb77NgjLujssZux6qDnRFsOk-AqKuTcy9GTKD3ITfsFsbYn1dgTJuiV7Zd0Aqqr4hKx7K22jPR+P9saVVAfva2R9Bln0QcuBiCKz0OhoKTJ4XGcVQUs2EhAND16oVz1vTIq4ARIK+MmueNS3cZpMt5CR3oryTBcXlQSqAdGKg8vckBJjuSAW0SgrGQB8E0yJlZZwnVgxAhJiliJsh4n5CSZoQ2tVTaDwQTogxJTzFP5NQUYy6wQ4eivF05y-TlBDM1lVajZjcnIL0UU0xFTM1A5sZ1SYcK3CQWIdwnMK1+K7KQDc8ShjS71XVBQb7NObgej-zUqYRM2C-Y6t8L3UYrwEOrULVWupbmQ2mPLW0mLtMatXoqAuxx9aNlpcQBl48My-J6jXnl1T6ElKwRFSXXxWZB1WzE61+QbBR362QIbCdrSZ2RrnW59rfTOuYYQL1rLA3ctr0TIEA0Ys-IAN8nqMY0WabtWtaJgACuKDzHl9u+YswF8w1nLjJncR0RlWYLnDAq+ak9ZkntkNe1ad7eVPvmYUzBQLMshiZcNYYUu52XMflh1MeHtCZPUS+8jxiv2guXGFNh8bX7lO9D0fd9acWOWQHx4wZLs9UumYO-5TL-WctDdOzNVw3qvBhdvE8bQd3KuQ+a0G9n+A6vA0SaA2ds3Few1rR17nd7ef4z664Y7Qv8szQHnoZ+UVqm2EMDNvH4pFu6zHStlpU7GsPYMZrnbcb+nE-5Xzw32XBu+OF-9jESlLevBLmvMwo9cDoCINch0mvldhvd+tePif7dWm9-Gv3zqQM4ZjOBsVnEdADEBUaOMGC48J6T1AFPS3x2TunWrwsmf69e+17t3XzHLAPqjLhkvai3A+oHl4dQnE0RhF4pQdA8d4AUTb3EfPYEAC0MsN8+sPYMbL9VcxM7atTZIq+H6B1A6aQYOKkzVU-o0Mf3EuKwjeIfwsEdpAx1gDKFgp-2hRQjwMLBMPJYMmFeOnJ4H0G4OjmYOErLkhkWChqWK6EuN6L-rLMhF-FmBiOPg9HfqMMgn0NcPyNYLARDvAWCguMgRWMuGgUaPVIaDqqaFiK4P5GYFeMmAQeRsmPcL0D+jHKJLgH+DQSZnrlXu4PiPRI8IEFHqbgRn2pwV4OhEEvwq-oJNRhPAIUIagSIT5n4OXjMjoupLwrIWoNeIaMaF4FjFmEHLjtbGAFQmgcokeGaN-BFHGJ4LfgRu2K2AhCcK4MVi-nAU1htFtNDsIvtK5GgUKLjO7CYIYJYfcFeEEMeGmNxAEMKOYGrKodVkGv+FES-F0DiDlsMD4CMGFNvMmKhJiP5sZNkbQFtN6FQhAGgY0OXkOFiO3E8L8leKPpUZoEFEtMKKPA0fYeIt+IwM0Tobkq0ceO0b4Kwd0Z6n4AoqkZkWElMqPJXGANHDEqIi0WYG0cYB0QsZ4S4IMCsQPHiAMCilRjOBPF0jrC0aMO4kEJYZnPyCAdpO4D4H-D2jdFjLYfUmIgdE8ckbBPgsEL8i+p-A8B4AENwlBJ4ASHUSEUIpAA8cCZEVMa4veN6oig+JxFKtxgRiMPLJxhUn5K8OhHbqko8diU8rBC8UrCHACsKHnPqArH-JoGVsKqPDAKIk0WgT8QXF-BFO9BeDLF-K8H7NiDutBOpAfkEQ9vyRfFQuMfgJMd5rksKR4KKcrFwoMGot4JyWpFYOdkvHwYqqskKQECKTiPqRKd8vFM9EtCcJiPjDqrcTRhCmgTqlmGVNouLv5H4E6fyBnEFMoviC-ICXaliVqT5MSYgMpM9LTjpPGIws5iiSzjahALGTAL6V4KyD0LYGePcJKVmO4BXmYK8EKFmoqWQcEdWtafSejJxPLPBDiKpMpEQVpHSkmB4LTqeO3L8kfDAIKS2YmlCQAX5PcG4CAb2VgvLIEIyjipiPgiKKOaMQdOqZAGgTfrpEHDOcAX4AuT1mvAOfZr3E5j0JaQ6G5nuXFPLO3JxBgv5J3CYRjGiIaLTghOpPsjLg2Q9hQfeROfJPyN6gCsEG2SwbiDqCMNuivD7F-KaIfCiUIqhvNu5uIrQcKpwkKEZFmrSpcIHJlivOFnqP6gIqEfFsIklthaBQeHoYHoYZURFHBQ+pBRLJpNYMAkqckkGiBfGfykNkpGLPjPqBpFiCNjoPnAMDYGvJ4Gahtj8PHv+uOUJejE4bqWggArYGvPyCNu4mvBph9CedoLXmpWMUQBMY4TYNpa4XpR4d7Pqr4c8lLNNmhWEdngTvRRpWBFXjgv3IeOFOojqBkZGIyuFm4MiXxW1NmV1Gzm9r5fAqIUxVlixcYTqFhLpJxUKNIVeTSQ3uKI4fgqmL8vjBFtoqeQgP4GNoykEEbgZKPGSOpSlcxlpS4bpe4QZWbsTEDuGKyUEMpEpcvqSEldudZRqbZWYPZV1fpacTVTyNUYZDqmgsUrXlnsnsVQxbLO3LMccIHJYOcNVWYJ0E5j4JfhiL4vmrFYWGSJeonruTtXQRBYwdBWNGwZ-G2Zwd4PBtfvWcpWNVaA9RADuZqW1bJuBQwVBcwR9R+V-BGEaN4MYCvJirxYBWAiQCQOgJtNIBwKpWDODTkjibBAUtIYSWaa+r7LJeFkwWiAfmEEAA */
  id: "profileMachine",
  initial: "profileMenu",
  predictableActionArguments: true,
  states: {
    profileMenu: {
      on: {
        BACK: "settingsMenu",
        TRANSIT: [
          { target: "editingGivenName", cond: "isOption1" },
          { target: "selectingGender", cond: "isOption2" },
          { target: "editingYOB", cond: "isOption3" },
          { target: "editingLocation", cond: "isOption4" },
          { target: "loadingProfile", cond: "isOption5" }
        ]
      },
      description: "Displays the profile menu. User can select an option to proceed."
    },

    settingsMenu: {
      type: "final",
      description: "Displays the settings menu. User can select an option to proceed."
    },

    editingGivenName: {
      on: {
        TRANSIT: [
          { target: "editingFamilyName", cond: "isValidName", actions: "saveGivenName" },
          { target: "invalidGivenName" }
        ]
      },
      description: "User is prompted to enter their given name."
    },

    invalidGivenName: {
      entry: send( { type: "RETRY", feedback: "invalidName" } ),
      on: {
        RETRY: "editingGivenName"
      },
      description: "User is prompted to enter their given name again."
    },

    editingFamilyName: {
      on: {
        TRANSIT: [
          { target: "authorizingNameChange", cond: "isValidName", actions: "saveFamilyName" },
          { target: "invalidFamilyName" }
        ]
      },
      description: "User is prompted to enter their family name."
    },

    invalidFamilyName: {
      entry: send( { type: "RETRY", feedback: "invalidFamilyName" } ),
      on: {
        RETRY: "editingFamilyName"
      },
      description: "User is prompted to enter their family name again."
    },

    authorizingNameChange: {
      on: {
        TRANSIT: [
          { target: "changingName", cond: "isAuthorized" },
          { target: "unauthorizedNameChange", cond: `${!isBlocked}`, actions: "updateAttempts" },
          { target: "accountBlocked"
          }
        ]
      },
      description: "Expects name change pin input from user."
    },

    unauthorizedNameChange: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: { RETRY: { target: "authorizingNameChange" }
      },
      description: "The name change pin entered is invalid. The pin must be a 4-digit number and match the pin set for the account."
    },

    changingName: {
      invoke: {
        src: "initiateNameChange",
        onDone: [
          { target: "selectingGender", cond: "genderAbsent" },
          { target: "nameChanged", actions: "updateName" },
        ],
        onError: { target: "nameChangeFailed", actions: "updateErrorMessages" }
      },
      description: "Initiates a name change request to graph."
    },

    nameChanged: {
      type: "final",
      description: "Name change was successful."
    },

    nameChangeFailed: {
      type: "final",
      description: "Name change failed."
    },

    selectingGender: {
      on: {
        TRANSIT: [
          { target: "authorizingGenderChange", cond: "isValidGender", actions: "saveGender" },
          { target: "invalidGender" }
        ]
      },
      description: "User is prompted to select their gender."
    },

    invalidGender: {
      entry: send( { type: "RETRY", feedback: "invalidGender" } ),
      on: {
        RETRY: "selectingGender"
      },
      description: "User is prompted to enter their gender again."
    },

    authorizingGenderChange: {
      on: {
        TRANSIT: [
          { target: "changingGender", cond: "isAuthorized" },
          { target: "unauthorizedGenderChange", cond: `${!isBlocked}`, actions: "updateAttempts" },
          { target: "accountBlocked"
          }
        ]
      },
      description: "Expects gender change pin input from user."
    },

    unauthorizedGenderChange: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: { RETRY: { target: "authorizingGenderChange" }
      },
      description: "The age change pin entered is invalid. The pin must be a 4-digit number and match the pin set for the account."
    },

    changingGender: {
      invoke: {
        src: "initiateGenderChange",
        onDone: [
          { target: "editingYOB", cond: "YOBAbsent" },
          { target: "genderChanged", actions: "updateGender"},
        ],
        onError: { target: "genderChangeFailed", actions: "updateErrorMessages" }
      },
      description: "Initiates gender change request to graph."
    },

    genderChanged: {
      type: "final",
      description: "Gender change was successful."
    },

    genderChangeFailed: {
      type: "final",
      description: "Gender change failed."
    },

    editingYOB: {
      on: {
        TRANSIT: [
          { target: "authorizingYOBChange", cond: "isValidYOB", actions: "saveYOB" },
          { target: "invalidYOB" }
        ]
      },
      description: "User is prompted to enter their age."
    },

    invalidYOB: {
      entry: send( { type: "RETRY", feedback: "invalidYOB" } ),
      on: {
        RETRY: "editingYOB"
      },
      description: "User is prompted to enter their age again."
    },

    authorizingYOBChange: {
      on: {
        TRANSIT: [
          { target: "changingYOB", cond: "isAuthorized" },
          { target: "unauthorizedYOBChange", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked"
          }
        ]
      },
      description: "Expects age change pin input from user."
    },

    unauthorizedYOBChange: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: { RETRY: "authorizingNameChange" },
      description: "The age change pin entered is invalid. The pin must be a 4-digit number and match the pin set for the account."
    },

    changingYOB: {
      invoke: {
        src: "initiateYOBChange",
        onDone: [
          { target: "editingLocation", cond: "locationAbsent" },
          { target: "ageChanged", actions: "updateYOB" },
        ],
        onError: { target: "ageChangeFailed", actions: "updateErrorMessages" }
      },
      description: "Initiates age change request to graph."
    },

    ageChanged: {
      type: "final",
      description: "YOB change was successful."
    },

    ageChangeFailed: {
      type: "final",
      description: "YOB change failed."
    },

    editingLocation: {
      on: {
        TRANSIT: [
          { target: "authorizingLocationChange", cond: "isValidLocation", actions: "saveLocation" },
          { target: "authorizingProfileChange", cond: "isCompleteProfileEdit", actions: "saveProducts"},
          { target: "invalidLocation" }
        ]
      },
      description: "User is prompted to enter their location."
    },

    invalidLocation: {
      entry: send( { type: "RETRY", feedback: "invalidLocation" } ),
      on: {
        RETRY: "editingLocation"
      },
      description: "User is prompted to enter their location again."
    },

    authorizingLocationChange: {
      on: {
        TRANSIT: [
          { target: "changingLocation", cond: "isAuthorized" },
          { target: "unauthorizedLocationChange", cond: `${!isBlocked}`, actions: "updateAttempts" },
          { target: "accountBlocked"
          }
        ]
      },
      description: "Expects location change pin input from user."
    },

    unauthorizedLocationChange: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: { RETRY: { target: "authorizingNameChange" }
      },
      description: "The location change pin entered is invalid. The pin must be a 4-digit number and match the pin set for the account."
    },

    changingLocation: {
      invoke: {
        src: "initiateLocationChange",
        onDone: { target: "locationChanged", actions: "updateLocation" },
        onError: { target: "locationChangeFailed", actions: "updateErrorMessages" }
      },
      description: "Initiates location change request to graph."
    },

    locationChanged: {
      type: "final",
      description: "Location change was successful."
    },

    locationChangeFailed: {
      type: "final",
      description: "Location change failed."
    },

    authorizingProfileChange: {
      on: {
        TRANSIT: [
          { target: "changingProfile", cond: "isAuthorized" },
          { target: "unauthorizedProfileChange", cond: `${!isBlocked}`, actions: "updateAttempts" },
          { target: "accountBlocked"
          }
        ]
      },
      description: "Expects profile change pin input from user."
    },

    unauthorizedProfileChange: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: { RETRY: { target: "authorizingNameChange" }
      },
      description: "The profile change pin entered is invalid. The pin must be a 4-digit number and match the pin set for the account."
    },

    changingProfile: {
      invoke: {
        src: "initiateProfileChange",
        onDone: { target: "profileChanged", actions: "updateProfile" },
        onError: { target: "profileChangeFailed", actions: "updateErrorMessages" }
      },
      description: "Initiates full profile change request to graph."
    },

    profileChanged: {
      type: "final",
      description: "Profile change was successful."
    },

    profileChangeFailed: {
      type: "final",
      description: "Profile change failed."
    },

    loadingProfile: {
      invoke: {
        src: "loadProfile",
        onDone: { target: "profileLoaded", actions: "updateProfile" },
        onError: { target: "profileLoadFailed", actions: "updateErrorMessages" }
      },
      description: "Loads profile from redis."
    },

    profileLoaded: {
      type: "final",
      description: "Profile loaded successfully."
    },

    profileLoadFailed: {
      type: "final",
      description: "Profile load failed."
    },

    accountBlocked: {
      type: "final"
    },
  }
})

function isValidName(context: ProfileContext , event: any) {
  return /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(event.data)
}

function saveFamilyName(context: ProfileContext , event: any) {
  return context.data.familyName = event.data
}

function saveGivenName(context: ProfileContext , event: any) {
  return context.data.givenNames = event.data
}

function isValidGender(context: ProfileContext , event: any) {
  return event.data === "1" || event.data === "2"
}

function saveGender(context: ProfileContext , event: any) {
  return context.data.gender = event.data === "1" ? Gender.MALE : Gender.FEMALE
}

function isValidYOB(context: ProfileContext , event: any) {
  const year = parseInt(event.data)
  if (isNaN(year)) return false
  return year >= 1900 && year <= 2100;
}

function saveYOB(context: ProfileContext , event: any) {
  return context.data.yearOfBirth = parseInt(event.data)
}

function isValidLocation(context: ProfileContext , event: any) {
  return /^[a-zA-Z\s]*$/.test(event.data)
}

function saveLocation(context: ProfileContext , event: any) {
  context.data.locationName = event.data
}

function genderAbsent(context: ProfileContext) {
  return context.data.hasOwnProperty("gender")
}

function YOBAbsent(context: ProfileContext) {
  return context.data.hasOwnProperty("yearOfBirth")
}

function locationAbsent(context: ProfileContext) {
  return context.data.hasOwnProperty("locationName")
}

function isCompleteProfileEdit(context: ProfileContext) {
  return context.data.hasOwnProperty("givenNames") && context.data.hasOwnProperty("familyName") && genderAbsent(context) && !YOBAbsent(context)
}

async function initiateNameChange(context: ProfileContext) {
  const { resources: { graphql }, data: { givenNames, familyName } } = context;
  return await updatePI(graphql, { given_names: givenNames, family_name: familyName });
}

async function initiateGenderChange(context: ProfileContext) {
  const { resources: { graphql }, data: { gender } } = context;
  return await updatePI(graphql, { gender: gender });
}

async function initiateYOBChange(context: ProfileContext) {
  const { resources: { graphql }, data: { yearOfBirth } } = context;
  return await updatePI(graphql, { year_of_birth: yearOfBirth });
}

async function initiateLocationChange(context: ProfileContext) {
  const { resources: { graphql }, data: { locationName } } = context;
  return await updatePI(graphql, { location_name: locationName });
}

async function initiateProfileChange(context: ProfileContext) {
  const { resources: { graphql }, data: { familyName, gender, givenNames, locationName, yearOfBirth } } = context
  return await upsertPI(graphql, {
    family_name: familyName,
    gender: gender,
    given_names: givenNames,
    location_name: locationName,
    year_of_birth: yearOfBirth
  })
}

async function loadProfile(context: ProfileContext) {
  const { resources: { redis }, user: { account: { address } } } = context;
  return await getAccountMetadata(address, redis, AccountMetadata.PROFILE)
}

function updateProfile(context: ProfileContext, event: any) {
  context.data = event.data
}


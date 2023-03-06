import { BaseContext, BaseEvent } from "@src/machines/utils";
import { createMachine, send } from "xstate";
import { isBlocked } from "@src/machines/auth";
import { getAccountMetadata, AccountMetadata, setAccountMetadata } from "@lib/ussd/account";
import { sanitizePhoneNumber } from "@utils/phoneNumber";
import { getWard, addGuardian, removeGuardian } from "@db/models/guardian";
import { PostgresDb } from "@fastify/postgres";
import { findPhoneNumber, resetAccount } from "@db/models/account";

export interface PinContext extends BaseContext {
  data: {
    guardians?: {
      entry?: string;
      validated?: string;
      validatedToAdd?: string;
      validatedToRemove?: string;
    },
    initialPin?: string;
    ward?: {
      entry?: string;
      validated?: string;
    }
  }
}

type PinEvent =
  BaseEvent

export const pinManagementMachine = createMachine<PinContext, PinEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5QAcCWA7AsgQ3dmAtmOgC44DGAFhmAHRpa75hGmbECuAxAEICCAYQDSAbQAMAXUQoA9rFQlUM9NJAAPRAEYAzLtoAmbQBZtAdgCsAGhABPRADZ9ADlpOAnNv2H7T7ebcmAL6B1gw4eITEZNhUNPQY4cysZJxcACoASnwAcgDKAJJp4lJIIMhyCkoqpRoIOnqGJhbWdgjm+qauHl7aPn4B+sGhCUyRbDHU6HRhoyxR7OjcmTkFRZolsvKKyqq19doGxmZWtoimPrSaJj19-kEhZSMRc+OxU-GMz8kLS1l5hSJ9BsyhVttVQHtdAdGscWlpfJ1tN1vL47kYho9Pkl5hM4tgOCRKDIAE6oABeGCgAAUMAJKLgYLxBKJJKpylsqrstOYxAdzI4Tq1zKYXEjPCj+kZBg8Zl8cW86PjCSTyZSaeg6QywOk-qtimzQZyalo-JpLvpBYgjJpRcjeqiAtoMbLsa9JoqCUTSRT0NTafTfdrlv81sD2ZUdsa6lDDk1LQgnGajG4UwFzJp7G4Ov5nU9XdEFbQlV7Vb71ZrAzqVgCgQaOZGIYh9JoxEZaEYxAK4Qh9PY2xZefZ7OYO6YzJpc1ixgX3bQOHhPSqyZBywHGRkAKKZACa+tK4bBXOjDSOzVOdVMnSM5m0mk0bnTmY69kniWnFFnUTApN92TAAHd1SrEM902CNwXURARzcbsbzcS5rglO5pWGKcXhnOIvx-KA-0AjBgL1dY63Ao9oO7C14PccV7UlJ0ZTzd9cXeDAADdsAAG1QCAgM3HdQJBesIMhE843I-wumo25HVfWZviYuhyGUAAzVBiQINV8ODPVWX3Q0G0g49oVPeNPDETp9DcS8-HsYwnH8FDMTfdCPziRT0BUtSNPQAiASI3TBNI5Nu08bQxFoMR9ClNxE1s+yZLlN04jCVBYAIbASCoLheIyXcdLAw8ozI89PCcML2iimKjDsrN4vzFz3g4ZAIHSryuAgZQ6FYmQAGtpgY5z5LnJqWrLDAEC68gWuUYp+IPI1Gx7Fs2w7Ltios-tLLHflYpq+i0LkwtGuaxRRu879iRJeh2PSpSSQID4nIO2cjpGv10HG9AWJkSawRmvKBJIqNm1bdtOwtYLm30cLIosyrqocl1GMLLDKQAdWwYkICZYRZr0oTuV5Wh+XB89TE0To+0kh17lQx75U-UhvzRjGsa0gF-rm-TamB5awfjHwXGtId7Dvam6Np2T6cwxnsPRzGfNDYiCoWnnQdW1onCHWhLOHYUxAzLNL1qpHZ1YjiuLl7iiSmLKtxy3GAqBiz7CJkVNBJjWM3bc5zD1g2OlMY2BsLNjOOO5n5fa5jPp6vr9ql95Q6417LY+r6fqqP6wzxo8LL8Axh3VhxTDCoWh1F2ig6euIk-D31La4c7LuQa6SFutSHslxLE-NuuoFTiapvQLOlfmgy8-MAvifjc4Dl6SzNZtSu9rp7uPWVb0I4gDI4DAEgFYdwGFrMc5zXjLM2zFG4xarhP15LH1+5ZnfYD3g+-PysfuZTKGnDPVo3A2loKYZMKZrz+yNivLuGF3jFiXFvF+b82ZFFrP5I+BkT4u3dufEBElr7LwlglGBdB5xwO9JAS2iD97ZVytnR2KsPCT17NPbsLYrjAN5HeB8EDA5QKIfVOgxJd4kBOk-TGQEo6dRjr1Tu-DBpCNfiIre6o07fSHiPNBysDJGBFlDNwPh-6IDcJ2WgV8kLST4XVeRwjRGWyAk3YkV0bp3VkVYwsCi962JZiowev1JCHy0bUHR7ttYGPjGws0VF8F3HFo5aBAjaCwG+qgDiO9FIsW-DYH42MWR0PQbUJEOj2w3mwawh8LgrhU0lOiSxJs4hJPICk9iaSZAZOJFk1IyCAlf0QNoRMbYzKJg9k2JE8F7BmR5B4BeThb5r0Sck1JYB0mZOyV0j+ANAm9MvPBH2RcewBE6OVWGOgqpxVqcHWcDSmktLaR0xYB9UGfy5ls0w8EkR81Yf4MKlTokBBqYQtxs4yGligAAcQ4CzFJ6AABqqAAI5O6c8hAmCz7kWMPBFsA4pkihmec6usDFyb19OCyFuBYXwq6RzHOUYUWlPPL2ZsBgQHk3GX2Ec9heEArqQSjeIKSWYyheS-8788mbORZeLBwyew8jCuMrFSIcWzOIUWQlfKIUCrJXC4VXTHkbJ6eK0+dLWheGirQOVkyFVOFxVyi5cRSGquXBAflEBBVattnxKl9CMFTIMEM+MkUeSXAmWIbFVqlUJPYjIbALriXqpdbgAAMilfekjaBdRkYjW17xI3RspM6qFSbYAkFURnaa-jPX5KtLo0Jf9-U+Bdq2c4Oh+TXh0ZyuJcjCw5pjWCuNBbk2N2JBdRxLdnEd0zfiug3a819sTcmkt6jy2iv1cEvRYSxKlSJkYJt1lW0cvDYNFGsbSXoDSDIPgEAsb8BxhWsVtKpXOEstDCqJz4YHuRjLGdJ6z0XtZrqdmy6kUTynnsiyZlwrbq2jZU5u0bWTtoEe3t37z2XpFaPJF96TKthcEc6Kr6zlwbvmmz6vdf35twFSa22oaGIvxsin1zgjVNhTC4CKL6doI36vB2ur1yOnpQ1jVN6a46r2VTx0RfGf2XoXX4iQtHc5LTVg+sQmtLjCxFkvNE77Zzia-Rq-jv7B3DqcW3FxE6iO6ePfpqTEAZOZyXehujqsVpStCsY4BIDjkce03EM2YdJMCfdfbW9+rgPML2aFdwTL2Mwc4-HOZwLH58cM9e3Jjnc6MJAw+vwBxyb6KcPofWT5rUdsBXiB1en43oEM5SwDTnMvhYfRYF2l5rTnE7Hu9t5mEsVas1Vmr-7FaaNCw1wuD6LTmWYX7YrPmeUP0q1Cgb1YUF1Yy-nRr-rBl4PMUYf5pXuUkIXLyx1yXUM0ZCxh92V5YT0sKy1qbJd-Yle68q6NPa+NtQ6sRr6GauNEbewt3Admy1yYu3RzD5EQEDMiiyjr7Kut-YS5ewHZ0h3N1bu3e6L2EkA761C4Hw8HPDYwxK1F9KnDJiJjDPD3m8VEcQwFneBBWnalS-JmlpOmN1D7LKxCNEtN07mQz2d-Gmcs4PmDtbTCxvhOTC7dTGnqZ7ex4ez9ePcBnrFxktDxPwec6lZoOCZq+dSV27NqRtctdgD45RjqQXaHpZpQxv1rCqoYpN0r83tBLNIeszIK3n3o4-ZE-EwaPvGcsBZwTjRTynOKZc+ElTZoFcVwF4RuZ4eRea8j9rhxJnMeuIO973uvGs-+5z2AaPRPY8KZBgn1hPgwpmP538r3fmuIR+Z9r87q2gajZYeeDMIptst7N4L17vXfdVYD2zyXff1sy9d+TY3VS0-7azffeB6v0AB9q47hhC+B+tBbBykfpvleI4n8dlHu-BsiHWZzerh+9nu0itrH203DbmC94lm-FeHm94H7S5H4min4-I7YX7xbKr2rHaQB8YB49774YJXbtg3bH7kzLQf6PZPgWBe5CJd4o6B4W6xyF4b60D4GtIo5V6g6AEYL67hIZi86r6t7j4JIUEsSEF56jqmbjqX5sE55UG+L2Y0FIEFL0GsJiC+wITMFj4PDoAyAQBwBsh8HySiGIAAC09g3Y6hk8qYeh+h0UL4rBg02OnAahdQYgIaRMt4UqRu4Bo+cWomCSaUCQZhuuR4GYzg4UbsUq4yk8USO2sSKuhYv+p0FYMA5hnhrGPh-qJg4UlhvQw4o444QRKhh0R2D8K4-oWo5hryBwY4ok54FO0hvyUoRh6eyqiGuE6o5ht48EnCD64yJRgRbeJGYcNR7hUYpU8EwMHghiPYjK9hpuHQXubkHk6kp0uRgCsYaBvS94OG1OcMBG6+8GyUqU6UVA5hUoEMhMu2IafYpUhuFoz2aRz0w0oiHRNeUYGBZowoLuxU94ZoHQMWb6xhhYDAAAqucZAOYZFCplliZHnM+l5rFl7p8d8QAGLYCoDsQ-GdEqwdguAbbBQ2iHKLH4awYrH05q5iIQCRHDhQyVL9FkxmjN6m6pFQEJLt4QB2JUa-GIkAndjdGmJ2jkle4+6Wy-HsoGCGDlJQhQj8ymBQxkk3xvGmxtEWwsy1G8lk6tBjguCawLwiyikVE46T6ULCLSlIiylGJWE6y+zYGGwI6UmDQwGZE0nPyanwnjwMnInniAJtgBGj4UlOHWKKJeLiIYBbG3j+F2RlzqamBMl2Qr6lEumh6Fj-jeIYBUJbEFYNqG57JWqRKskqlYlzKRmek77CJQkwlwlXELRVS9jhQJlSrRSIgpkEJpnKpXKLLLLtI-BbHuxhT5b9H3jalOnn4-6T58ZCpakYrZaSHNGj6QGunpGJZwEi69nWlBJNk1r9EwwNow7tZsptpe7Trb6FokBbFgZEx9H+rmAFZU5tasqdZe5QAi6bkJpRqKF4nTlWhxnFkgE9g+BtjPGw4rn7pilxDnknqXnXk5mwm3n5naIPn6xPkTYuCtbvmnlfnvDC7Ia-p9k6k9juBImeY06gmwUW6kaXo250l3kIDWiFZzn+rRSlwdj6JVRgXHHskl4SZl6IUEU2iG5Kb+qYrFkFYQGtG1wBaMXAXcygKuAcqolYaBq4ZLGYnBFArdki58V6pAZCxbrrr0oqaTyUylEjnhnPQZFLgTknpyWP5HghT9lsUpghlcVYVFjI7b61FRTAKAIK7qb+pjj5HMrLkwWqmDQ-n6a-p5nyV0ZEXNnKXGpkzwTlTQXw5nmyWXoAV+WGVRiBUkXkQFaTxsYRWrmWXwV+5W5IVc5XB-xn6e6WXUlW54UdSNnEUtmy5kxEz+DuC8g8i9gTiWWZ7IY5VMUgKTwxESEBDmXDncW9yd4s70lmWaxky1oN4dhDmdmWWhFT5QrtX8VNi2mL6D5mSkkVlr5SV2o6XkJOoi6LX+VGUyl5WG5N6bUsGeXuICE2UEXGBewU6zEWG7aFXVJRUnpW5AVHUJWzlVWsI6BYIe5vWWXeXT4V6xVfXxUFm-XBVaC8hMEaU-7kCKTzgkA8CRrkC9SQ3UrQ2VWw3RhawinA3BBAA */
  id: 'pinManagementMachine',
  initial: "pinManagementMenu",
  predictableActionArguments: true,
  states: {
    pinManagementMenu: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "authorizingPinChange", cond: "isOption1" },
          { target: "enteringWard", cond: "isOption2" },
          { target: "socialRecoveryMenu", cond: "isOption3" },
        ]
      },
      description: "The main menu for pin management."
    },
    mainMenu: {
      type: "final",
      description: "The main menu for the app."
    },
    authorizingPinChange: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: [
          { target: "enteringNewPin", cond: "isAuthorized" },
          { target: "unauthorizedPinChange", cond: "!isBlocked", actions: "updatedAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "Prompts the user to enter their current pin to authorize a pin change."
    },
    unauthorizedPinChange: {
      entry: send({ type: "RETRY", feedback: "invalidPinChange" }),
      on: {
        RETRY: "authorizingPinChange",
      },
      description: "Prompts the user to re-enter their current pin to authorize a pin change."
    },
    enteringNewPin: {
      on: {
        TRANSIT: [
          { target: "confirmingPin", cond: "isValidPin", actions: ["savePin", "encryptInput"] },
          { target: "invalidPin" }
        ]
      },
      description: "Expects pin input from user."
    },
    invalidPin: {
      entry: send({ type: "RETRY", feedback: "invalidPin" }),
      on: {
        RETRY: "authorizingPinChange"
      },
      description: "The pin entered is invalid. It does not conform to regExp[/^\\d{4}$/]"
    },
    confirmingPin: {
      on: {
        TRANSIT: [
          { target: "updatingPin", cond: "pinsMatch", actions: ["encryptInput"] },
          { target: "pinMismatch" }
        ]
      },
      description: "Confirms the pin entered by the user. If it matches the saved pin, transitions to mainMenu, otherwise to pinMismatch."
    },
    pinMismatch: {
      entry: send({ type: "RETRY", feedback: "pinMismatch" }),
      on: {
        RETRY: "confirmingPin"
      },
      description: "The pin entered by the user did not match the saved pin. Offers the user a chance to retry entering the pin."
    },
    updatingPin: {
      invoke: {
        src: "updatePin",
        onDone: { target: "pinUpdated", actions: "updatePin" },
        onError: { target: "pinUpdateFailed" }
      },
      description: "Updates the saved pin with the new pin."
    },
    pinUpdated: {
      type: "final",
      description: "The pin has been updated successfully."
    },
    pinUpdateFailed: {
      type: "final",
      description: "The pin update failed."
    },
    enteringWard: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: [
          { target: "validatingWard", cond: "isValidPhoneNumber", actions: "saveWardEntry" },
          { target: "invalidWardPhone" }
        ]
      },
      description: "Prompts user to enter the ward whose pin they want to reset."
    },
    invalidWardPhone: {
      entry: send({ type: "RETRY", feedback: "invalidPhoneNumber" }),
      on: {
        RETRY: "enteringWard"
      }
    },
    validatingWard: {
      invoke: {
        src: "validateWard",
        onDone: { target: "authorizingWardReset", actions: "saveValidatedWard" },
        onError: { target: "invalidWard" }
      },
      description: "Validates the ward entered by the user."
    },
    invalidWard: {
      type: "final",
      description: "The ward entered by the user is invalid."
    },
    authorizingWardReset: {
      on: {
        TRANSIT: [
          { target: "resettingWardPin", cond: "isAuthorized" },
          { target: "unauthorizedWardReset", cond: `${!isBlocked}`, actions: "updateAttempts" },
          {
            target: "accountBlocked"
          }
        ]
      },
      description: "Prompts user to enter the pin in order to authorize the reset of the ward's pin."
    },
    unauthorizedWardReset: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: {
        RETRY: { target: "authorizingWardReset" }
      },
      description: "The pin is invalid or incorrect. The pin must be a 4 digit number and must match the pin set for the account."
    },
    resettingWardPin: {
      invoke: {
        src: "wardReset",
        onDone: { target: "wardPinReset" },
        onError: { target: "wardPinResetFailed" }
      },
      description: "Resets the ward's pin."
    },
    wardPinReset: {
      type: "final",
      description: "The ward's pin has been reset successfully."
    },
    wardPinResetFailed: {
      type: "final",
      description: "The ward's pin reset failed."
    },
    socialRecoveryMenu: {
      on: {
        BACK: "pinManagementMenu",
        TRANSIT: [
          { target: "authorizingGuardianView", cond: "isOption1" },
          { target: "enteringGuardianToAdd", cond: "isOption2" },
          { target: "enteringGuardianToRemove", cond: "isOption3" },
        ]
      },
      description: "The main menu for social recovery."
    },
    authorizingGuardianView: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          { target: "loadingGuardianList", cond: "isAuthorized" },
          { target: "unauthorizedGuardianView", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "Prompts user to enter the pin in order to authorize viewing the list of guardians."
    },
    unauthorizedGuardianView: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: {
        RETRY: { target: "authorizingGuardianView" }
      },
      description: "The pin is invalid or incorrect. The pin must be a 4 digit number and must match the pin set for the account."
    },
    loadingGuardianList: {
      invoke: {
        src: "loadGuardianList",
        onDone: { target: "guardianListLoaded", actions: "saveGuardianList" },
        onError: { target: "guardianListLoadFailed" , actions: "updateErrorMessages" }
      },
      description: "Loads the list of guardians."
    },
    guardianListLoaded: {
      type: "final",
      description: "The list of guardians has been loaded successfully."
    },
    guardianListLoadFailed: {
      type: "final",
      description: "The list of guardians failed to load."
    },
    enteringGuardianToAdd: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          { target: "validatingGuardianToAdd", cond: "isValidPhoneNumber", actions: "saveGuardianEntry" },
          { target: "invalidAddGuardianPhone" }
        ]
      },
      description: "Prompts user to enter the phone number of the guardian they want to add."
    },
    invalidAddGuardianPhone: {
      entry: send({ type: "RETRY", feedback: "invalidPhoneNumber" }),
      on: {
        RETRY: "enteringGuardianToAdd"
      },
      description: "The guardian entered by the user is invalid."
    },
    validatingGuardianToAdd: {
      invoke: {
        src: "validateGuardianToAdd",
        onDone: { target: "authorizingGuardianAdd", actions: "saveGuardianToAdd" },
        onError: { target: "invalidGuardianToAdd" }
      }
    },
    invalidGuardianToAdd: {
      entry: send({ type: "RETRY", feedback: "invalidGuardian" }),
      on: {
        RETRY: { target: "enteringGuardianToAdd" }
      },
      description: "The guardian entered by the user is invalid."
    },
    authorizingGuardianAdd: {
      on: {
        BACK: "enteringGuardianToAdd",
        TRANSIT: [
          { target: "addingGuardian", cond: "isAuthorized" },
          { target: "unauthorizedGuardianAdd", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "Prompts user to enter the pin in order to authorize adding the guardian."
    },
    unauthorizedGuardianAdd: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: {
        RETRY: { target: "authorizingGuardianAdd" }
      }
    },
    addingGuardian: {
      invoke: {
        src: "setGuardian",
        onDone: { target: "guardianAdded" },
        onError: { target: "guardianAddFailed" }
      }
    },
    guardianAdded: {
      type: "final",
      description: "The guardian has been added successfully."
    },
    guardianAddFailed: {
      type: "final",
      description: "The guardian add failed."
    },
    enteringGuardianToRemove: {
      on: {
        BACK: "socialRecoveryMenu",
        TRANSIT: [
          { target: "validatingGuardianToRemove", cond: "isValidPhoneNumber", actions: "saveGuardianEntry" },
          { target: "invalidRemoveGuardianPhone" }
        ]
      },
      description: "Prompts user to enter the phone number of the guardian they want to remove."
    },
    invalidRemoveGuardianPhone: {
      entry: send({ type: "RETRY", feedback: "invalidPhoneNumber" }),
      on: {
        RETRY: "enteringGuardianToRemove"
      },
      description: "The guardian entered by the user is invalid."
    },
    validatingGuardianToRemove: {
      invoke: {
        src: "validateGuardianToRemove",
        onDone: { target: "authorizingGuardianRemove", actions: "saveGuardianToRemove" },
        onError: { target: "invalidGuardianToRemove" }
      },
      description: "Validates the phone number entered by the user."
    },
    invalidGuardianToRemove: {
      entry: send({ type: "RETRY", feedback: "invalidGuardian" }),
      on: {
        RETRY: { target: "enteringGuardianToRemove" }
      },
      description: "The guardian entered by the user is invalid."
    },
    authorizingGuardianRemove: {
      on: {
        BACK: "enteringGuardianToRemove",
        TRANSIT: [
          { target: "removingGuardian", cond: "isAuthorized" },
          { target: "unauthorizedGuardianRemove", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "Prompts user to enter the pin in order to authorize removing the guardian."
    },
    unauthorizedGuardianRemove: {
      entry: send({ type: "RETRY", feedback: "invalidPIN" }),
      on: {
        RETRY: { target: "authorizingGuardianRemove" }
      },
      description: "The pin is invalid or incorrect. The pin must be a 4 digit number and must match the pin set for the account."
    },
    removingGuardian: {
      invoke: {
        src: "deleteGuardian",
        onDone: { target: "guardianRemoved" },
        onError: { target: "guardianRemoveFailed" }
      }
    },
    guardianRemoved: {
      type: "final",
      description: "The guardian has been removed successfully."
    },
    guardianRemoveFailed: {
      type: "final",
      description: "The guardian remove failed."
    },
    accountBlocked: {
      type: "final",
    }
  }
})

function isValidPhoneNumber(context: PinContext, event: any) {
  const { ussd: { countryCode } } = context;
  try {
    sanitizePhoneNumber(event.data, countryCode);
    return true
  } catch (e) {
    return false;
  }
}

function saveWardEntry(context: PinContext, event: any) {
  return context.data.ward.entry = event.data;
}

async function validateAccount(db: PostgresDb, phoneNumber: string) {
  const account = await findPhoneNumber(db, phoneNumber);
  return account?.phone_number ?? null;
}

async function validateWard(context: PinContext) {
  const { data: { ward: { entry } }, resources: { db }, user: { account: { phone_number } }, ussd: { countryCode } } = context;
  const phone = await validateAccount(db, sanitizePhoneNumber(entry, countryCode));
  const wardPhone = await getWard(db, phone_number, phone);
  if (wardPhone) {
    return wardPhone;
  }
  throw new Error("Ward not found.");
}

function saveValidatedWard(context: PinContext, event: any) {
  return context.data.ward.validated = event.data;
}

async function wardReset(context: PinContext){
  const { data: { ward: { validated } }, resources: { db } } = context
  return await resetAccount(db, validated);
}

async function loadGuardianList(context: PinContext) {
  const { resources: { redis }, user: { account: { address } } } = context;
  return await getAccountMetadata(address, redis, AccountMetadata.GUARDIANS)
}

function saveGuardianList(context: PinContext, event: any) {
  return context.data.guardians = event.data;
}

function saveGuardianEntry(context: PinContext, event: any) {
  return context.data.guardians.entry = event.data;
}

async function validateGuardianToAdd(context: PinContext) {
const { data: { guardians: { entry } }, resources: { db }, ussd: { countryCode } } = context;
  const phone = await validateAccount(db, sanitizePhoneNumber(entry, countryCode));
  if (phone) {
    return phone;
  }
  throw new Error("Guardian not found.");
}

function saveGuardianToAdd(context: PinContext, event: any) {
  return context.data.guardians.validatedToAdd = event.data;
}

async function setGuardian(context: PinContext) {
  const { data: { guardians: { validatedToAdd } }, resources: { db, redis }, user: { account: { address, phone_number } } } = context;
  try {
    await Promise.all([
      setAccountMetadata(address, redis, AccountMetadata.GUARDIANS, validatedToAdd),
      addGuardian(db, validatedToAdd, phone_number)
    ]);
  } catch (e) {
    throw new Error("Guardian not added.");
  }
}

async function validateGuardianToRemove(context: PinContext) {
const { data: { guardians: { entry } }, resources: { db }, ussd: { countryCode } } = context;
  const phone = await validateAccount(db, sanitizePhoneNumber(entry, countryCode));
  if (phone) {
    return phone;
  }
  throw new Error("Guardian not found.");
}

function saveGuardianToRemove(context: PinContext, event: any) {
  return context.data.guardians.validatedToRemove = event.data;
}

async function deleteGuardian(context: PinContext) {
  const { data: { guardians: { validatedToRemove } }, resources: { db, redis }, user: { account: { address, phone_number } } } = context;
  const guardians = await getAccountMetadata(address, redis, AccountMetadata.GUARDIANS) as string[];
  const index = guardians.indexOf(validatedToRemove);
  if (index > -1) {
    guardians.splice(index, 1);
  }
  try {
    await Promise.all([
      setAccountMetadata(address, redis, AccountMetadata.GUARDIANS, guardians),
      removeGuardian(db, validatedToRemove, phone_number)
    ]);
  } catch (e) {
    throw new Error("Guardian not removed.");
  }
}
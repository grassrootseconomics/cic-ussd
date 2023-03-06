import { BaseContext, BaseEvent } from "@src/machines/utils";
import { createMachine } from "xstate";

export const mainMenuMachine = createMachine<BaseContext, BaseEvent>({
  id: "mainMenuMachine",
  initial: "mainMenu",
  predictableActionArguments: true,
  states: {
    mainMenu: {
      on: {
        TRANSIT: [
          { target: "transfer", cond: "isOption1" },
          { target: "vouchers", cond: "isOption2" },
          { target: "accountManagement", cond: "isOption3" },
          { target: "help", cond: "isOption4" },
        ]
      },
      description: "User is prompted to select an option."
    },
    transfer: { type: "final" },
    vouchers: { type: "final" },
    accountManagement: { type: "final" },
    help: { type: "final" },
  }
})

export const accountManagementMachine = createMachine<BaseContext, BaseEvent>({
  id: "accountManagementMachine",
  initial: "accountManagementMenu",
  states: {
    accountManagementMenu: {
      on: {
        TRANSIT: [
          { target: "profile", cond: "isOption1" },
          { target: "language", cond: "isOption2" },
          { target: "balances", cond: "isOption3" },
          { target: "statement", cond: "isOption4" },
          { target: "pin", cond: "isOption5" },
        ]
      }
    },
    profile: { type: "final" },
    language: { type: "final" },
    balances: { type: "final" },
    statement: { type: "final" },
    pin: { type: "final" },
  }
})
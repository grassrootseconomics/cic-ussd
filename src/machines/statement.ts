import { createMachine, send } from "xstate";
import { BaseContext, BaseEvent } from "@src/machines/utils";
import { getAccountMetadata, AccountMetadata } from "@lib/ussd/account";

export interface StatementContext extends BaseContext {
  data: {
    statement?: string;
  };
}

type StatementEvent =
  BaseEvent

export const statementMachine = createMachine<StatementContext, StatementEvent>({
  /** @xstate-layout N4IgpgJg5mDOIC5SwC4EMVgLZgHYoFk0BjACwEtcwA6NAVxVIHsAncgL0qgGV1Md8ANXJgA7gGIAQgEEAwgGkA2gAYAuolAAHJrHIpyTXBpAAPRABYArOeoAOAEy2AjE4Bslx-YDsATksAaEABPRABmD2pQ1ysvL3sop1tlawBfFMDUDGw8QhIKKloGZjZOXB4+bKERCQAVACVpADluAEkalXUkEG1dfUNjMwQrGwdnNw8HXwDgiy9Q6lcnGPNbUJ9lczi0jIqBXLJKGnpGVg4uXiy94TFxeqbW9qdOrR09AyMuweG7Rxd3TymgRCCCcoSc1B8kMhzksoTBfks2xAmX4OSIBwKx2KZzKF1RVRud2abUU9me3VefQ+oC+1h+Y3+kz8QMQ9nMrjs0Usvnsrg2vPMSJRlX2+RodFwWNO7EgeJF1wkdQAovUAJodYw9N79T6IVwOajKMHxRbmHxOSyuHwshDOahmqHraIOezKWxC3ZovKHagAGyYaAg509+HEEEMNEoADcmABrGjCvbosV+gNB3EhlAIaNMYgYd4dDVdLVUgaIJwbHwQ5SueyOSyV-42zbg1Zwtm2Zz2RI+Lwey5ejE0f2B4MD0NgFgsVjUTS+jAAM1YWGoicHKZH6fK46zObzVMLak1lPeZZBlertfrjY8NqiHLh7atyXZm1CaXSIFwTAgcGMa-wZNDmPXpT11BAAFpXBtKDDWUeCEMQhC+0-ADRR9LA0EoAg8DoEDtWpUxECmSInA7cxkidUJbDvewqyiGJYh8exLA8bx+3xdDMSKaUx04hV8NLcDzHsZt4kiLkvD5V1bHMaiOJFICCglKUSllTMBOLE8dRpYi-FI8jKJraibRcWwJKsZxZIrOSfAUpNvQKTc+JFQSwN020nCrcxNnWZQXBWS0nGbUIRkk7l9VCYz7PXH00IAGTTSA3J0oiQQ7CF9TiOTVh8VwpObLxlGoALuTNOEvBWFCdh3JSE0zRLAwAMSw31kq00DUsGMiVky2xsuotZ8ugmYEAYhYlgivxfB8KwYsAxyjmIYgmAlFBJH9Yh4wgFLCMGEjjRWCjLComjRrreZbEknxnHym6jQ-FIgA */
  id: "statementMachine",
  initial: "authorizingStatementView",
  predictableActionArguments: true,
  states: {
    mainMenu: {
      type: "final",
      description: "User is returned to the main menu."
    },
    authorizingStatementView: {
      on: {
        BACK: "mainMenu",
        TRANSIT: [
          { target: "loadingStatement", cond: "isAuthorizedStatementView" },
          { target: "unauthorizedStatementView", cond: "!isBlocked", actions: "updateAttempts" },
          { target: "accountBlocked" }
        ]
      },
      description: "User is prompted to enter their pin to view their statement."
    },
    unauthorizedStatementView: {
      entry: send( { type: "RETRY", feedback: "unauthorizedStatementView" } ),
      on: {
        RETRY: "authorizingStatementView"
      }
    },
    loadingStatement: {
      invoke: {
        src: "loadStatement",
        onDone: { target: "statementLoaded", actions: "saveStatement" },
        onError: { target: "statementLoadFailed", actions: "updateErrorMessages" }
      },
      description: "Loads the user's statement."
    },
    statementLoaded: {
      type: "final",
      description: "Statement was successfully loaded."
    },
    statementLoadFailed: {
      type: "final",
      description: "Statement load failed."
    },
    accountBlocked: {
      type: "final",
      description: "Account is blocked."
    }
  }
})

async function loadStatement(context: StatementContext) {
  const { resources: { redis }, user: { account: { address } } } = context;
  return await getAccountMetadata(address, redis, AccountMetadata.STATEMENT);
}

function saveStatement(context: StatementContext, event: any) {
  return context.data.statement = event.data;
}
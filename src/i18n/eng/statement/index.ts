import type { NamespaceStatementTranslation } from '../../i18n-types';
import eng from '..';
import eng_main from '../main';

const { accountBlocked, exit } = eng
const { mainMenu } = eng_main

const eng_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin: "CON Please enter your PIN to view statement:\n0. Back",
  exit: exit,
  firstTransactionSet: "CON {transactions}\n11.Next\n00. Exit",
  loadError: "END An error occurred while loading your account statement. Please try again later.",
  mainMenu: mainMenu,
  secondTransactionSet: "CON {transactions}\n11. Next\n22. Back\n00. Exit",
  thirdTransactionSet: "CON {transactions}\n22. Back\n00. Exit"
}

export default eng_statement

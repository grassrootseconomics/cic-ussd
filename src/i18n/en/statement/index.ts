import type { NamespaceStatementTranslation } from '../../i18n-types';
import en from '..';

const { accountBlocked, exit } = en

const en_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin:
    "CON Enter your PIN to view your account statement:\n0. Back",
  exit: exit,
  firstTransactionSet:
    "CON {transactions}\n11.Next\n00. Exit",
  loadError:
    "END An error occurred while loading your account statement. Please try again later.",
  mainMenu:
    "CON Balance: {balance|currency} {symbol}\n1. Send\n2. My vouchers\n3. My account\n4. Help",
  secondTransactionSet:
    "CON {transactions}\n11. Next\n22. Back\n00. Exit",
  thirdTransactionSet:
    "CON {transactions}\n22. Back\n00. Exit"
}

export default en_statement

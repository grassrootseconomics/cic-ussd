import type { NamespaceStatementTranslation } from '../../i18n-types'

const en_statement = {
  accountBlocked:
    "END Your account is blocked. For assistance, please call: {supportPhone}.",
  enteringPin:
    "CON Enter your PIN to view your account statement:\n0. Back",
  exit:
    "END Thank you for using Sarafu.",
  firstTransactionSet:
    "CON {transactions}\n\n11.Next\n00. Exit",
  loadError:
    "END An error occurred while loading your account statement. Please try again later.",
  mainMenu:
    "CON Balance: {balance|currency} {symbol}\n1. Send\n2. My vouchers\n3. My account\n4. Help",
  secondTransactionSet:
    "CON {transactions}\n\n11. Next\n22. Back\n00. Exit",
  thirdTransactionSet:
    "CON {transactions}\n\n22. Back\n00. Exit"

} satisfies NamespaceStatementTranslation

export default en_statement

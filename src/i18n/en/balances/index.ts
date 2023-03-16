import type { NamespaceBalancesTranslation } from '../../i18n-types'

const en_balances = {
  accountBlocked:
    "END Your PIN has been blocked. For assistance please call: {supportPhone}.",
  balancesMenu:
    "CON My balance\n1. My balance\n2. Community balance\n0. Back",
  enteringPinA:
    "CON Please enter your PIN:\n0. Back",
  enteringPinC:
    "CON Please enter your PIN:\n0. Back",
  exit:
    "END Thank you for using Sarafu. Goodbye.",
  loadAError:
    "END There was an error loading your balance. Please try again later.",
  loadCError:
    "END There was an error loading your community balance. Please try again later.",
  loadedASuccess:
    "CON Your balance is {balance|currency} {symbol}.\n0. Back\n9. Exit",
  loadedCSuccess:
    "CON Your community is {balance|currency} {symbol}.\n0. Back\n9. Exit",

} satisfies NamespaceBalancesTranslation

export default en_balances

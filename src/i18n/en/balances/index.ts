import type { NamespaceBalancesTranslation } from '../../i18n-types';
import en from '..';

const { accountBlocked, exit } = en

const en_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON My balance\n1. My balance\n2. Community balance\n0. Back',
  enteringPinA:
    'CON Please enter your PIN:\n0. Back',
  enteringPinC:
    'CON Please enter your PIN:\n0. Back',
  exit: exit,
  fetchError:
    'END There was an error loading your community balance. Please try again later.',
  fetchSuccess:
    'CON Your community balance is: {balance|currency} {symbol}.\n0. Back\n9. Exit',
  loadError:
    'END There was an error loading your balance. Please try again later.',
  loadSuccess:
    'CON Your balance is: {balance|currency} {symbol}.\n0. Back\n9. Exit',
}

export default en_balances

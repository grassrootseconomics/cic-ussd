import { NamespaceBalancesTranslation } from '../../i18n-types';
import swa from '..';

const { accountBlocked, exit } = swa

const swa_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON Salio:\n1. Salio langu\n2. Salio la kikundi\n0. Rudi',
  enteringPinA:
    'CON Tafadhali weka PIN yako:\n0. Rudi',
  enteringPinC:
    'CON Tafadhali weka PIN yako:\n0. Rudi',
  exit: exit,
  fetchError:
    'END Tatizo limetokea wakati wa kuangalia salio la kikundi. Tafadhali jaribu tena baadaye.',
  fetchSuccess:
    'CON Salio la kikundi ni: {balance|currency} {symbol}.\n0. Rudi\n9. Ondoka',
  loadError:
    'END Tatizo limetokea wakati wa kuangali salio lako. Tafadhali jaribu tena baadaye.',
  loadSuccess:
    'CON Salio lako ni: {balance|currency} {symbol}\n0. Rudi\n9. Ondoka'
}

export default swa_balances

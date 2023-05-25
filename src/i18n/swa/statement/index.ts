import { NamespaceStatementTranslation } from '../../i18n-types';
import swa from '..';
import swa_main from '../main';

const { accountBlocked, exit } = swa
const { mainMenu } = swa_main

const swa_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin:
    "CON Tafadhali weka PIN yako kuona taarifa ya matumizi\n0. Rudi",
  exit: exit,
  firstTransactionSet:
    "CON {transactions}\n0. Rudi\n11.Mbele\n00. Ondoka",
  loadError:
    "END Tatizo limetokea wakati wa kuangalia taarifa ya akaunti yako. Tafadhali jaribu tena baadaye.",
  mainMenu: mainMenu,
  secondTransactionSet:
    "CON {transactions}\n11. Mbele\n22. Rudi\n00. Ondoka",
  thirdTransactionSet:
    "CON {transactions}\n22. Nyuma\n00. Ondoka"
}

export default swa_statement
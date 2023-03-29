import { NamespaceStatementTranslation } from '../../i18n-types';
import sw from '..'
const { accountBlocked, exit } = sw

const sw_statement = {
  accountBlocked: accountBlocked,
  enteringPin:
    "CON Weka PIN kuona taarifa ya akaunti yako:\n0. Rudi",
  exit: exit,
  firstTransactionSet:
    "CON {transactions}\n11.Mbele\n00. Ondoka",
  loadError:
    "END Kosa limetokea wakati wa kuangalia taarifa ya akaunti yako. Tafadhali jaribu tena baadaye.",
  mainMenu:
    "CON Salio: {balance|currency} {symbol}\n1. Tuma\n2. Sarafu yangu\n3. Akaunti yangu\n4. Usaidizi",
  secondTransactionSet:
    "CON {transactions}\n11. Mbele\n22. Nyuma\n00. Ondoka",
  thirdTransactionSet:
    "CON {transactions}\n22. Nyuma\n00. Ondoka"

} as NamespaceStatementTranslation

export default sw_statement
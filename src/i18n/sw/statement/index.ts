import {NamespaceStatementTranslation} from "../../i18n-types";

const sw_statement = {
  accountBlocked:
    "END Akaunti yako imefungwa. Kwa usaidizi, tafadhali piga simu kwa: {supportPhone}.",
  enteringPin:
    "CON Weka PIN kuona taarifa ya akaunti yako:\n0. Rudi",
  exit:
    "END Asante kwa kutumia huduma ya Sarafu.",
  firstTransactionSet:
    "CON {transactions}\n\n11.Mbele\n00. Ondoka",
  loadError:
    "END Kosa limetokea wakati wa kuangalia taarifa ya akaunti yako. Tafadhali jaribu tena baadaye.",
  mainMenu:
    "CON Salio: {balance|currency} {symbol}\n1. Tuma\n2. Sarafu yangu\n3. Akaunti yangu\n4. Usaidizi",
  secondTransactionSet:
    "CON {transactions}\n\n11. Mbele\n22. Nyuma\n00. Ondoka",
  thirdTransactionSet:
    "CON {transactions}\n\n22. Nyuma\n00. Ondoka"

} as NamespaceStatementTranslation

export default sw_statement
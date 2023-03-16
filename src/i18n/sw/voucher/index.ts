import {NamespaceVoucherTranslation} from "../../i18n-types";

const sw_voucher = {
  voucherMenu:
    "CON Sarafu yangu\n1. Chagua Sarafu\n2. Maelezo ya Sarafu\n0. Rudi",
  selectingVoucher:
    "CON Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n\n0. Rudi\n11. Mbele\n00. Ondoka",
  secondSet:
    "CON Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n\n11. Mbele\n22. Rudi\n00. Ondoka",
  thirdSet:
    "CON Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n\n22. Rudi\n00. Ondoka",
  enteringPin:
    "CON Weka PIN ili kuthibitisha chaguo:\n{symbol} {name}\n{contact} {location}\n{description}\n\n0. Rudi\n00. Ondoka",
  setSuccess:
    "CON Hongera! {symbol} ni Sarafu inayotumika sasa.\n0. Rudi \n9. Ondoka",
  setError:
    "END Kulikuwa na tatizo kwa kuchagua Sarafu. Jaribu tena baadaye.",
  voucherDetails:
    "CON {symbol} {name}\n{contact} {location}\n{description}\n\n0. Rudi",
  accountBlocked:
    "END PIN yako imefungwa. Kwa usaidizi tafadhali piga simu kwa: {supportPhone}.",
  exit:
    "END Asante kwa kutumia huduma ya Sarafu. Kwaheri.",


} satisfies NamespaceVoucherTranslation

export default sw_voucher;
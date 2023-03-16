import {NamespaceVoucherTranslation} from "../../i18n-types";

const en_voucher = {
  voucherMenu:
    "CON My voucher\n1. Select voucher\n2. Voucher details\n0. Back",
  selectingVoucher:
    "CON Select number or symbol from your vouchers:\n{vouchers}\n0. Back\n\n11. Next\n00. Exit",
  secondSet:
    "CON Select number or symbol from your vouchers:\n{vouchers}\n\n11. Next\n22. Back\n00. Exit",
  thirdSet:
    "CON Select number or symbol from your vouchers:\n{vouchers}\n\n22. Back\n00. Exit",
  enteringPin:
    "CON Enter PIN to confirm selection:\n{symbol} {name}\n{contact} {location}\n{description}\n\n0. Back\n00. Exit",
  setSuccess:
    "CON Success! {symbol} is now your active voucher.\n0. Back \n9. Exit",
  setError:
   "END There was an error setting your voucher. Please try again later.",
  voucherDetails:
    "CON {symbol} {name}\n{contact} {location}\n{description}\n\n0. Back",

  accountBlocked:
        "END Your PIN has been blocked. For assistance please call: {supportPhone}.",
  exit:
    "END Thank you for using Sarafu. Goodbye.",

} satisfies NamespaceVoucherTranslation

export default en_voucher;
import { NamespaceVoucherTranslation } from '../../i18n-types';
import en from '..'
const { accountBlocked, exit } = en

const en_voucher = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n\n0. Back',
  enteringPin:
    'CON Enter PIN to confirm selection:\n{symbol} {name}\n{contact} {location}\n{description}\n\n0. Back\n00. Exit',
  exit: exit,
  firstVoucherSet:
    'CON Select number or symbol from your vouchers:\n{vouchers}\n0. Back\n\n11. Next\n00. Exit',
  secondVoucherSet:
    'CON Select number or symbol from your vouchers:\n{vouchers}\n\n11. Next\n22. Back\n00. Exit',
  setError:
    'END There was an error setting your voucher. Please try again later.',
  setSuccess:
    'CON Success! {symbol} is now your active voucher.\n0. Back \n9. Exit',
  thirdVoucherSet:
    'CON Select number or symbol from your vouchers:\n{vouchers}\n\n22. Back\n00. Exit',
  voucherMenu:
    'CON My voucher\n1. Select voucher\n2. Voucher details\n0. Back'

} satisfies NamespaceVoucherTranslation

export default en_voucher;
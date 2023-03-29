import { NamespaceVoucherTranslation } from '../../i18n-types';
import en from '..'
import en_main from '../../en/main';

const { accountBlocked, exit } = en
const { mainMenu } = en_main

const en_voucher = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Back',
  enteringPin:
    'CON Enter PIN to confirm selection:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Back\n00. Exit',
  exit: exit,
  firstVoucherSet:
    'CON Select number or symbol from your vouchers:\n{vouchers}\n0. Back\n11. Next\n00. Exit',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON Select number or symbol from your vouchers:\n{vouchers}\n11. Next\n22. Back\n00. Exit',
  setError:
    'END There was an error setting your voucher. Please try again later.',
  setSuccess:
    'CON Success! {symbol} is now your active voucher.\n0. Back \n9. Exit',
  thirdVoucherSet:
    'CON Select number or symbol from your vouchers:\n{vouchers}\n22. Back\n00. Exit',
  voucherMenu:
    'CON My voucher\n1. Select voucher\n2. Voucher details\n0. Back'

} satisfies NamespaceVoucherTranslation

export default en_voucher;
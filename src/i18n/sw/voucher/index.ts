import { NamespaceVoucherTranslation } from '../../i18n-types';
import sw from '..'
import sw_main from '../../sw/main';

const { accountBlocked, exit } = sw
const { mainMenu } = sw_main

const sw_voucher = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Rudi',
  enteringPin:
    'CON Weka PIN ili kuthibitisha chaguo:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Rudi\n00. Ondoka',
  exit: exit,
  firstVoucherSet:
    'CON Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n0. Rudi\n11. Mbele\n00. Ondoka',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n11. Mbele\n22. Rudi\n00. Ondoka',
  setError:
    'END Kulikuwa na tatizo kwa kuchagua Sarafu. Jaribu tena baadaye.',
  setSuccess:
    'CON Hongera! {symbol} ni Sarafu inayotumika sasa.\n0. Rudi \n9. Ondoka',
  thirdVoucherSet:
    'CON Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n22. Rudi\n00. Ondoka',
  voucherMenu:
    'CON Sarafu yangu\n1. Chagua Sarafu\n2. Maelezo ya Sarafu\n0. Rudi'


} satisfies NamespaceVoucherTranslation

export default sw_voucher;
import type { NamespaceVoucherTranslation } from '../../i18n-types'
import gax from '..';
import gax_main from '../main';

const { accountBlocked, exit } = gax
const { mainMenu } = gax_main

const gax_voucher: NamespaceVoucherTranslation = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Dheebi',
  enteringPin:
    'CON Pin kake khai:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Dheebi\n00. Bai',
  exit: exit,
  firstVoucherSet:
    'CON Namba Chaguad fulaa balans kake:\n{vouchers}\n0. Dheebi\n11. Dhuur\n00.Bai',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON Namba Chaguad fulaa balans kake:\n{vouchers}\n11. Dhuur \n22.Waan Dabraan\n00.Bai',
  setError:
    'END Dibaa jir fulaa vocha chaguan. Saadhi garii itdheebi.',
  setSuccess:
    'CON yadandeeth! {symbol} Sarafu kake.\n0. Dheebi\n9.Bai',
  thirdVoucherSet:
    'CON Namba Chaguad fulaa balans kake:\n{vouchers}\n22.Waan Dabraan\n00. Bai',
  voucherMenu:
    'CON Vocha khiy\n1. Vocha chaguad\n2. Wanni Vocha\n0. Dheebi'
}

export default gax_voucher

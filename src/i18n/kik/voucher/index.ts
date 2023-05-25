import type { NamespaceVoucherTranslation } from '../../i18n-types'
import kik from '..'
import kik_main from '../main'

const { accountBlocked, exit } = kik
const { mainMenu } = kik_main

const kik_voucher: NamespaceVoucherTranslation = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Coka',
  enteringPin:
    'CON Ikira pin yaku gucaghura:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Thutha\n00. Uma',
  exit: exit,
  firstVoucherSet:
    'CON Cagura namba kana kionereria hari matigari maku:\n{vouchers}\n0. Coka thutha\n11. Mbere\n00. Uma',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON Cagura namba kana kionereria hari matigari maku:\n{vouchers}\n11. Mbere\n22. Coka thutha\n00. Uma',
  setError:
    'END Nikuma na thina wa gucagura Vocha. Geria ringi thutha wa dakika nini.',
  setSuccess:
    'CON Niwahota! {symbol} Sarafu ciaku ni\n0. Thutha\n9. Uma',
  thirdVoucherSet:
    'CON Cagura namba kana kionereria hari matigari maku:\n{vouchers}\n22. Mbere\n00. Uma',
  voucherMenu:
    'CON Vocha ciakwa \n1. Cagura Vocha \n2. Uhoro wa Vocha \n0. Coka'
}

export default kik_voucher

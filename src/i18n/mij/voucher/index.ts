import type { NamespaceVoucherTranslation } from '../../i18n-types'
import mij from '..'
import mij_main from '../main'

const { accountBlocked, exit } = mij
const { mainMenu } = mij_main

const mij_voucher: NamespaceVoucherTranslation = {
  accountBlocked: accountBlocked,
  displayVoucherInfo: 'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Uya nyuma',
  enteringPin: 'CON Ika piniyo kutsagula Sarafu:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Uya Nyuma\n00. Ombola',
  exit: exit,
  firstVoucherSet: 'CON Tsagula Sarafu:\n{vouchers}\n0. Uya Nyuma\n11. Nyuma\n00. Ombola',
  mainMenu: mainMenu,
  secondVoucherSet: 'CON Tsagula Sarafu:\n{vouchers}\n11. Uya Nyuma\n22. Uya Nyuma\n00. Ombola',
  setError: 'END Kukala na makosa kwenye kutengenezerwa Vochayo, tafathali jeza kaheri badaye.',
  setSuccess: 'CON uweza {symbol} ndo sazoro rihumikanaro.\n0. Uya nyuma\n9. Ombola',
  thirdVoucherSet: 'CON Tsagula Sarafu:\n{vouchers}\n22. Uya Nyuma\n00. Ombola',
  voucherMenu: 'CON Voucha ya kwangu \n1. Tsagula Voucha \n2. Maelezo ga Voucha \n0. Uya'
}

export default mij_voucher

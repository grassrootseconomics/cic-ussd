import type { NamespaceVoucherTranslation } from '../../i18n-types'
import luo from '..'
import luo_main from '../main'

const { accountBlocked, exit } = luo
const { mainMenu } = luo_main

const luo_voucher: NamespaceVoucherTranslation = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Chien',
  enteringPin:
    'CON Ket namba ni mopondo mondo iyier:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Chien\n00. Wuok',
  exit: exit,
  firstVoucherSet:
    'CON xxxxxxxxxxxxx:\n{vouchers}\n0. Chien\n11. Nyime\n00. Wuok',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON xxxxxxxxxxxxx:\n{vouchers}\n11. Nyime\n22. Chien\n00. Wuok',
  setError:
    ' END Ntie chandruok e keto omenda mari. Tem kendo bange.',
  setSuccess:
    'CON Kwayo mari odhi kare! {symbol} e Sarafu ni modong\n0. Chien\n9. Wuok',
  thirdVoucherSet:
    'CON xxxxxxxxxxxxx:\n{vouchers}\n22. Chien\n00. Wuok',
  voucherMenu:
    'CON xxxxxxxxxxxx\n1. xxxxxxxxx\n2. xxxxxxxxxx\n0. Chien'
}

export default luo_voucher

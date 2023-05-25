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
    'CON Yier namba e vocha ni ir vocha mantie:\n{vouchers}\n0. Chien\n11. Nyime\n00. Wuok',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON Yier namba e vocha magi:\n{vouchers}\n11. Nyime\n22. Chien\n00. Wuok',
  setError:
    ' END Ntie chandruok e keto omenda mari. Tem kendo bange.',
  setSuccess:
    'CON Kwayo mari odhi kare! {symbol} e Sarafu ni modong\n0. Chien\n9. Wuok',
  thirdVoucherSet:
    'CON Yier namba e vocha magi:\n{vouchers}\n22. Chien\n00. Wuok',
  voucherMenu:
    'CON Vocha maga\n1. Yier vocha\m2. Gik ma ntie e vocha\n0. Chien'
}

export default luo_voucher

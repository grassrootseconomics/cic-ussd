import type { NamespaceBalancesTranslation } from '../../i18n-types'
import luo from '..'

const { accountBlocked, exit } = luo

const luo_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON Omenda modong,\n1. Pes anywola \n2. Modong\n0. Chien',
  enteringPinA:
    'CON  Kiyie to ket PIN mondo ine modong\'\n0. Chien',
  enteringPinC:
    'CON  Kiyie to ket PIN mondo ine modong\'\n0. Chien',
  exit: exit,
  fetchError:
    'END Nitie chandruok e aguch anyuola tem kendo.',
  fetchSuccess:
    'CON Balang mar anyuola ni en {balance|currency} {symbol}\n0. Chien\n9. Wuok',
  loadError:
    'END Ntie chandruok e golo omenda mari modong. Tem kendo',
  loadSuccess:
    'CON Omenda mari en {balance|currency}{symbol}\n0. Chien \n9. Wuok'
}

export default luo_balances

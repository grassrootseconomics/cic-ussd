import type { NamespaceBalancesTranslation } from '../../i18n-types'
import kik from '..'

const { accountBlocked, exit } = kik

const kik_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON Matigari\n1. Matigari makwa\n2. Matigari ma gikundi\n0. Coka thutha',
  enteringPinA:
    'CON Ikera pin yaku kuona matigari maku\n0. Thutha',
  enteringPinC:
    'CON Ikera pin yaku kuona matigari maku\n0. Thutha',
  exit: exit,
  fetchError:
    'END Thina waumana ihinda ria kurora matigari ma gikundi. Ndakwihoya ugerie ringi thutha wa dagika nini',
  fetchSuccess:
    'CON Matigari ma gikundi ni {balance|currency} {symbol}\n0. Coka thutha\n9. Uma',
  loadError:
    'END Kuma na thina kuonania matigari maku geria ringi.',
  loadSuccess:
    'CON Matigari maku ni {balance|currency} {symbol}\n0. Coka thutha\n9. Ehera'
}

export default kik_balances

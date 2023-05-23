import type { NamespaceBalancesTranslation } from '../../i18n-types'
import gax from '..'

const { accountBlocked, exit } = gax

const gax_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON Balansi Kiy/tiy\n1. Balansi kiyh\n2. Balansi ka kukubi\n0. Dheebi',
  enteringPinA:
    'CON Pinkekhai  ak balansi kake lalt\n0. Dheebi',
  enteringPinC:
    'CON Pinkekhai  ak balansi kake lalt\n0. Dheebi',
  exit: exit,
  fetchError:
    'END Saadhii balans kukubi lalt dibii yabaat. Saadhii garii itdheebi',
  fetchSuccess:
    'CON Balansi kukubi akkan {balance|currency} {symbol}\n0. Dheebi\n9. Bai',
  loadError:
    'END Dibii ya baat oja balans kake laalu feet. Saadhii garii itdheebi.',
  loadSuccess:
    'CON balans kake akan {balance|currency} {symbol}{symbol}\n0. Dheebi\n9. Bai'
}

export default gax_balances

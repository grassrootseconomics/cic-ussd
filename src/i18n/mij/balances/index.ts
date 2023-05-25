import type { NamespaceBalancesTranslation } from '../../i18n-types'
import mij from '..'

const { accountBlocked, exit } = mij

const mij_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON Salio rangu\n1. Salio rangu \n2. Salio ra Chikundi \n0. Uya',
  enteringPinA:
    'CON Unavoywa piniyo kulola Sazoro\n0. Uya nyuma',
  enteringPinC:
    'CON Unavoywa piniyo kulola Sazoro\n0. Uya nyuma',
  exit: exit,
  fetchError:
    'END tatizo lilaira wakati wa kulola salio ra chikundi. Tafadhali heza tena baadaye',
  fetchSuccess:
    'CON salio ra chikundi ni{balance|currency}{symbol}\n0. Uya \n9. Laa',
  loadError:
    'END Kukala na makosa kwa urehani balansi. Tafadhali jeza kaheri baadaye',
  loadSuccess:
    'CON Saliyoro ni: {balance|currency} {symbol}\n0. Back\n9.  Ombola.'
}

export default mij_balances

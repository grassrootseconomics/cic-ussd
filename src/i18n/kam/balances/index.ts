import type { NamespaceBalancesTranslation } from '../../i18n-types'
import kam from '..'

const { accountBlocked, exit } = kam

const kam_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON Mbalansi:\n1. Mbalansi yakwa\n2.Mbalansi ya njamii\n0. Syoka',
  enteringPinA:
    'CON Kuisya mbalansi ikia PIN yaku\n0. Syoka',
  enteringPinC:
    'CON Kuisya mbalansi ikia PIN yaku\n0. Syoka',
  exit: exit,
  fetchError:
    'END Thina waumila ivinda ya kusisya balanci ya kikundi kwawenyivyo tata ingi kavindane kangi.',
  fetchSuccess:
   'CON Mbalansi ya kikindi: {balance|currency} {symbol}.\n0. Syoka\n9. Uma',
  loadError:
    'END Thina waumila ivinda ya kusisya balanci ya kikundi kwawenyivyo tata ingi kavindane kangi.',
  loadSuccess:
    'CON Mbalansi yaku: {balance|currency} {symbol}.\n0. Syoka\n9. Uma'
}

export default kam_balances
import type { NamespaceStatementTranslation } from '../../i18n-types'
import kam from '..'
import kam_main from '../main'

const { accountBlocked, exit } = kam
const { mainMenu } = kam_main

const kam_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin: 'CON Ikia PIN yaku kwona welesyo wa utumii\n0. Syoka',
  exit: exit,
  firstTransactionSet: 'CON {transactions}\n11. Mbee\n00. Uma',
  loadError: 'END Thina waumela ivinda ya kusisya utomei wa voucher, tata ingi kavinda kangi.',
  mainMenu: mainMenu,
  secondTransactionSet: 'CON {transactions}\n11. Mbee\n22. Syoka',
  thirdTransactionSet: 'CON {transactions}\n22. Syoka\n00. Uma'
}

export default kam_statement
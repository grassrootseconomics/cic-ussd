import type { NamespaceStatementTranslation } from '../../i18n-types'
import mij from '..'
import mij_main from '../main'

const { accountBlocked, exit } = mij
const { mainMenu } = mij_main

const mij_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin:
    'CON Unavoywa piniyo kupata maerezo mahumizi Gako.\n0. Uya Nyuma',
  exit: exit,
  firstTransactionSet:
    'CON {transactions}\n0. Uma nyuma\n11. Mbere\n00. Ombola',
  loadError:
    'END Kosa lilaira wakati wa kulola taarifa za akauntu ya kwako tafadhali heza tena baaadaye.',
  mainMenu: mainMenu,
  secondTransactionSet:
    'CON {transactions}\n11. Mbere\n22. Uya nyuma\n00. Ombola',
  thirdTransactionSet:
    'CON {transactions}\n22. Uya Nyuma\n00.Ombola'
}

export default mij_statement

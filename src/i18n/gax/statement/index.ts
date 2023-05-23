import type { NamespaceStatementTranslation } from '../../i18n-types'
import gax from '..'
import gax_main from '../main'

const { accountBlocked, exit } = gax
const { mainMenu } = gax_main

const gax_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin:
    'CON Tafadhali pin kake kekhai odhuu jalkaba lalaad.\n0. Dheebi',
  exit: exit,
  firstTransactionSet:
    'CON {transactions}\n0. Dheebi\n11. Dhuur\n00. Bai',
  loadError:
    'END Dibii ya bae oja taarifa akaunt keet lalt Saadhi garii itdheebi.',
  mainMenu: mainMenu,
  secondTransactionSet:
    'CON {transactions}\n11. Dhuur\n22. Waan dhabran\n00. Bai',
  thirdTransactionSet:
    'CON {transactions}\n22. Waan dharban\n00. Bai'
}

export default gax_statement

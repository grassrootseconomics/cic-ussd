import type { NamespaceStatementTranslation } from '../../i18n-types'
import kik from '..'
import kik_main from '../main';

const { accountBlocked, exit } = kik
const { mainMenu } = kik_main

const kik_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin:
    'CON Ikera PIN yaku kuona rugano rwa mahuthira maku\n0. Coka',
  exit: exit,
  firstTransactionSet:
    'CON {transactions}\n11. Mbere\n00. Ehera',
  loadError:
    'CON Kuma thina kuonania rugano rwa akaunti yaku. Geria ringi thutha wa dakika nini.',
  mainMenu: mainMenu,
  secondTransactionSet:
    'CON {transactions}\n11. Mbere\n22. Coka\n00. Ehera',
  thirdTransactionSet:
    'CON {transactions}\n22. Coka\n00. Ehera'
}

export default kik_statement

import type { NamespaceStatementTranslation } from '../../i18n-types'
import luo from '..'
import luo_main from '../main'

const { accountBlocked, exit } = luo
const { mainMenu } = luo_main

const luo_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin:
    'CON Kiyie to ket PIN mondo ine chenro.\n0. Chien',
  exit: exit,
  firstTransactionSet:
    'CON {transactions}\n0. Chien\n11. Nyime\n00. Wuok',
  loadError:
    'END Chandruok obiro ikelo ranyis mar omenda mari. Tem kendo bange',
  mainMenu: mainMenu,
  secondTransactionSet:
    'CON {transactions}\n11. Nyime\n22. Mokalo\n00. Wuok',
  thirdTransactionSet:
    'CON {transactions}\n22. Mokalo\n00. Wuok'
}

export default luo_statement

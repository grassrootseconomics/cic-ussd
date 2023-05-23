import type { NamespaceStatementTranslation } from '../../i18n-types'
import fra from '..'
import fra_main from '../main'

const { accountBlocked, exit } = fra
const { mainMenu } = fra_main

const fra_statement: NamespaceStatementTranslation = {
  accountBlocked: accountBlocked,
  enteringPin:
    'CON Entrez votre code PIN to consulter les dernieres transactions\n0. Retour',
  exit: exit,
  firstTransactionSet:
    'CON {transactions}\n0. Retour\n11. Suivant\n00. Quitter',
  loadError: 'END Une erreur s\'est produite lors du chargement de votre relevé de compte Veuillez réessayer plus tard',
  mainMenu: mainMenu,
  secondTransactionSet:
    'CON {transactions}\n11. Suivant\n22. Precedent\n00. Quitter',
  thirdTransactionSet:
    'CON {transactions}\n22. Precedent\n00. Quitter'
}

export default fra_statement

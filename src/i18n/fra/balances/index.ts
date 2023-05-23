import type { NamespaceBalancesTranslation } from '../../i18n-types'
import fra from '..'

const { accountBlocked, exit } = fra

const fra_balances: NamespaceBalancesTranslation = {
  accountBlocked: accountBlocked,
  balancesMenu:
    'CON Solde\n1. Mon solde\n2. Solde de tresor communautaire',
  enteringPinA:
    'CON Entrez votre code PIN to consulter votre solde\n0. Retour',
  enteringPinC:
    'CON Entrez votre code PIN to consulter votre solde\n0. Retour',
  exit: exit,
  fetchError:
    'END Une erreur s\'est produite lors du chargement de votre solde communautaire. Veuillez réessayer plus tard.',
  fetchSuccess:
    'CON Votre solde communautaire est {balance|currency} {symbol}\n0. Retour\n9. Quitter',
  loadError:
    'END Une erreur s\'est produite lors du chargement de votre solde. Veuillez réessayer plus tard.',
  loadSuccess:
    'CON Votre solde est {balance|currency} {symbol}\n0. Retour\n9. Quitter'
}

export default fra_balances

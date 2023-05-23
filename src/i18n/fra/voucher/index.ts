import type { NamespaceVoucherTranslation } from '../../i18n-types'
import fra from '..';
import fra_main from '../main';

const { accountBlocked, exit } = fra
const { mainMenu } = fra_main

const fra_voucher: NamespaceVoucherTranslation = {
  accountBlocked: accountBlocked,
  displayVoucherInfo:
    'CON {symbol} {name}\n{contact} {location}\n{description}\n0. Retour',
  enteringPin:
    'CON Entrez le code PIN pour confirmer la sélection:\n{symbol} {name}\n{contact} {location}\n{description}\n0. Retour\n00. Sortie',
  exit: exit,
  firstVoucherSet:
    'CON Sélectionnez le numéro ou le symbole de vos bons:\n{vouchers}\n0. Retour\n11. Suivant\n00. Sortie',
  mainMenu: mainMenu,
  secondVoucherSet:
    'CON Sélectionnez le numéro ou le symbole de vos bons:\n{vouchers}\n11. Suivant\n22. Retour\n00. Sortie',
  setError:
    'END ',
  setSuccess:
    'CON Succès! {symbol} est maintenant votre bon actif.\n0. Retour \n9. Sortie',
  thirdVoucherSet:
    'CON Sélectionnez le numéro ou le symbole de vos bons:\n{vouchers}\n22. Retour\n00. Sortie',
  voucherMenu:
    ' CON Mon bon\n1. Sélectionnez le bon\n2. Détails du bon\n0. Retour'
}

export default fra_voucher

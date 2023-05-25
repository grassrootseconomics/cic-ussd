import type { NamespaceFeedbackTranslation } from '../../i18n-types'
import fra from '..'

const { accountBlocked } = fra

const fra_feedback: NamespaceFeedbackTranslation = {
  accountBlocked: accountBlocked,
  invalidAmount:
    'CON Le montant que vous avez entré est supérieur à votre solde ou n\'est pas valide Veuillez réessayer\n0. Retour',
  invalidGenderOption:
    'CON Votre option de sexe n\'est pas valide Veuillez réessayer\n1. Homme\n2. Femme\n3. Autre\n0. Retour',
  invalidLanguageOption:
    'CON L\'option de langue n\'est pas valide Veuillez réessayer\n{languages}\n0. Retour\n00. Quitter\n11. Suivant',
  invalidLocationOption:
    'CON L\'emplacement saisi n\'est pas valide Veuillez réessayer\n0. Retour',
  invalidMarketplaceEntry:
    'CON Les services ou biens que vous avez saisis ne sont pas valides. Veuillez réessayer',
  invalidName:
    'CON Le nom que vous avez saisi n\'est pas valide. Veuillez réessayer\n0. Retour',
  invalidNewPin:
    'CON Le code PIN que vous avez saisi n\'est pas valide Le NIP doit être différent de votre NIP actuel. Pour obtenir de l\'aide, appelez {supportPhone|phone}\n0 Retour',
  invalidPin:
    'CON Votre code PIN est incorrect, il vous reste {remainingAttempts} tentatives\n0. Retour',
  invalidPinAtRegistration:
    'CON Le code PIN que vous avez saisi n\'est pas valide Le code PIN doit être composé de 4 chiffres Pour obtenir de l\'aide, appelez {supportPhone|phone}\n00 Quitter',
  invalidPinPC:
    'CON Votre code PIN est incorrect, il vous reste {remainingAttempts} tentatives\n0. Retour',
  invalidPinPV:
    'CON Votre code PIN est incorrect, il vous reste {remainingAttempts} tentatives\n0. Retour',
  invalidVoucher:
    'CON L\'option de bon n\'est pas valide Veuillez réessayer\n{vouchers}\n0. Retour\n11. Suivant\n00. Quitter',
  invalidYOBEntry:
    'CON L\'année de naissance que vous avez saisie n\'est pas valide Veuillez réessayer\n0. Retour',
  pinMismatch:
    'CON Le nouveau code PIN ne correspond pas à celui que vous avez entré Veuillez réessayer Pour obtenir de l\'aide, appelez {supportPhone|phone}\n0. Retour'
}

export default fra_feedback

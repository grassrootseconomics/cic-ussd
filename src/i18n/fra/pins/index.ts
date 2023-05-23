import type { NamespacePinsTranslation } from '../../i18n-types'
import fra from '..'

const { accountBlocked, exit } = fra

const fra_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Confirmez votre nouveau code PIN:\n0. Retour',
  enteringNewPin:
    'CON Saisissez un nouveau code PIN à 4 chiffres:\n0. Retour',
  enteringOldPin:
    'CON Entrez votre ancien PIN:\n0. Retour',
  enteringPinWR:
    'CON Saisir votre PIN pour confirmer la reinitialisation de{ward}\n0. Retour',
  enteringWard:
    'CON Saisir le numero de telephone que vous parrainez\n0. Retour',
  exit: exit,
  pinChangeError:
    'END Une erreur s\'est produite lors de la modification de votre PIN. Veuillez réessayer plus tard.',
  pinChangeSuccess:
    'CON Votre demande de changement de code PIN a été acceptée.\n0. Retour\n9. Quitter',
  pinManagementMenu:
    'CON Gestion du code\n1. Changer mon code PIN\n2. Reinitialiser mon code PIN\n3. Sauvegarde mon code PIN\n0. Retour',
  socialRecoveryMenu:
    'CON PIN parrain\n1. Ajouter\n2. Retirer\n3. Consulter\n0. Retour',
  wardResetError:
    'END Une erreur s\'est produite lors de la réinitialisation du code PIN {ward}.',
  wardResetSuccess:
    'CON Votre demande de réinitialisation du code PIN {ward} a été envoyée.\n0. Retour\n9. Quitter'
}

export default fra_pins

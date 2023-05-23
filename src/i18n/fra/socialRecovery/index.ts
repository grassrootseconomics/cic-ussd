import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types'
import fra from '..'
import fra_pins from '../pins';

const { accountBlocked, exit } = fra
const { pinManagementMenu } = fra_pins

const fra_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove:
    'CON Saisir un numero de telephone pour revoquer le parrainage:\n0. Retour',
  enteringNewGuardian:
    'CON Ajouter un numero parrain pour la reinitialisation de votre code PIN\n0. Retour',
  enteringPinAG:
    'CON Saisir votre pin pour enregistrer {guardian} comme votre parrain reinitialisation code PIN\n0. Retour',
  enteringPinRG:
    'CON Entre votre code pin pour retirer {guardian} comme votre parrain reinitialisation code PIN\n0. Retour',
  enteringPinVG:
    'CON Saisir le code PIN pour consulter la liste des parrains\n0. Retour',
  exit: exit,
  firstGuardiansSet:
    'CON Parrains:\n{guardians}\n0. Retour\n11. Suivant\n00. Quitter',
  guardianAdditionError:
    'END Une erreur s\'est produite lors de l\'ajout de {guardian} en tant que tuteur',
  guardianAdditionSuccess:
    'CON {guardian} a été ajouté comme tuteur 0 Retour 9 Quitter',
  guardianRemovalError:
    'END Une erreur s\'est produite lors de la suppression de {guardian} en tant que tuteur',
  guardianRemovalSuccess:
    'CON {guardian} a été supprimé en tant que tuteur\n0. Retour\n9. Quitter',
  loadError:
    'END Une erreur s\'est produite lors du chargement de vos tuteurs Veuillez réessayer plus tard',
  pinManagementMenu: pinManagementMenu,
  secondGuardiansSet:
    'CON Parrains:\n{guardians}\n11. Suivant\n22. Precedent\n00. Quitter',
  socialRecoveryMenu:
    'CON PIN parrain\n1. Ajouter\n2. Retirer\n3. Consulter\n0. Retour',
  thirdGuardiansSet:
    'CON Parrains:\n{guardians}\n22. Precedent\n00. Quitter'
}

export default fra_socialRecovery

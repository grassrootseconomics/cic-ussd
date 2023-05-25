import type { NamespaceProfileTranslation } from '../../i18n-types'
import fra from '..'
import fra_settings from '../settings'

const { accountBlocked, exit } = fra
const { settingsMenu } = fra_settings

const fra_profile: NamespaceProfileTranslation = {
  accountBlocked: accountBlocked,
  authorizingProfileView:
    'CON Veuillez entrer votre code PIN\n0. Retour',
  changeError:
    'END Une erreur s\'est produite lors de la mise à jour de votre profil, veuillez réessayer plus tard.',
  displayingProfile:
    'CON Profil:\n{name}\n{gender}\n{age}\n{location}\n{services}\n0. Retour',
  enteringFamilyName:
    'CON Votre nom\n0. Retour',
  enteringGivenNames:
    'CON Votre prenom\n0. Retour',
  enteringLocation:
    'CON Veuillez saisir le nom de votre village\n0. Retour',
  enteringMarketplace:
    'CON Quel service/ bien vendez-vous\n0. Retour',
  enteringProfileChangePin:
    'CON Entrez votre code PIN\n0. Retour',
  enteringProfileViewPin:
    'CON Entrez votre code PIN\n0. Retour',
  enteringYOB:
    'CON Annee de naissance\n0. Retour',
  exit: exit,
  profileChangeSuccess:
    'CON Mise à jour du profil réussie\n0. Retour\n9. Quitter',
  profileMenu:
    'CON Mon profil\n1. Changer nom\n2. Changer sexe\n3. Changer age\n4. Changer la localite\n5. Changer le service/ produit\n6. Consulter mon profil\n0. Retour',
  selectingGender:
    'CON Sexe\n1. Masculin\n2. Feminin\n3. Autre\n0. Retour',
  settingsMenu: settingsMenu
}
export default fra_profile

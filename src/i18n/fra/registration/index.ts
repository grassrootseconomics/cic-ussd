import type { NamespaceRegistrationTranslation } from '../../i18n-types'
import fra from '..'

const { exit } = fra

const fra_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END Votre demande de création de compte a échoué. Veuillez réessayer plus tard.',
  accountCreationSuccess:
    'END Votre compte est en cours de création. Vous recevrez un SMS lorsque votre compte sera prêt.',
  exit: exit,
  firstLanguageSet:
    'CON Bienvenu(e) sur le reseau Sarafu\nChoisir une langue\n{languages}\n00. Quitter',
  secondLanguageSet:
    'CON Choisir la langue:\n{languages}\n11. Suivant\n22. Retour\n00. Quitter',
  thirdLanguageSet:
    'CON Choisir la langue:\n{languages}\n22. Retour\n00. Quitter'
}

export default fra_registration

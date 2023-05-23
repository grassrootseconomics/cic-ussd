import type { NamespaceLanguagesTranslation } from '../../i18n-types'
import fra from '..'

const { accountBlocked, exit } = fra

const fra_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError:
    'END Une erreur s\'est produite lors du changement de langue, veuillez réessayer plus tard.',
  changeSuccess:
    'CON Votre demande de changement de langue a été acceptée.\n0. Retour\n9. Quitter',
  enteringPin: 'CON Entrez votre code PIN\n0. Retour',
  exit: exit,
  firstLanguageSet:
    'CON Choisir la langue:\n{languages}\n0. Retour\n11. Suivant\n00. Quitter',
  secondLanguageSet:
    'CON Choisir la langue:\n{languages}\n11. Suivant\n22. Precedent\n00. Quitter',
  thirdLanguageSet:
    'CON Choisir la langue:\n{languages}\n22. Precedent\n00. Quitter'
}

export default fra_languages

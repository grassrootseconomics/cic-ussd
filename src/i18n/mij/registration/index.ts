import type { NamespaceRegistrationTranslation } from '../../i18n-types'
import mij from '..'

const { exit } = mij

const mij_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END voyoro rakusajiliwa kariwezere kukamilika. Tafadhali heza tena baadae ',
  accountCreationSuccess:
    'END Akauntiyo ya sarafu idzikoni. Undaphokera  ujumbe wa SMS ichikala tayari.',
  exit: exit,
  firstLanguageSet:
    'CON Karibu Sarafu Network!\n{languages}\n11. Mbere\n00. Ombola',
  secondLanguageSet:
    'CON Tsagula Luga:\n{languages}\n11. Mbere\n22. Uyira ya nyuma\n00. Ombola',
  thirdLanguageSet:
    'CON Tsagula luga:\n{languages}\n22. Uyira ya nyuma\n00. Ombola'
}

export default mij_registration

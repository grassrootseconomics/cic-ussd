import type { NamespaceRegistrationTranslation } from '../../i18n-types'
import luo from '..'

const { exit } = luo

const luo_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END Yawo aguch omenda mari otamre tem kendo bange.',
  accountCreationSuccess:
    'END Akaont ni mar Sarafu iloso. Iboyudo mesej ka akaont ni otieki.',
  exit: exit,
  firstLanguageSet:
    'CON Machiegni e Sarafu Network!\n{languages} \n11. Nyime\n00. Wuok',
  secondLanguageSet:
    'CON Yier dhok:\n{languages}\n11. Nyime\n22. Mokalo\n00. Wuok',
  thirdLanguageSet:
    'CON Yier dhok:\n{languages}\n22. Mokalo\n00. Wuok'
}

export default luo_registration

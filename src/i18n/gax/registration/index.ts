import type { NamespaceRegistrationTranslation } from '../../i18n-types'
import gax from '..'

const { exit } = gax

const gax_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END Kadaan atfeet ya didhan. Saadhii garii itdheebi.',
  accountCreationSuccess:
    'END Akaunt kake ta Sarafu midasaan jiraa.Meseji siergan ojaa tayar taat.',
  exit: exit,
  firstLanguageSet:
    'CON Sarafu Network Diaad!\n{languages}\n11. Dhuur\n00.Bai',
  secondLanguageSet:
    'CON afaan chaguad\n{languages}\n11. Dhuur\n22.Waan dhabran\n00.Bai',
  thirdLanguageSet:
    'CON Afaan chaguad\n{languages}\n22.Dheebi\n00.Bai'
}

export default gax_registration

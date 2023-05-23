import type { NamespaceRegistrationTranslation } from '../../i18n-types'
import kam from '..'

const { exit } = kam

const kam_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END umanyethyo waku wa kuiandikithya timwailu kwawenyivyo tata ingi kavinda kange.',
  accountCreationSuccess:
    'END Kinandu chaku cha Sarafu chendeye usovwa. Nukwata SMS kinandu chaku chasovwa.',
  exit: exit,
  firstLanguageSet:
    'CON Kalivu mutandao wa Sarafu!\n{languages}\n00. Uma\n11. Mbee',
  secondLanguageSet:
    'CON Sakua luka:{languages}\n11. Mbee\n22. Syoka',
  thirdLanguageSet:
    'CON Sakua luka:{languages}\n22. Syoka\n00. Uma'
}

export default kam_registration

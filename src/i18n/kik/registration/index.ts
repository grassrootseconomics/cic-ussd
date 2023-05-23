import type { NamespaceRegistrationTranslation } from '../../i18n-types'
import kik from '..'

const { exit } = kik

const kik_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END Ihoya riaku ria kwiyandikithia ritina ìtikirika. Geria rigi thutha wa dagika nini.',
  accountCreationSuccess:
    'END Akaunti yaku ya Sarafu niiraharirio.Niugutumirwo SMS akauti yaku ya rikio kuharirio.',
  exit: exit,
  firstLanguageSet: 'CON Karibu Sarafu Network!\n{languages}\n00. Ehera\n11. Mbere',
  secondLanguageSet: 'CON Cagura ruthiomi:\n{languages}\n11. Mbere\n22. Coka\n00. Ehera',
  thirdLanguageSet: 'CON Cagura ruthiomi:\n{languages}\n22. Coka\n00. Ehera'
}

export default kik_registration

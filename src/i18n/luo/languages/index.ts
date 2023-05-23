import type { NamespaceLanguagesTranslation } from '../../i18n-types'
import luo from '..'

const { accountBlocked, exit } = luo

const luo_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError: 'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  changeSuccess: 'CON xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.\n0. Chien\n9. Wuok',
  enteringPin: 'CON Kiyie to ket PIN:\n0. Chien',
  exit: exit,
  firstLanguageSet:
    'CON Yier dhok:\n{languages}\n0. Chien\n11. Nyime\n00. Wuok',
  secondLanguageSet:
    'CON Yier dhok:\n{languages}\n11. Nyime\n22. Mokalo\n00. Wuok',
  thirdLanguageSet:
    'CON Yier dhok:\n{languages}\n22. Mokalo\n00. Wuok'
}

export default luo_languages

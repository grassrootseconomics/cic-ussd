import type { NamespaceLanguagesTranslation } from '../../i18n-types'
import gax from '..'

const { accountBlocked, exit } = gax

const gax_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError:
    'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  changeSuccess:
    'CON xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.\n0. Dheebi\n9. Bai',
  enteringPin:
    'CON Pin kekhai\n0. Dheebi',
  exit: exit,
  firstLanguageSet:
    'CON Afaan chaguaad\n{languages}\n0.Dheebi\n11.Dhuur\n00.Bai',
  secondLanguageSet:
    'CON Afaan chaguad:\n{languages}\n11.Dhuur\n22.Dheebi\n00.Bai',
  thirdLanguageSet:
    'CON Afaan chaguad:\n{languages}\n22.Waan dhabran\n00.Bai'
}

export default gax_languages

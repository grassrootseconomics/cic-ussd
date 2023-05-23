import type { NamespaceLanguagesTranslation } from '../../i18n-types'
import mij from '..'

const { accountBlocked, exit } = mij

const mij_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError: 'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  changeSuccess: 'CON xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.\n0. Uya nyuma\n9. Ombola',
  enteringPin: 'CON Unavoywa piniyo\n0. Uya nyuma',
  exit: exit,
  firstLanguageSet:
    'CON Tsagula luga\n{languages}\n0.Uya nyuma\n11.Mbere\n00.Ombola',
  secondLanguageSet:
    'CON Tsagula luga:\n{languages}\n11. Mbere\n22. Uyira ya nyuma\n00. Ombola',
  thirdLanguageSet:
    'CON Tsagula luga:\n{languages}\n22. Uyira ya nyuma\n00. Ombola'
}

export default mij_languages

import type { NamespaceLanguagesTranslation } from '../../i18n-types'
import kam from '..'

const { accountBlocked, exit } = kam

const kam_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError:
    'CON Thina waumila ivinda ya kusakua luka, tata ingi kavindane kangi.',
  changeSuccess:
    'CON Woni waku wa kusakua luka niwatumwa.\n0. Syoka\n9. Uma',
  enteringPin: 'CON Ikera PIN yaku:\n0. Syoka',
  exit: exit,
  firstLanguageSet: 'CON Sakua luka:\n{languages}\n0. Syoka\n00. Uma\n11. Mbee',
  secondLanguageSet: 'CON Sakua luka:\n{languages}\n11. Mbee\n22. Syoka',
  thirdLanguageSet: 'CON Sakua luka:\n{languages}\n22. Syoka\n00. Uma'
}

export default kam_languages

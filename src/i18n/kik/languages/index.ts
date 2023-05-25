import type { NamespaceLanguagesTranslation } from '../../i18n-types'
import kik from '..'

const { accountBlocked, exit } = kik

const kik_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError:
    'END Kuma na thina kucagura ruthomi, geria ringi thutha wa dakika nini.',
  changeSuccess:
    'CON Mahoya maku ma kucagura ruthomi nimatomwo.\n0. Coka\n9. Ehera',
  enteringPin: 'CON Ikera PIN yaku:\n0. Coka',
  exit: exit,
  firstLanguageSet:
    'CON Cagura ruthiomi:\n{languages}\n0. Coka\n00. Ehera\n11. Mbele',
  secondLanguageSet:
    'CON Cagura ruthiomi:\n{languages}\n11. Mbele\n22. Coka\n00. Ehera',
  thirdLanguageSet:
    'CON Cagura ruthiomi:\n{languages}\n22. Coka\n00. Ehera'
}

export default kik_languages

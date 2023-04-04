import type { NamespaceLanguagesTranslation } from '../../i18n-types';
import en from '..';

const { accountBlocked, exit } = en

const en_languages: NamespaceLanguagesTranslation = {
  accountBlocked: accountBlocked,
  changeError:
    'END An error occurred while changing language, please try again later.',
  changeSuccess:
    'CON Your language change request was successful.\n0. Back\n9. Exit',
  enteringPin:
    'CON Please enter four number PIN:\n0. Back',
  exit: exit,
  firstLanguageSet:
    'CON Select language:\n{languages}\n0. Back\n00.Exit\n11. Next',
  secondLanguageSet:
    'CON Select language:\n{languages}\n11. Next\n22. Back\n00.Exit',
  thirdLanguageSet:
    'CON Select language:\n{languages}\n22. Back\n00.Exit'
}

export default en_languages

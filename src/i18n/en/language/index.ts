import type { NamespaceLanguageTranslation } from '../../i18n-types'

const en_language = {
  accountBlocked:
    "END Your PIN has been blocked. For assistance please call: {supportPhone}.",
  changeError:
    "END An error occurred while changing language, please try again later.",
  changeSuccess:
    "CON Your language change request was successful.\n0. Back\n9. Exit",
  enteringPin:
    "CON Please enter four number PIN:\n0. Back",
  exit:
    "END Thank you for using Sarafu. Goodbye.",
  secondLanguageSet:
    "CON Select language:\n{languages}\n\n11. Next\n22. Back\n00.Exit",
  selectingLanguage:
    "CON Select language:\n{languages}\n\n00.Exit\n11. Next",
  thirdLanguageSet:
    "CON Select language:\n{languages}\n\n22. Back\n00.Exit",

} satisfies NamespaceLanguageTranslation

export default en_language

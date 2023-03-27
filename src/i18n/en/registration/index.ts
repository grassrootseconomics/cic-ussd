import type { NamespaceRegistrationTranslation } from '../../i18n-types';

const en_registration = {
  firstLanguageSet:
    "CON Welcome to Sarafu Network!\n{languages}\n\n00.Exit\n11. Next",
  secondLanguageSet:
    "CON Select language:\n{languages}\n\n11. Next\n22. Back\n00.Exit",
  thirdLanguageSet:
    "CON Select language:\n{languages}\n\n22. Back\n00.Exit",
  accountCreationSuccess:
    "END Your account is being created. You will receive an SMS when your account is ready.",
  accountCreationFailed:
    "END Sarafu is experiencing technical difficulties. Please try again later.",
  exit: "END Thank you for using Sarafu."
} satisfies NamespaceRegistrationTranslation

export default en_registration

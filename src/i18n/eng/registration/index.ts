import type { NamespaceRegistrationTranslation } from '../../i18n-types';
import eng from '..';

const { exit } = eng

const eng_registration: NamespaceRegistrationTranslation = {
  accountCreationError:
    'END Your account creation request failed. Please try again later.',
  accountCreationSuccess:
    'END Your account is being created. You will receive an SMS when your account is ready.',
  exit: exit,
  firstLanguageSet:
    'CON Welcome to Sarafu Network!\n{languages}\n00.Exit\n11. Next',
  secondLanguageSet:
    'CON Select language:\n{languages}\n11. Next\n22. Back\n00.Exit',
  thirdLanguageSet:
    'CON Select language:\n{languages}\n22. Back\n00.Exit'
}

export default eng_registration

import type { NamespaceAuthTranslation } from '../../i18n-types';
import eng from '..';

const { accountBlocked, exit } = eng

const eng_auth: NamespaceAuthTranslation = {
    accountBlocked: accountBlocked,
    activationError:
      'END Please try again in a few minutes. If the problem persists, please contact {supportPhone|phone}',
    confirmingPin:
      'CON Enter your four number PIN again:\n00. Exit',
    enteringPin:
      'CON Please enter a new four number PIN for your account:\n00. Exit',
    exit: exit,
    mainMenu:
      'CON Balance: {balance|currency} {symbol}\n1. Send\n2. My Vouchers\n3. My Account\n4. Help',
    processingAccount:
      'END Your account is still being created. You will receive an SMS when your account is ready.'
}

export default eng_auth
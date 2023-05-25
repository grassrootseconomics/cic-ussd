import type { NamespaceAuthTranslation } from '../../i18n-types';
import eng from '..'
import eng_main from '../main'

const { accountBlocked, exit } = eng
const { mainMenu } = eng_main

const eng_auth: NamespaceAuthTranslation = {
    accountBlocked: accountBlocked,
    activationError:
      'END Please try again in a few minutes. If the problem persists, please contact {supportPhone|phone}',
    confirmingPin:
      'CON Enter your four number PIN again:\n00. Exit',
    enteringPin:
      'CON Please enter a new four number PIN for your account:\n00. Exit',
    exit: exit,
    mainMenu: mainMenu,
    processingAccount:
      'END Your account is still being created. You will receive an SMS when your account is ready.'
}

export default eng_auth
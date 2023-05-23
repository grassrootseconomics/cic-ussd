import type { NamespaceAuthTranslation } from '../../i18n-types'
import fra from '..'
import fra_main from '../main';

const { accountBlocked, exit } = fra
const { mainMenu } = fra_main

const fra_auth: NamespaceAuthTranslation  = {
  accountBlocked: accountBlocked,
  activationError:
    'END S\'il vous plait, réessayez dans quelques minutes Si le problème persiste, veuillez contacter le: {supportPhone|phone}.',
  confirmingPin:
    'CON Saissisez a nouveau le code a 4 chiffres:\n00. Quitter',
  enteringPin:
    'CON Veuillez saisir un code a 4 chiffres\n00. Quitter',
  exit: exit,
  mainMenu: mainMenu,
  processingAccount:
    'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}

export default fra_auth

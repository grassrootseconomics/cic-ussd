import type { NamespaceAuthTranslation } from '../../i18n-types'
import mij from '..'
import mij_main from '../main';

const { accountBlocked, exit } = mij
const { mainMenu } = mij_main

const mij_auth: NamespaceAuthTranslation = {
  accountBlocked: accountBlocked,
  activationError:
    'END Tafadhali heza tena baada ya dakika chache Kama tatizo richeri tafadhali wasiliana na {supportPhone|phone}.',
  confirmingPin:
    'CON Ika nambazo nee kaheri\n00. Ombola',
  enteringPin:
    'CON Ika piniyo ya namba Nee kwa akaunti yakwako\n00. Ombola',
  exit: exit,
  mainMenu: mainMenu,
  processingAccount:
    'END Akauntiyo ichere tengezwa. Undaphokera Ujumbe mufuhi akauntiyo ichikala tayari.'

}

export default mij_auth

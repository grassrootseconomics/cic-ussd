import type { NamespaceAuthTranslation } from '../../i18n-types'
import kik from '..'
import kik_main from '../main'

const { accountBlocked, exit } = kik
const { mainMenu } = kik_main

const kik_auth: NamespaceAuthTranslation = {
  accountBlocked: accountBlocked,
  activationError:
    'END Geria ringi thutha wa dagika nini Ukoro thina niuguthii nambere, araniria na: {supportPhone|phone}',
  confirmingPin:
    'CON Ikira namba yaku ya thiri renge:\n00. Uma',
  enteringPin:
    'CON Ikira namba njeru ya thiri:\n00. Uma',
  exit: exit,
  mainMenu: mainMenu,
  processingAccount:
    'END Akaunti yaku no irathondekwo. Ni ukwamukira SMS akaunti yaku yareka.'
}

export default kik_auth

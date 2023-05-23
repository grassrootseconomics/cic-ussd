import type { NamespaceAuthTranslation } from '../../i18n-types'
import gax from '..'
import gax_main from '../main'

const { accountBlocked, exit } = gax
const { mainMenu } = gax_main

const gax_auth: NamespaceAuthTranslation = {
  accountBlocked: accountBlocked,
  activationError:
    'END Saadhii gari irdheebi Oja dibii jir namba tan bilbil {supportPhone|phone}.',
  confirmingPin:
    'CON PIN kekhae Marro Dibii:\n00. Bai',
  enteringPin:
    'CON Tafadhal pin hareti kekhae ka namba afuri fulaa akaunti kake:\n00. Bai',
  exit: exit,
  mainMenu: mainMenu,
  processingAccount:
    'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
}

export default gax_auth

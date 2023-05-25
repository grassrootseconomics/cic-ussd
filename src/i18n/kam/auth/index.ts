import type { NamespaceAuthTranslation } from '../../i18n-types'
import kam from '..'
import kam_main from '../main';

const { accountBlocked, exit } = kam
const { mainMenu } = kam_main

const kam_auth: NamespaceAuthTranslation = {
  accountBlocked: accountBlocked,
  activationError:
    'END Tata ingi itina wa ndatika nini. Ethiwa thina no uendeee, neena na: {supportPhone|phone}.',
  confirmingPin:
    'CON Ikia PIN yaku ya namba inya ingi:\n00. Uma',
  enteringPin:
    'CON Tafathali ikia pin yumbya ila ina namba inya:\n00. Uma',
  exit: exit,
  mainMenu: mainMenu,
  processingAccount:
    'END Kinandu chaku cha Sarafu chendeye usovwa. Nukwata SMS kinandu chaku chasovwa.'
}

export default kam_auth
import type { NamespaceTransferTranslation } from '../../i18n-types'
import mij from '..'
import mij_main from '../main'

const { accountBlocked, exit } = mij
const { mainMenu } = mij_main

const mij_transfer: NamespaceTransferTranslation = {
  accountBlocked: accountBlocked,
  enteringAmount:
    'CON Chiwango cha dzulu: {spendable|currency}\nIka chaasi cha kuhuma:\n0. Uya nyuma',
  enteringPin:
    'CON {recipient} yundahokera {amount|currency} {symbol} kulaa kwa {sender}.\nika PIN kala usawa\n0. Uya nyuma.',
  enteringRecipient:
    'CON Ika namba ya simu.\n0. Uya Nyuma',
  exit: exit,
  invalidRecipient:
    'CON {recipient} hii kaidzangwe sajiliwa ama kaisawa, unavoywa uyike kaheri:\n0. Uya nyuma',
  invalidRecipientWithInvite:
    'CON {recipient} Gadza sajiliwa au sisawa, unavoywa kujeza kaheri:\n0. Uya nyuma\n1. Sisawa kwa sarafu netiwaki.\n9. Ombola',
  inviteError:
    'END Voyoro ra kukaribishwa {invitee} kwa mutandao wa sarafu network rikahala. Tafadhali heza kaheri baadaye.',
  inviteSuccess:
    'END Karibisho ra {invitee} Kudzunga na Sarafu netiwa rihumwa.',
  mainMenu: mainMenu,
  transferError:
    'END Voyoro karifaulire. Tafadhali heza tena baadaye',
  transferInitiated:
    'END Mavoyogo gahumwa. {recipient} undaphokera {amount|currency} {symbol} kuombola kwa {sender}.'
}

export default mij_transfer

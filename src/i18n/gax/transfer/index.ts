import type { NamespaceTransferTranslation } from '../../i18n-types'
import gax from '..';
import gax_main from '../main';

const { accountBlocked, exit } = gax
const { mainMenu } = gax_main

const gax_transfer: NamespaceTransferTranslation = {
  accountBlocked: accountBlocked,
  enteringAmount:
    'CON Kiwango ta Gubaa: {spendable|currency}\nAgham kekhai\n0. Dheebi',
  enteringPin:
    'CON {recipient} in argad {amount|currency} {symbol} ir {sender}.\nPIN kekhai:\n0. Dheebi',
  enteringRecipient:
    'CON Namba simuu kekhai\n0. Dheebi',
  exit: exit,
  invalidRecipient:
    'CON {recipient} sun insajilan au dasaanit, mar dibii kekai:\n0. Dheebi',
  invalidRecipientWithInvite:
    'CON {recipient} sun insajilan au dasaanit, mar dibii kekai:\n0. Dheebi\n1. Sarafu Network diees.\n9. Bai',
  inviteError:
    'END Kadaan kake ka naam sarafu diees {invitee} yadidhan. Saadhii garii itdheebi.',
  inviteSuccess:
    'END Kadaa kake {invitee} ka sarafu network dieesit ya ergan.',
  mainMenu: mainMenu,
  transferError:
    'END Qarqarsi kanke inargam. Saadhi garii itdheebi',
  transferInitiated:
    'END Qarqar kake yaergad. {recipient} inargat {amount|currency} {symbol} kutoka kwa {sender}.'
}

export default gax_transfer

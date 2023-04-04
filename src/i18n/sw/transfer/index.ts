import { NamespaceTransferTranslation } from '../../i18n-types';
import sw from '..';
import sw_main from '../../sw/main';

const { accountBlocked, exit } = sw;
const { mainMenu } = sw_main;

const sw_transfer: NamespaceTransferTranslation = {
    accountBlocked: accountBlocked,
    enteringAmount:
      'CON Kiwango cha juu: {spendable|currency}\nWeka kiwango:\n0. Rudi',
    enteringPin:
      'CON {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}\nTafadhali weka PIN yako kudhibitisha:\n0. Rudi',
    enteringRecipient:
      'CON Weka nambari ya simu:\n0. Rudi',
    exit: exit,
    invalidRecipient:
      'CON {recipient} haijasajiliwa au sio sahihi, tafadhali weka tena:\n1.Karibisha kwa matandao wa Sarafu.\n9. Ondoka',
    inviteError:
      'END Ombi lako la kumwalika {invitee} kwa matandao wa Sarafu halikufaulu. Tafadhali jaribu tena baadaye.',
    inviteSuccess:
      'END Ombi lako la kumwalika {invitee} kwa matandao wa Sarafu limetumwa.',
    mainMenu: mainMenu,
    transferError:
      'END Ombi lako halikufaulu. Tafadhali jaribu tena baadaye.',
    transferInitiated:
      'END Ombi lako limetumwa. {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}.'
}

export default sw_transfer
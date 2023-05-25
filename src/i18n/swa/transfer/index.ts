import { NamespaceTransferTranslation } from '../../i18n-types';
import swa from '..';
import swa_main from '../main';

const { accountBlocked, exit } = swa;
const { mainMenu } = swa_main;

const swa_transfer: NamespaceTransferTranslation = {
    accountBlocked: accountBlocked,
    enteringAmount:
      'CON Kiwango cha juu: {spendable|currency}\nWeka kiwango:\n0. Rudi',
    enteringPin:
      'CON {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}\nTafadhali weka PIN yako kudhibitisha:\n0. Rudi',
    enteringRecipient:
      'CON Weka nambari ya simu:\n0. Rudi',
    exit: exit,
    invalidRecipientWithInvite:
      'CON {recipient} haijasajiliwa au sio sahihi, tafadhali weka tena:\n0. Rudi\n1.Karibisha kwa matandao wa Sarafu.\n9. Ondoka',
    invalidRecipient:
      'CON {recipient} haijasajiliwa au sio sahihi, tafadhali weka tena:\n0. Rudi',
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

export default swa_transfer
import type { NamespaceTransferTranslation } from '../../i18n-types'
import kik from '..'
import kik_main from '../main'

const { accountBlocked, exit } = kik
const { mainMenu } = kik_main

const kik_transfer: NamespaceTransferTranslation = {
  accountBlocked: accountBlocked,
  enteringAmount:
    'CON Gikiri kia iguru: %{spendable|currency}\nIkira muigana:\n0. Coka',
  enteringPin:
    'CON {recipient} akuamukira {amount|currency} {symbol} kuuma kwa {sender}\nEkera PIN yaku kuetekeria\n0. Coka',
  enteringRecipient:
    'CON Ikira namba ya thimu:\n0. Coka',
  exit: exit,
  invalidRecipient:
    'CON {recipient} tinyandikithie kana ti njega, dakuhoya wikire ringi:\n0. Coka',
  invalidRecipientWithInvite:
    'CON {recipient} tinyandikithie kana ti njega, dakuhoya wikire ringi:\n0. Coka\n1. karibu mtaboini wa sarafu\n9. Uma',
  inviteError:
    'END Ihoya riaku ria kumonyita ugeni {invitee} Sarafuini ritina rìka. Geria ringi thutha wa dagika nini.',
  inviteSuccess:
    'END Mwariko {invitee} kutonya mutaboini wa sarafu network niwatumwo',
  mainMenu: mainMenu,
  transferError:
    'END Ihoya riaku ritinahotekeka. Ndakuhoya ugerie ringi.',
  transferInitiated:
    'END Mahoya maku nimatomwo. {recipient} akuamukira {amount|currency} {symbol} kuma kwa {sender}.'
}

export default kik_transfer

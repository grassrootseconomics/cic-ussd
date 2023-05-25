import type { NamespaceTransferTranslation } from '../../i18n-types'
import kam from '..'
import kam_main from '../main'

const { accountBlocked, exit } = kam
const { mainMenu } = kam_main

const kam_transfer: NamespaceTransferTranslation = {
  accountBlocked: accountBlocked,
  enteringAmount:
    'CON Kewango kenene: {spendable|currency}\nIkia kiwango\n0. Syoka',
  enteringPin:
    'CON {recipient} nukwata {amount|currency} {symbol} kuma kwa {sender}\nIkia PIN yaku kuvitukithya\n0. Syoka',
  enteringRecipient:
    'CON Ikia namba ya simu\n0. Syoka',
  exit: exit,
  invalidRecipient:
    'CON {recipient} ya simu timbadekethye kana ndayele, tatethya ingi:\n0. Syoka',
  invalidRecipientWithInvite:
    'CON {recipient} ya simu timbadekethye kana ndayele, tatethya ingi:\n0. Syoka\n1. Kuthokwa mtandaoni wa sarafu network\n9. Uma',
  inviteError:
    'END kimanyesyo chaku cha kumothokya {invitee} mtandaoni wa sarafu winetekelwa kwawenyivyo, tata ingi kavinda kangi.',
  inviteSuccess:
    'END Utamani waku wa kuthokya {invitee} mutandaoni wa sarafu network niweetekelwa.',
  mainMenu: mainMenu,
  transferError:
    'END Wendekethyo waku winatekelwa, tata ingi kavinda kangi.',
  transferInitiated:
    'END Woni niwatumwa. {recipient} nukukwata {amount|currency} {symbol} kuma kwa {sender}.'
}

export default kam_transfer
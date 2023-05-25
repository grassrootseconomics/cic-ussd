import type { NamespaceTransferTranslation } from '../../i18n-types'
import luo from '..'
import luo_main from '../main'

const { accountBlocked, exit } = luo
const { mainMenu } = luo_main

const luo_transfer: NamespaceTransferTranslation = {
  accountBlocked: accountBlocked,
  enteringAmount:
    'CON Giko: {spendable|currency}\nKet giko mari\n0. Chien',
  enteringPin:
    'CON {recipient} dhiyudo {amount|currency} {symbol} kowuok kuom {sender}.\nKiyie to ket PIN mondo iyie:\n0. Chien',
  enteringRecipient:
    'CON Ket namba simu ngama iorone\n0. Chien',
  exit: exit,
  invalidRecipient:
    'CON {recipient} pok ondiki kata okti, kiyie to ndike kendo:\n0. Chien',
  invalidRecipientWithInvite:
    'CON {recipient} pok ondiki kata okti, kiyie to tem kendo:\n0. Chien\n1. Sole e Sarafu Network.\n9. Wuok',
  inviteError:
    'END wendo misolo e sarafu {invitee} otamreTem kendo.',
  inviteSuccess:
    'END Wendo mi solo e sarafu network oseor. {invitee}',
  mainMenu: mainMenu,
  transferError:
    'END Kwayo mari orem. Tem kendo bange.',
  transferInitiated:
    'END Kwayo ni oseor. {recipient} boyudo {amount|currency} {symbol} kowuok kuom {sender}.'
}

export default luo_transfer

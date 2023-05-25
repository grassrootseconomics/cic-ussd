import type { NamespaceTransferTranslation } from '../../i18n-types'
import fra from '..'
import fra_main from '../main'

const { accountBlocked, exit } = fra
const { mainMenu } = fra_main

const fra_transfer: NamespaceTransferTranslation = {
  accountBlocked: accountBlocked,
  enteringAmount:
    'CON Montant maximal: {spendable|currency}\nEntrez le montant:\n0. Retour',
  enteringPin:
    'CON {recipient} va recevoir {amount|currency} {symbol} de {sender}.\nEntrez votre code PIN pour confirmer\n0. Retour',
  enteringRecipient:
    'CON Entrer le numero du beneficiaire:\n0. Retour',
  exit: exit,
  invalidRecipient:
    'CON Numéro {recipient} est invalide ou non enregistré, veuillez reessayer:\n0. Quitter',
  invalidRecipientWithInvite:
    'CON Numéro {recipient} est invalide ou non enregistré, veuillez reessayer:\n0. Quitter\n1. Inviter à Sarafu\n9. Quitter',
  inviteError:
    'END Votre demande d\'invitation pour {invitee} à Sarafu Network a échoué Veuillez réessayer plus tard.',
  inviteSuccess:
    'END Vous avez invite {invitee} le membre a rejoindre Sarafu.',
  mainMenu: mainMenu,
  transferError:
    'END Votre demande a échoué Veuillez réessayer plus tard',
  transferInitiated:
    'END Transaction effectuee {recipient} vous recevrez {amount|currency} {symbol} de {sender}.'
}

export default fra_transfer

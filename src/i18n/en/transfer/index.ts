import type { NamespaceTransferTranslation } from '../../i18n-types';
import en from '..';
import en_main from '../../en/main';

const { accountBlocked, exit } = en
const { mainMenu } = en_main

const en_transfer = {
    accountBlocked: accountBlocked,
    enteringPin:
        "CON {recipient} will receive {amount|currency} {symbol} from {sender}\nPlease enter your PIN to confirm:\n0. Back",
    enteringAmount:
        "CON Maximum amount: {spendable|currency}\nEnter amount:\n0. Back",
    enteringRecipient:
        "CON Enter recipient's phone number:\n0. Back",
    exit: exit,
    invalidRecipient:
        "CON {recipient} is not registered or invalid, please try again:\n1. Invite to Sarafu Network.\n9. Exit",
    inviteError:
        "END Your invite request for {invitee} to Sarafu Network failed. Please try again later.",
    inviteSuccess:
        "END Your invitation to {invitee} to join Sarafu Network has been sent.",
    mainMenu: mainMenu,
    transferError:
        "END Your request failed. Please try again later.",
    transferInitiated:
        "END Your request has been sent. {recipient} will receive {amount|currency} {symbol} from {sender}.",

} satisfies NamespaceTransferTranslation

export default en_transfer

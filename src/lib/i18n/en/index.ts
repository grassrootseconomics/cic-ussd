import type { Translation } from '../i18n-types'

const en = {
  // account creation states
  accountBlocked:
    'END Your PIN has been blocked. For assistance please call: {0}',
  accountPendingCreation:
    'END Your account is still being created. You will receive an SMS when your account is ready.',
  initiateAccountCreation:
    'END Your account is being created. You will receive an SMS when your account is ready.',
  enteringPreferredLanguage:
    'CON {feedback}Welcome to Sarafu Network!\n{languages}\n\n00.Exit\n11. Next',
  secondLanguageSet:
    'CON {feedback}Select language:\n{languages}\n\n11. Next\n22. Back\n00.Exit',
  thirdLanguageSet:
    'CON {feedback}Select language:\n{languages}\n\n22. Back\n00.Exit',

  // initial pin entry states
  enteringPIN: 'CON {feedback}Please enter four number PIN:',
  confirmingPIN: 'CON Enter your four number PIN again:',

  // main menu states
  mainMenu:
    'CON Balance: {balance|currency}\n1. Send\n2. My Vouchers\n3. My Account\n4. Help',

  // recipient states
  enteringRecipient: "CON Enter recipient's phone number:\n",
  invalidRecipient:
    'CON {recipient} is not registered or invalid, please try again:\n1. Invite to Sarafu Network. \n9. Exit',
  inviteRecipient:
    'END Your invitation to {invitee} to join the Voucher Wallet has been sent.',

  // amount states
  enteringAmount: 'CON Maximum amount: {maxSpendable}\n{feedback}Enter amount:',
  confirmingTransfer:
    'CON {feedback}{recipient} will receive {amount|currency} {symbol} from {sender}\nPlease enter your PIN to confirm:',
  initiatingTransfer:
    'END Your request has been sent. {recipient} will receive {amount|currency} {symbol} from {sender}.',

  // final states
  exit: 'END Thank you for using Sarafu.',

  // error states
  machineError:
    'END Sarafu is experiencing technical difficulties. Please try again later.'
} satisfies Translation

export default en

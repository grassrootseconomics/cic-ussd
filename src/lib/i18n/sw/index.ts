import type { BaseTranslation } from '../i18n-types'

const sw = {
  // account creation states
  accountBlocked:
    'END PIN yako imefungwa. Kwa usaidizi tafadhali piga simu kwa: {0}.',
  accountPendingCreation:
    'END Akaunti yako ya Sarafu bado inatayarishwa. Utapokea ujumbe wa SMS akaunti yako ikiwa tayari.',
  initiateAccountCreation:
    'END Akaunti yako ya Sarafu inatayarishwa. Utapokea ujumbe wa SMS akaunti yako ikiwa tayari.',
  enteringPreferredLanguage:
    'CON {feedback}Karibu Sarafu Network!\n{languages}\n\n00.Ondoka\n11. Mbele',
  secondLanguageSet:
    'CON {feedback}Select language:\n{languages}\n\n11. Mbele\n22. Rudi\n00.Ondoka',
  thirdLanguageSet:
    'CON {feedback}Select language:\n{languages}\n\n22. Rudi\n00.Ondoka',

  // initial pin entry states
  enteringPIN: 'CON {feedback}Tafadhali weka PIN yenye nambari nne:',
  confirmingPIN: 'CON Weka PIN yako tena:',

  // main menu states
  mainMenu:
    'CON Salio: {balance|currency}\n1. Tuma\n2. Sarafu yangu\n3. Akaunti yangu\n4. Usaidizi',

  // transfer states
  enteringRecipient: 'CON Weka nambari ya simu:\n0.',
  invalidRecipient:
    'CON {recipient} haijasajiliwa au sio sahihi, tafadhali weka tena:\n1.Karibisha kwa matandao wa Sarafu. \n9. Ondoka',
  inviteRecipient:
    'END Ombi lako la kumwalika {invitee} kwa matandao wa Sarafu limetumwa.',
  enteringAmount:
    'CON Kiwango cha juu: {maxSpendable}\n{feedback}Weka kiwango:',
  confirmingTransfer:
    'CON {feedback}{recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}\nTafadhali weka PIN yako kudhibitisha:',
  initiatingTransfer:
    'END Ombi lako limetumwa. {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}.',

  // final states
  exit: 'END Asante kwa kutumia huduma ya Sarafu.',

  // error states
  machineError: 'END Satrafu ina hitilafu ta kimitambo. Tafadhali jaribu tena baadaye.'
} satisfies BaseTranslation

export default sw

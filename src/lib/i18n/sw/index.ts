import type { BaseTranslation } from "../i18n-types";

const sw = {
  // account creation states
  accountBlocked:
    'END PIN yako imefungwa. Kwa usaidizi tafadhali piga simu kwa: {0}.',
  accountPendingCreation:
    'END Akaunti yako ya Sarafu bado inatayarishwa. Utapokea ujumbe wa SMS akaunti yako ikiwa tayari.',
  initiateAccountCreation:
    'END Akaunti yako ya Sarafu inatayarishwa. Utapokea ujumbe wa SMS akaunti yako ikiwa tayari.',
  enteringPreferredLanguage:
    'CON Karibu Sarafu Network!\n{languages}\n\n00.Ondoka\n11. Mbele',
  secondLanguageSet:
    'CON Select language:\n{languages}\n\n11. Mbele\n22. Rudi\n00.Ondoka',
  thirdLanguageSet:
    'CON Select language:\n{languages}\n\n22. Rudi\n00.Ondoka',

  // initial pin entry states
  enteringPIN: 'CON Tafadhali weka PIN yenye nambari nne:',
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
    'CON Kiwango cha juu: {maxSpendable}\nWeka kiwango:',
  confirmingTransfer:
    'CON {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}\nTafadhali weka PIN yako kudhibitisha:',
  initiatingTransfer:
    'END Ombi lako limetumwa. {recipient} atapokea {amount|currency} {symbol} kutoka kwa {sender}.',

  // select voucher states
  enteringVoucher:
    'Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n\n0. Rudi\n11. Mbele',
  secondVoucherSet:
    'Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n\n11. Mbele\n22. Rudi',
  thirdVoucherSet:
    'Chagua nambari au ishara kutoka kwa salio zako:\n{vouchers}\n\n22. Rudi\n99. Ondoka',

  // active voucher state
  activeVoucherSet:
    'CON Success! {symbol} is your active Sarafu\n0. Back\n9. Exit',

  // final states
  exit: 'END Asante kwa kutumia huduma ya Sarafu.',

  // error states
  machineError: 'END Satrafu ina hitilafu ta kimitambo. Tafadhali jaribu tena baadaye.'
} satisfies BaseTranslation

export default sw

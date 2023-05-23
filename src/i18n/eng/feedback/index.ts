import type { NamespaceFeedbackTranslation } from '../../i18n-types'

const eng_feedback: NamespaceFeedbackTranslation = {
  invalidAmount:
    'CON The amount you entered is greater than your balance or is invalid. Please try again:\n0. Back',
  invalidGenderOption:
    'CON Your gender option is invalid. Please try again:\n1. Male\n2. Female\n3. Other\n0. Back',
  invalidLanguageOption:
    'CON The language option is invalid. Please try again:\n{languages}\n0. Back\n00.Exit\n11. Next',
  invalidLocationOption:
    'CON The location entered is invalid. Please try again:\n0. Back',
  invalidMarketplaceEntry:
    'CON The services or goods you entered are invalid. Please try again:\n0. Back',
  invalidName:
    'CON The name you entered is invalid. Please try again:\n0. Back',
  invalidNewPin:
    'CON The PIN you entered is invalid. The PIN must be different from your current PIN. For help, call {supportPhone|phone}.\n0. Back',
  invalidPin:
    'Your PIN is incorrect, you have {remainingAttempts} attempts remaining.\n0. Back',
  invalidPinAtRegistration:
    'CON The PIN you have entered is invalid. PIN must consist of 4 digits. For help, call {supportPhone|phone}:\n00. Exit',
  invalidPinPC:
    'CON Your PIN is incorrect, you have {remainingAttempts} attempts remaining.\n0. Back',
  invalidPinPV:
    'CON Your PIN is incorrect, you have {remainingAttempts} attempts remaining.\n0. Back',
  invalidVoucher:
    'CON The voucher option is invalid. Please try again\n{vouchers}\n0. Back\n11. Next\n00. Exit',
  invalidYOBEntry:
    'CON The year of birth you entered is invalid. Please try again:\n0. Back',
  pinMismatch:
    'CON The new PIN does not match the one you entered. Please try again. For help, call {supportPhone|phone}\n0. Back',
}

export default eng_feedback

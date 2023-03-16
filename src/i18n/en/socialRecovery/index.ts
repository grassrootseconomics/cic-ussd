import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types'

const en_socialRecovery = {
  accountBlocked:
    "END Your PIN has been blocked. For assistance please call: {supportPhone}.",
  enteringGuardianToRemove:
    "CON Enter phone number of the guardian to remove:\n0. Back",
  enteringNewGuardian:
    "CON Enter phone number of the guardian to add:\n0. Back",
  enteringPinAG:
    "CON Enter your PIN to add guardian:\n0. Back",
  enteringPinRG:
    "CON Enter your PIN to remove guardian:\n0. Back",
  enteringPinVG:
    "CON Enter your PIN to view your guardians:\n0. Back",
  exit:
    "END Thank you for using Sarafu. Goodbye.",
  guardianAdditionError:
    "END There was an error adding {guardian} as your guardian.",
  guardianAdditionSuccess:
    "CON {guardian} has been added as your guardian.\n0. Back\n9. Exit",
  guardianRemovalError:
    "END There was an error removing {guardian} as your guardian.",
  guardianRemovalSuccess:
    "CON {guardian} has been removed as your guardian.\n0. Back\n9. Exit",
  loadError:
    "END There was an error loading your guardians. Please try again later.",
  pinGuardiansLoaded:
    "CON Your guardians are:\n{guardians}\n0. Back\n9. Exit",
  socialRecoveryMenu:
    "CON PIN guarding:\n1. Add guardian\n2. Remove guardian\n3. View guardians\n0. Back",


} satisfies NamespaceSocialRecoveryTranslation

export default en_socialRecovery

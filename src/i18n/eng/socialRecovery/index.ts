import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types';
import eng from '..';
import eng_pins from '../pins';

const { accountBlocked, exit } = eng
const { pinManagementMenu } = eng_pins

const eng_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove:
    'CON Enter phone number of the guardian to remove:\n0. Back',
  enteringNewGuardian:
    'CON Enter phone number of the guardian to add:\n0. Back',
  enteringPinAG:
    'CON Enter your PIN to add {guardian} as a guardian:\n0. Back',
  enteringPinRG:
    'CON Enter your PIN to remove {guardian} from guardians:\n0. Back',
  enteringPinVG:
    'CON Enter your PIN to view your guardians:\n0. Back',
  exit: exit,
  firstGuardiansSet:
    'CON Guardians:\n{guardians}\n0. Back\n00.Exit\n11. Next',
  guardianAdditionError:
    'END There was an error adding {guardian} as your guardian.',
  guardianAdditionSuccess:
    'CON {guardian} has been added as your guardian.\n0. Back\n9. Exit',
  guardianRemovalError:
    'END There was an error removing {guardian} as your guardian.',
  guardianRemovalSuccess:
    'CON {guardian} has been removed as your guardian.\n0. Back\n9. Exit',
  loadError:
    'END There was an error loading your guardians. Please try again later.',
  pinManagementMenu: pinManagementMenu,
  secondGuardiansSet:
    'CON Guardians:\n{guardians}\n11. Next\n22. Back\n00.Exit',
  socialRecoveryMenu:
    'CON PIN guarding:\n1. Add guardian\n2. Remove guardian\n3. View guardians\n0. Back',
  thirdGuardiansSet:
    'CON Guardians:\n{guardians}\n22. Back\n00.Exit'
}

export default eng_socialRecovery

import type { NamespacePinsTranslation } from '../../i18n-types';
import eng from '..';

const { accountBlocked, exit } = eng

const eng_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Confirm your new PIN:\n0. Back',
  enteringNewPin:
    'CON Enter a new four number PIN:\n0. Back',
  enteringOldPin:
    'CON Enter your old PIN:\n0. Back',
  enteringPinWR:
    'CON Enter your PIN to confirm {ward}\'s pin reset:\n0. Back',
  enteringWard:
    'CON Enter other\'s phone number:\n0. Back',
  exit: exit,
  pinChangeError:
    'END There was an error changing your PIN. Please try again later.',
  pinChangeSuccess:
    'CON Your PIN change request has been successful.\n0. Back\n9. Exit',
  pinManagementMenu:
    'CON PIN Management:\n1. Change PIN\n2. Reset other\'s PIN\n3. Guard my PIN\n0. Back',
  socialRecoveryMenu:
    'CON PIN guarding:\n1. Add guardian\n2. Remove guardian\n3. View guardians\n0. Back',
  wardResetError:
    'END There was an error resetting {ward} PIN.',
  wardResetSuccess:
    'CON Your request to reset {ward} PIN has been sent.\n0. Back\n9. Exit'
}

export default eng_pins

import type { NamespacePinsTranslation } from '../../i18n-types';
import en from '..';

const { accountBlocked, exit } = en

const en_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  changeError:
    "END There was an error changing your PIN. Please try again later.",
  confirmNewPin:
    "CON Confirm your new PIN:\n0. Back",
  enteringNewPin:
    "CON Enter a new four number PIN:\n0. Back",
  enteringOldPin:
    "CON Enter your old PIN:\n0. Back",
  enteringPinR:
    "CON Enter your PIN to initiate reset:\n0. Back",
  enteringWard:
    "CON Enter ward's phone number:\n0. Back",
  exit: exit,
  pinManagementMenu:
    "CON PIN Management:\n1. Change PIN\n2. Reset ward's PIN\n3. Guard my PIN\n0. Back",
  socialRecoveryMenu:
    "CON PIN guarding:\n1. Add guardian\n2. Remove guardian\n3. View guardians\n0. Back",
  wardResetError:
    "END There was an error resetting {ward} PIN.",
  wardResetSuccess:
    "CON Your request to reset {ward} PIN has been sent.\n0. Back\n9. Exit",
  pinChangeSuccess:
    "CON Your PIN change request has been successful.\n0. Back\n9. Exit",
  pinChangeError:
    "END There was an error changing your PIN. Please try again later.",
}

export default en_pins

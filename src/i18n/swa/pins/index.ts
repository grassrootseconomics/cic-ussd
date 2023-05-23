import { NamespacePinsTranslation } from '../../i18n-types';
import swa from '..';

const { accountBlocked, exit } = swa

const swa_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Thibitisha PIN yako mpya:\n0. Rudi',
  enteringNewPin:
    'CON Weka PIN mpya ya nne nambari:\n0. Rudi',
  enteringOldPin:
    'CON Weka PIN yako ya zamani:\n0. Rudi',
  enteringPinWR:
    'CON Weka PIN yako ili kudhibitisha ombi la kubadilisha nambari ya siri ya {ward}:\n0. Rudi',
  enteringWard:
    'CON Weka nambari ya simu ili kutuma ombi la kubalisha nambari ya siri:\n0. Rudi',
  exit: exit,
  pinChangeError:
    'END Kulikuwa na tatizo la kubadili PIN yako. Tafadhali jaribu tena baadaye.',
  pinChangeSuccess:
    'CON Ombi lako la kubadili PIN limefanikiwa.\n0. Rudi\n9. Toka',
  pinManagementMenu:
    'CON Mipangilio ya PIN:\n1. Badili PIN\n2. Badili PIN ya mwenzio\n3. Linda PIN yangu\n0. Rudi',
  socialRecoveryMenu:
    'CON Ulinzi wa PIN:\n1. Ongeza\n2. Ondoa\n3. Angalia\n0. Rudi',
  wardResetError:
    'END Kulikuwa na tatizo la kubadili PIN ya {ward}.',
  wardResetSuccess:
    'CON Ombi lako la kubadili PIN ya {ward} limetumwa.\n0. Rudi\n9. Toka'
}

export default swa_pins;
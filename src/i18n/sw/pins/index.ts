import { NamespacePinsTranslation } from '../../i18n-types';
import sw from '..'
const { accountBlocked, exit } = sw

const sw_pins = {
  accountBlocked: accountBlocked,
  changeError:
    "END Kulikuwa na tatizo la kubadili PIN yako. Tafadhali jaribu tena baadaye.",
  confirmNewPin:
    "CON Thibitisha PIN yako mpya:\n0. Rudi",
  enteringNewPin:
    "CON Weka PIN mpya ya nne nambari:\n0. Rudi",
  enteringOldPin:
    "CON Weka PIN yako ya zamani:\n0. Rudi",
  enteringPinR:
    "CON Weka PIN yako ili uanze kubadili:\n0. Rudi",
  enteringWard:
    "CON Weka nambari ya simu ya mwenzio:\n0. Rudi",
  exit: exit,
  pinManagementMenu:
    "CON Mipangilio ya PIN:\n1. Badili PIN\n2. Badili PIN ya mwenzio\n3. Linda PIN yangu\n0. Rudi",
  socialRecoveryMenu:
    "CON Ulinzi wa PIN:\n1. Ongeza mlinzi\n2. Ondoa mlinzi\n3. Angalia walinzi\n0. Rudi",
  wardResetError:
    "END Kulikuwa na tatizo la kubadili PIN ya {ward}.",
  wardResetSuccess:
    "CON Ombi lako la kubadili PIN ya {ward} limepelekwa.\n0. Rudi\n9. Toka",
  pinChangeSuccess:
    "CON Ombi lako la kubadili PIN limefanikiwa.\n0. Rudi\n9. Toka",
  pinChangeError:
    "END Kulikuwa na tatizo la kubadili PIN yako. Tafadhali jaribu tena baadaye."


} satisfies NamespacePinsTranslation;

export default sw_pins;
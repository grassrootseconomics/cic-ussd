import {NamespaceSocialRecoveryTranslation} from "../../i18n-types";

const sw_socialRecovery = {
  accountBlocked:
    "END PIN yako imefungwa. Tafadhali piga namba: {supportPhone}.",
  enteringGuardianToRemove:
    "CON Weka namba ya simu ya mlinzi unayetaka kuondoa:\n0. Rudi",
  enteringNewGuardian:
    "CON Weka namba ya simu ya mlinzi unayetaka kuongeza:\n0. Rudi",
  enteringPinAG:
    "CON Weka PIN yako ili kuongeza mlinzi:\n0. Rudi",
  enteringPinRG:
    "CON Weka PIN yako ili kuondoa mlinzi:\n0. Rudi",
  enteringPinVG:
    "CON Weka PIN yako ili kuona walinzi wako:\n0. Rudi",
  exit:
    "END Asante kwa kutumia Sarafu. Kwaheri.",
  guardianAdditionError:
    "END Kulikuwa na tatizo katika kuongeza {guardian} kuwa mlinzi wako.",
  guardianAdditionSuccess:
    "CON {guardian} ameongezwa kuwa mlinzi wako.\n0. Rudi\n9. Ondoka",
  guardianRemovalError:
    "END Kulikuwa na tatizo katika kuondoa {guardian} kuwa mlinzi wako.",
  guardianRemovalSuccess:
    "CON {guardian} ameondolewa kuwa mlinzi wako.\n0. Rudi\n9. Ondoka",
  loadError:
    "END Kulikuwa na tatizo katika kuangalia walinzi wako. Tafadhali jaribu tena baadaye.",
  pinGuardiansLoaded:
    "CON Walinzi wako ni:\n{guardians}\n0. Rudi\n9. Ondoka",
  socialRecoveryMenu:
    "CON Ulinzi wa PIN:\n1. Ongeza mlinzi\n2. Ondoa mlinzi\n3. Angalia walinzi\n0. Rudi",



} satisfies NamespaceSocialRecoveryTranslation

export default sw_socialRecovery
import { NamespaceSocialRecoveryTranslation } from '../../i18n-types';
import swa from '..';
import swa_pins from '../pins';

const { accountBlocked, exit } = swa
const { pinManagementMenu } = swa_pins

const swa_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove:
    'CON Weka namba ya simu ya mlinzi unayetaka kuondoa:\n0. Rudi',
  enteringNewGuardian:
    'CON Weka namba ya simu ya mlinzi unayetaka kuongeza:\n0. Rudi',
  enteringPinAG:
    'CON Weka PIN yako ili kuongeza {guardian} kama mlinzi:\n0. Rudi',
  enteringPinRG:
    'CON Weka PIN yako ili kuondoa {guardian} kama mlinzi:\n0. Rudi',
  enteringPinVG:
    'CON Weka PIN yako ili kuona walinzi wako:\n0. Rudi',
  exit: exit,
  firstGuardiansSet:
    'CON Walinzi:\n{guardians}\n0. Rudi\n00.Ondoka\n11. Mbele',
  guardianAdditionError:
    'END Kulikuwa na tatizo katika kuongeza {guardian} kuwa mlinzi wako.',
  guardianAdditionSuccess:
    'CON {guardian} ameongezwa kuwa mlinzi wako.\n0. Rudi\n9. Ondoka',
  guardianRemovalError:
    'END Kulikuwa na tatizo katika kuondoa {guardian} kuwa mlinzi wako.',
  guardianRemovalSuccess:
    'CON {guardian} ameondolewa kuwa mlinzi wako.\n0. Rudi\n9. Ondoka',
  loadError:
    'END Kulikuwa na tatizo katika kuangalia walinzi wako. Tafadhali jaribu tena baadaye.',
  pinManagementMenu: pinManagementMenu,
  secondGuardiansSet:
    'CON Walinzi:\n{guardians}\n11. Mbele\n22. Rudi\n00.Ondoka',
  socialRecoveryMenu:
    'CON Ulinzi wa PIN:\n1. Ongeza mlinzi\n2. Ondoa mlinzi\n3. Angalia walinzi\n0. Rudi',
  thirdGuardiansSet:
    'CON Walinzi:\n{guardians}\n22. Rudi\n00. Ondoka'
}

export default swa_socialRecovery
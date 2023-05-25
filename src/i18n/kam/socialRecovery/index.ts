import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types'
import kam from '..'
import kam_pins from '../pins';

const { accountBlocked, exit } = kam
const { pinManagementMenu } = kam_pins

const kam_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove:
    'CON Ikia namba ya simu kumya mutetheesya\n0. Syoka',
  enteringNewGuardian:
    'CON Ikia namba ya simu kwongela mutethesya wa kusovya pin\n0. Syoka',
  enteringPinAG:
    'CON Ikia pin yaku kwongela {guardian} ta mutetheesya\nSyoka',
  enteringPinRG:
    'CON Ikia pin yaku kumya {guardian} ta mutetheesya wa kusovya PIN\n0. Syoka',
  enteringPinVG:
    'CON Ikia pin yaku kuisya atetheesya ala wandikithitye\n0. Syoka',
  exit: exit,
  firstGuardiansSet:
    'CON Atetheesya:\n{guardians}\n0. Syoka\n00. Uma\n11. Kusovya',
  guardianAdditionError:
    'END Kwethiwa na kathina ivinda ya kuongela {guardian} musovei waku.',
  guardianAdditionSuccess:
    'CON {guardian} musovei waku newongelwa\n0. Syoka\n9. Uma',
  guardianRemovalError:
    'END Kwithiwa na kathina kwa kumya {guardian}ta musovei waku',
  guardianRemovalSuccess:
    'CON {guardian} musovei waku newaumwa\n0. Syoka\n9. Uma',
  loadError: '',
  pinManagementMenu: pinManagementMenu,
  secondGuardiansSet:
    'CON Atetheesya:\n{guardians}\n11. Kusovya\n22. Syoka\n00.Syoka',
  socialRecoveryMenu:
    'CON Atetheesya ma PIN\n1. Sisya\n2. Ongela\n3. Umya\n0. Syoka',
  thirdGuardiansSet:
    'CON Atetheesya:\n{guardians}\n22. Syoka\n00. Uma'
}

export default kam_socialRecovery

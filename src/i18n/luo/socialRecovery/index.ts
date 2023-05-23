import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types'
import luo from '..'
import luo_pins from '../pins'

const { accountBlocked, exit } = luo
const { pinManagementMenu } = luo_pins

const luo_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove:
    'CON Ket namba mar simu mondo igol jarit:\n0. Chien',
  enteringNewGuardian:
    'CON Ket namba simu mondo imed jarit namba ni mopondo\n0. Chien',
  enteringPinAG:
    'CON Ket PIN mondo imed {guardian} kaka jarit namba mar loko PIN ni\n0. Chien',
  enteringPinRG:
    'CON Ket PIN mondo igol {guardian} kaka jarit\n0. Chien',
  enteringPinVG:
    'CON Ket PIN ine jorit miketo\n0. Chien',
  exit: exit,
  firstGuardiansSet:
    'CON Arita\n{guardians}\n0. Chien\n11. Nyime\n00. Wuok',
  guardianAdditionError:
    'CON Ntie chandruok e medo jakony {guardian}',
  guardianAdditionSuccess:
    'CON {guardian} Jakony omedi kaka jakonyni\n0. Chien\n9. Wuog',
  guardianRemovalError:
    'END Ntie chandruok e golo {guardian} kaka jakonyni. Tem kendo',
  guardianRemovalSuccess:
    'CON {guardian} ogol kaka jakonyni\n0. Chien\n9. Wuog',
  loadError:
    'END Ntie chandruok e medo jakony kaka jakonyni. Tem kendo bange.',
  pinManagementMenu:pinManagementMenu,
  secondGuardiansSet:
    'CON Arita\n{guardians}\n11. Nyime\n22. Mokalo\n00. Wuok',
  socialRecoveryMenu:
    'CON Arita PIN\n1. Med\n2. Gol\n3. \n0. Chien',
  thirdGuardiansSet:
    'CON Arita\n{guardians}\n22. Mokalo\n00. Wuok'
}

export default luo_socialRecovery

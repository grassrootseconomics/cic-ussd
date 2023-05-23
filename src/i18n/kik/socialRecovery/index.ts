import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types'
import kik from '..'
import kik_pins from '../pins'

const { accountBlocked, exit } = kik
const { pinManagementMenu } = kik_pins

const kik_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove: 'CON Ikera namba ya thimu kuruta mugiteri:\n0. Coka',
  enteringNewGuardian: 'CON Ikera namba ya thimu kuongerera mugiteri wa gucenjia PIN\n0. Coka',
  enteringPinAG: 'CON Ikera pin yaku kuogerera {guardian} ta mugiteri wa gucenjia pin yaku\n0. Coka',
  enteringPinRG: 'CON Ikera pin yaku kuruta {guardian} ta mugiteri wa gucenjia pin yaku\n0. Coka',
  enteringPinVG: 'CON Ikera PIN yaku: \n0. Coka',
  exit: exit,
  firstGuardiansSet: 'CON Agiteri:\n{guardians}\n0. Coka\n00. Ehera\n11. Mbere',
  guardianAdditionError: 'END Ni kuuma na thina hari kuongerera {guardian} atueke mugiteri waku.',
  guardianAdditionSuccess: 'CON {guardian} niongererwo gutueka mugiteri waku\n0. Coka\n9. Ehera',
  guardianRemovalError: 'END Ni kuuma na thina hari kweheria {guardian} gutuìka mugiteri waku.',
  guardianRemovalSuccess: 'CON {guardian} nieherio gutuìeka mugiteri waku\n0. Coka\n9. Ehera',
  loadError: 'END Ni kuuma na thina hari kurora agiteri aku. Ndakwihoya ugerie ringi thutha wa dagika nini.',
  pinManagementMenu: pinManagementMenu,
  secondGuardiansSet: 'CON Agiteri:\n{guardians}\n11. Mbere\n22. Rudi\n00.Ehera',
  socialRecoveryMenu: 'CON Agiteri PIN\n1. Ikera\n2. Ruta\n3. Rora',
  thirdGuardiansSet: 'CON Agiteri:\n{guardians}\n22. Rudi\n00.Ehera'
}

export default kik_socialRecovery

import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types'
import gax from '..'
import gax_pins from '../pins'

const { accountBlocked, exit } = gax
const { pinManagementMenu } = gax_pins

const gax_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove:
    'CON Namba simu keyaadi ta korkorad irabasu feet.\n0.Dheebi',
  enteringNewGuardian:
    'CON Number kekhai ta nam atin Korkorad ta pin badilifaad feet\n0.Dheebi',
  enteringPinAG:
    'CON PIN kekhai dhuumi darad {guardian}  ta nam si korkorad.\n0.Dheebi',
  enteringPinRG:
    'CON Pin simu keyaadi {guardian}.\n0.Dheebi',
  enteringPinVG:
    'CON pin kake kekhai nam at korkorad lalaad\n0.Dheebi',
  exit: exit,
  firstGuardiansSet:
    'CON Korkorad:\n{guardians}\n0. Dheebi\n11. Dhuur\n00. Bai',
  guardianAdditionError:
    'END dibaa jiraa oja naam si karkart itdhar{guardian}',
  guardianAdditionSuccess:
    'CON {guardian} Naam si karkart yaitsidharan\n0. Dheebi\n9. Bai',
  guardianRemovalError:
    'END Dibaa gabaa yo nam si karkart baasu feeth {guardian}',
  guardianRemovalSuccess:
    'CON {guardian} Naam si karkart yaa si dhura baasan\n0. Dheebi\n9. Bai',
  loadError:
    'END Dibaa jira oja naam si karkart laalu feet. Saadhii garii itdheebi',
  pinManagementMenu: pinManagementMenu,
  secondGuardiansSet:
    'CON Korkorad:\n{guardians}\n11. Dhuur\n22. Waan dhabran\n00. Bai',
  socialRecoveryMenu:
    'CON PIN korkorad\n1. Darad\n2. Baas\n3. Laaalad\n0.Dheebi',
  thirdGuardiansSet:
    'CON Korkorad:\n{guardians}\n22. Waan dharban\n00. Bai'
}

export default gax_socialRecovery

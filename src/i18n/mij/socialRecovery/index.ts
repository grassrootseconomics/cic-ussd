import type { NamespaceSocialRecoveryTranslation } from '../../i18n-types'
import mij from '..'
import mij_pins from '../pins'

const { accountBlocked, exit } = mij
const { pinManagementMenu } = mij_pins

const mij_socialRecovery: NamespaceSocialRecoveryTranslation = {
  accountBlocked: accountBlocked,
  enteringGuardianToRemove:
    'CON Ika namba ya simu kumuomboza Mwimirizi:\n0. Uya nyuma',
  enteringNewGuardian:
    'CON Injiza namba ya simu ikale namba ya mwimirizi\n0. Uya nyuma',
  enteringPinAG:
    'CON Injiza piniyo kuika {guardian} akale mwimirizi wa piniyo\n0. Uya nyuma',
  enteringPinRG:
    'CON Injiza piniyo kumuomboza {guardian} dza mwimirizi wa piniyo.\n0. Uya nyuma',
  enteringPinVG:
    'CON Injiza piniyo kulolera mwimirizi\n0. Uya nyuma',
  exit: exit,
  firstGuardiansSet:
    'CON Kinjira\n{guardians}\n0. Uma nyuma\n11. Mbere\n00. Ombola',
  guardianAdditionError:
    'END Kukala na tatizo katika kuonjeza mrinzi wakwako: {guardian}',
  guardianAdditionSuccess:
    'CON {guardian} yudzonjezwa kukala mrinzi wakwako\n0. Uya\n9. Laa',
  guardianRemovalError:
    'END Kukala na tatizo katika kumlavya {guardian} kukala mrinzi wa kwako',
  guardianRemovalSuccess:
    'CON {guardian} yulaviwa kama mrinzi wa kwako\n0. Uya\n9. Laa',
  loadError:
    'END Kukala na tatizo katika kulola arinzi akwako. Tafadhali heza tena baadaye.',
  pinManagementMenu: pinManagementMenu,
  secondGuardiansSet:
    'CON Kinjira\n{guardians}\n11. Mbere\n22. Uya nyuma\n00. Ombola',
  socialRecoveryMenu:
    'CON Kinjira PIN\n1. Ika\n2. Usa\n3. Lola\n0. Uya nyuma',
  thirdGuardiansSet:
    'CON Kinjira\n{guardians}\n22. Uya Nyuma\n00. Ombola'
}

export default mij_socialRecovery

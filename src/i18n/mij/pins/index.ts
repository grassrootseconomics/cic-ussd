import type { NamespacePinsTranslation } from '../../i18n-types'
import mij from '..'

const { accountBlocked, exit } = mij

const mij_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Uyira kuika lwaphiri\n0. Uya Nyuma',
  enteringNewPin:
    'CON Ika namba pini mbisha\n0. Uya nyuma',
  enteringOldPin:
    'CON Ika namba Pini.\n0. Uya Nyuma',
  enteringPinWR:
    'CON Injiza piniyo uhakikishe {ward} unampaluzira\n0. Uya nyuma',
  enteringWard:
    'CON Ika namba ya simu muimirizi wako kugaluza piniyo\n0. Uya Nyuma',
  exit: exit,
  pinChangeError:
    'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
  pinChangeSuccess:
    'CON xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.\n0. Uya nyuma\n9. Ombola',
  pinManagementMenu:
    'CON Tsaguzi kwenye pini\n1. Galuza pini\n2. Ikato pini\n3. Imira pini\n0. Uya nyuma',
  socialRecoveryMenu:
    'CON Kinjira PIN\n1. Ika\n2. Usa\n3. Lola\n0. Uya nyuma',
  wardResetError:
    'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx {ward}.',
  wardResetSuccess:
    'CON Uweza: Umuhumira pini agaluze {ward}\n0. Uya nyuma\n9. Ombola'
}

export default mij_pins

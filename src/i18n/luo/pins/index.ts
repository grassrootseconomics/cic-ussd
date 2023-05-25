import type { NamespacePinsTranslation } from '../../i18n-types'
import luo from '..'

const { accountBlocked, exit } = luo

const luo_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Ket PIN ni kendo\n0. Chien',
  enteringNewPin:
    'CON Ket PIN ni maanyien.\n0. Chien',
  enteringOldPin:
    'CON Ket PIN ni masani\n0. Chien',
  enteringPinWR:
    'CON Ket PIN manyiso loko PIN mar {ward}\n0. Chien',
  enteringWard:
    'CON Ket namba simu ma irito PIN ne\n0. Chien',
  exit: exit,
  pinChangeError:
    'END Ntiere chandruok e loko pinni.Asayi tem kendo bange .',
  pinChangeSuccess:
    'CON Pin mioro ni olok osedhi\n0. Chien\n9. Wuok',
  pinManagementMenu:
    'CON Jolos Pin:\n1. Lok PIN na\n2. Los PIN\n3. Rit PIN na\n0. Chien',
  socialRecoveryMenu:
    'CON Arita PIN\n1. Med\n2. Gol\n3. \n0. Chien',
  wardResetError:
    'END Ne ntie chandruok e loso pinni {ward}.',
  wardResetSuccess:
    'CON Kwayo mari mar loko namba mopondo mar {ward} oseor\n0. Chien\n9. Wuok'
}

export default luo_pins

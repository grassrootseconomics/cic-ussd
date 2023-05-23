import type { NamespacePinsTranslation } from '../../i18n-types'
import kam from '..'

const { accountBlocked, exit } = kam

const kam_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Ikia namba yaku ya siri ingi\n0. Syoka',
  enteringNewPin:
    'CON Ikia PIN yaku yumbya ya namba inya\n0. Syoka',
  enteringOldPin:
    'CON Ikia namba yaku ya siri\n0. Syoka',
  enteringPinWR:
    'CON Ikia PIN yaku kwikiithya {ward} kusovwa kwa pin\n0. Syoka',
  enteringWard:
    'CON Ikia namba yaku ya simu ta mutethesya wa kusovya pin\n0. Syoka',
  exit: exit,
  pinChangeError:
    'END Thina wamutila ivinda ya kuvindua PIN, tata ingi kavindane kangi.',
  pinChangeSuccess:
    'CON Woni waku wa kuvindua PIN niwatumwa.\n0. Syoka\n9. Uma',
  pinManagementMenu:
    'CON Welesyo yulu wa PIN\n1. Kuvindua PIN yakwa\n2. Kusovesya mundu PIN\n3. Kusuvia PIN yakwa\n0. Syoka',
  socialRecoveryMenu:
    'CON Atetheesya ma PIN\n1. Ongela\n2. Umya\n3. Sisya\n0. Syoka',
  wardResetError:
    'END Thina wamutila ivinda ya kuvindua PIN ya {ward}, tata ingi kavindane kangi.',
  wardResetSuccess:
    'CON Niwambiisya kusovwa kwa PIN ya {ward} niwatumwa.\n0. Syoka\n9. Uma'
}

export default kam_pins

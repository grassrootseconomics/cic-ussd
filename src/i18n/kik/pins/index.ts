import type { NamespacePinsTranslation } from '../../i18n-types'
import kik from '..'

const { accountBlocked, exit } = kik

const kik_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Ikira namba yaku ya thiri renge\n0. Coka',
  enteringNewPin:
    'CON Ikira namba njeru ya thiri\n0. Coka',
  enteringOldPin:
    'CON Ikira namba ya thiri\n0. Coka',
  enteringPinWR:
    'CON Ikira PIN yaku {ward} cejia:\n0. Coka',
  enteringWard:
    'CON Ikira namba ya thimu gutuma ihoya ria gucejia namba ya thiri:\n0. Coka',
  exit: exit,
  pinChangeError:
    'END Kuma na thina gucenjia PIN yaku. Geria ringi thutha wa dakika nini.',
  pinChangeSuccess:
    'CON Ihoya riaku ria gucenjia PIN yaku niriahotekeka\n0. Coka \n9. Ehera',
  pinManagementMenu:
    'CON Mweke wa PIN\n1. Gucenjia PIN\n2. Kugarura  PIN\n3. Kugitira PIN\n0. Coka',
  socialRecoveryMenu:
    'CON Agiteri PIN\n1. Ikira\n2. Eheria\n3. Rora\n0. Coka',
  wardResetError:
    'END Kuma thina kucejia PIN ya {ward}.',
  wardResetSuccess:
    'CON Niwetikeria ucejanio wa PIN ya: {ward}\n0. Coka\n9. Ehera'
}

export default kik_pins

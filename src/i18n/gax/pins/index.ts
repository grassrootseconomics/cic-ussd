import type { NamespacePinsTranslation } from '../../i18n-types'
import gax from '..'

const { accountBlocked, exit } = gax

const gax_pins: NamespacePinsTranslation = {
  accountBlocked: accountBlocked,
  confirmNewPin:
    'CON Pin hareti ta namba afuuri itdheebi\n0. Dheebi',
  enteringNewPin:
    'CON Pin hareti ta namba afuuri kai\n0. Dheebi',
  enteringOldPin:
    'CON Pin tate kekhai\n0. Dheebi',
  enteringPinWR:
    'CON Pin kake kekhai {ward} badilifaad\n0.Dheebi',
  enteringWard:
    'CON Namba ta atin korkorad kekeyaad ta pin badilifaad\n0.Dheebi',
  exit: exit,
  pinChangeError:
    'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.',
  pinChangeSuccess:
    'CON xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.\n0. Dheebi\n9. Bai',
  pinManagementMenu:
    'CON pin ta atin feet\n1.Pin badilifaad\n2.Pin nam dibii badilifaad\n3.Pin Korkorad\n0.Dheebi',
  socialRecoveryMenu:
    'CON PIN korkorad\n1. Darad\n2. Baas\n3. Laaalad\n0.Dheebi',
  wardResetError:
    'END xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx {ward}.',
  wardResetSuccess:
    'CON Yadandeeth:Yaa pin badilifadu ergan {ward}\n0.Dheebi\n9.Bai'
}

export default gax_pins

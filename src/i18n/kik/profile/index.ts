import type { NamespaceProfileTranslation } from '../../i18n-types'
import kik from '..'
import kik_settings from '../settings';

const { accountBlocked, exit } = kik
const { settingsMenu } = kik_settings

const kik_profile: NamespaceProfileTranslation = {
  accountBlocked: accountBlocked,
  authorizingProfileView:
    'CON Ikira PIN yaku:\n0. Coka',
  changeError:
    'END Hena thina waumera ihinda ria guekira maundu maku. Ndakwihoya ugerie ringi.',
  displayingProfile:
    'CON Maundu makwa:\n{name}\n{gender}\n{age}\n{location}\n{services}\n0. Coka',
  enteringFamilyName:
    'CON Ikira ritwa rwaku ria mwisho:\n0. Coka',
  enteringGivenNames:
    'CON Ikira ritwa ria mbere:\n0. Coka',
  enteringLocation:
    'CON Ikira Itura riaku:\n0. Coka',
  enteringMarketplace:
    'CON Ikira Kindu kana wira uria urendia:\n0. Coka',
  enteringProfileChangePin:
    'CON Ikera PIN yaku:\n0. Coka',
  enteringProfileViewPin:
    'CON Ikera PIN yaku:\n0. Coka',
  enteringYOB:
    'CON Ikira mwaka waku wa guciarwo:\n0. Coka',
  exit: exit,
  profileChangeSuccess:
    'CON Ihoya riaku ria guikira maundu maku niriahotekeka\n0. Coka \n9. Uma',
  profileMenu:
    'CON Maondu maku\n1. Ikira ritwa\n2. Ikira huura\n3. Miaka yaku\n4. Itura riaku\n5. Wendagia ki\n6. Rora maundu\n0. Coka',
  selectingGender:
    'CON Ikira huura yaku\n1.Mudurume\n2.Mutumia\n3.Ingi\n0. Coka',
  settingsMenu: settingsMenu
}

export default kik_profile

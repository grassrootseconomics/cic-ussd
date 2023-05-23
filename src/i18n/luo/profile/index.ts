import type { NamespaceProfileTranslation } from '../../i18n-types'
import luo from '..'
import luo_settings from '../settings'

const { accountBlocked, exit } = luo
const { settingsMenu } = luo_settings

const luo_profile: NamespaceProfileTranslation = {
  accountBlocked: accountBlocked,
  authorizingProfileView:
    'CON Kiyie to ket PIN ni\n0. Chien',
  changeError:
    'END Chandruok oyudre ka waloso ranyis mari. Tem kendo bange',
  displayingProfile:
    'CON Nyanonro:\n{name}\n{gender}\n{age}\n{location}\n{services}\n0. Chien',
  enteringFamilyName:
    'CON Ket nyingi mogik.\n0. Chien',
  enteringGivenNames:
    'CON Xxxxxxxxxxxxxxxxx\n0. Chien',
  enteringLocation:
    'CON Ket kumaidake\n0. Chien',
  enteringMarketplace:
    'CON Ket gima iuso kata tich mitimo\n0. Chien',
  enteringProfileChangePin:
    'CON Kiyie to ket PIN ni\n0. Chien',
  enteringProfileViewPin:
    'CON Kiyie to ket PIN ni\n0. Chien',
  enteringYOB:
    'CON Ket iki mar nyuol\n0. Chien',
  exit: exit,
  profileChangeSuccess:
    'CON Ranyis mari olosre maber\n0. Chien\n9. Wuog',
  profileMenu:
    'CON Wasifu wangu\n1. Ket nyingi\n2. Ket kit chuech mari\n3. Ket iki\n4. Ket kumaidake\n5. Ket gikmaiuso\n6. Ng\'i nyanonro\n0. Chien',
  selectingGender:
    'CON Ket kit chwech mari\n1. Dichuo\n2. Dhako\n3. Moko\n0. Chien',
  settingsMenu: settingsMenu
}

export default luo_profile

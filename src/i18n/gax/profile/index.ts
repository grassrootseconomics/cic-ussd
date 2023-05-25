import type { NamespaceProfileTranslation } from '../../i18n-types'
import gax from '..'
import gax_settings from '../settings'

const { accountBlocked, exit } = gax
const { settingsMenu } = gax_settings

const gax_profile: NamespaceProfileTranslation = {
  accountBlocked: accountBlocked,
  authorizingProfileView:
    'CON PIN kekhai\n0. Dheebi',
  changeError:
    'END Dibii yaayu baat oja wasifu kanke kekeet Saadhii garii itdheebi.',
  displayingProfile:
    'CON Profile\n{name}\n{gender}\n{age}\n{location}\n{services}\n0. Dheebi',
  enteringFamilyName:
    'CON Makhaa ka egee\n0. Dhebii',
  enteringGivenNames:
    'CON Makhaa karaa kor\n0.Dheebi',
  enteringLocation:
    'CON Fulaa athin kubat kor\n. Dhebii',
  enteringMarketplace:
    'CON Waan gurgurt okan namaa kenit khes khae\n0. Dheebi',
  enteringProfileChangePin:
    'CON PIN kekhai\n0. Dheebi',
  enteringProfileViewPin:
    'CON PIN kekhai\n0. Dheebi',
  enteringYOB:
    'CON Gan kake ka athdalat kor\n0. Dheebi',
  exit: exit,
  profileChangeSuccess:
    'CON Kadaa kanke ka wasifu kekeet yakubalan\n0. Dheebi \n9. Bai',
  profileMenu:
    'CON Odhuu Khiy\n1. Maqa kekhai\n2. Dir mo dubr\n3. Gan kekhai\n4. Fulaa kubaat kai\n5. Mih kai\n6. Profile khiy laal\n0. Dheebi',
  selectingGender:
    'CON Athin Dir mo Dubr\n1. Dir\n2. Dubr\n3. Ka dibii\n0. Dheebi',
  settingsMenu: settingsMenu
}

export default gax_profile

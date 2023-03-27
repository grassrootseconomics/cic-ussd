import { NamespaceProfileTranslation } from '../../i18n-types';
import sw from '..'
const { accountBlocked, exit } = sw

const sw_profile = {
  accountBlocked: accountBlocked,
  authorizingProfileView:
    'CON Tafadhali weka PIN yako:\n0. Rudi',
  changeError:
    'END Tatizo limetokea wakati wa kuweka wasifu wako, tafadhali jaribu tena baadaye.',
  displayingProfile:
    'CON Wasifu wangu:\n{name}\n{gender}\n{age}\n{location}\n0. Rudi',
  enteringFamilyName:
    'CON Weka jina lako la familia:\n0. Rudi',
  enteringGivenNames:
    'CON Weka majina yako ya kwanza:\n0. Rudi',
  enteringLocation:
    'CON Weka eneo lako:\n0. Rudi',
  enteringProfileChangePin:
    'CON Tafadhali weka PIN yako:\n0. Rudi',
  enteringProfileViewPin:
    'CON Tafadhali weka PIN yako:\n0. Rudi',
  enteringYOB:
    'CON Weka mwaka wako wa kuzaliwa:\n0. Rudi',
  exit: exit,
  profileChangeSuccess:
    'CON Ombi lako la kuweka wasifu limefanikiwa.\n0. Rudi\n9. Ondoka',
  profileMenu:
    'CON Wasifu wangu\n1. Weka jina\n2. Weka jinsia\n3. Weka mwaka wa kuzaliwa\n4. Weka eneo\n5. Angalia Wasifu\n0. Rudi',
  selectingGender:
    'CON Chagua jinsia:\n1. Mwanaume\n2. Mwanamke\n3. Nyingine\n0. Rudi'

} satisfies NamespaceProfileTranslation

export default sw_profile
import type { NamespaceProfileTranslation } from '../../i18n-types'
import kam from '..'
import kam_settings from '../settings';

const { accountBlocked, exit } = kam
const { settingsMenu } = kam_settings

const kam_profile: NamespaceProfileTranslation = {
  accountBlocked: accountBlocked,
  authorizingProfileView:
    'CON Ikia PIN yaku\n0. Syoka',
  changeError:
    'END ',
  displayingProfile:
    'CON Welesyo wakwa:\n{name}\n{gender}\n{age}\n{location}\n{services}\n0. Syoka',
  enteringFamilyName:
    'CON Ikia isyitwa yaku ya muthya:\n0. Syoka',
  enteringGivenNames:
    'CON Andika isyitwa yaku ya mbee:\n0. Syoka',
  enteringLocation:
    'CON Andika utui waku:\n0. Syoka',
  enteringMarketplace:
    'CON Andika syindu kana huduma ila unenganae kana kuta:\n0. Syoka',
  enteringProfileChangePin:
    'CON Ikia PIN yaku\n0. Syoka',
  enteringProfileViewPin:
    'CON Ikia PIN yaku\n0. Syoka',
  enteringYOB:
    'CON Ikia mwaka wa kusyawa:\n0. Syoka',
  exit: exit,
  profileChangeSuccess:
    'CON ',
  profileMenu:
    'CON Welesyo wakwa\n1. Ikia isyitwa\n2. Ikia muvai\n3. Ikia miaka\n4. Ikia utui\n5. Ikia syindu\n6. Sisya welesyo waku',
  selectingGender:
    'CON Ikia muvai waku\n1. Mundume\n2. Mundumuka\n3. Ingi\n0. Syoka',
  settingsMenu: settingsMenu
}

export default kam_profile

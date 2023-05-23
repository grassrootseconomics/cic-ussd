import type { NamespaceProfileTranslation } from '../../i18n-types'
import mij from '..'
import mij_settings from '../settings';

const { accountBlocked, exit } = mij
const { settingsMenu } = mij_settings

const mij_profile: NamespaceProfileTranslation = {
  accountBlocked: accountBlocked,
  authorizingProfileView:
    'CON Unavoywa piniyo\n0. Uya nyuma',
  changeError:
    'END Kudzombola makosa wakati wakuika wasifuwo, thafadhali jeza kaheri badaye.',
  displayingProfile:
    'CON Malagizo gangu\n{name}\n{gender}\n{age}\n{location}\n{services}\n0. Uya nyuma',
  enteringFamilyName:
    'CON Injiza dzinaro ra mbarini\n0. Uya nyuma',
  enteringGivenNames:
    'CON Injiza dzinaro ra kwanza\n0. Uya nyuma',
  enteringLocation:
    'CON Ika enero wombolako.\n0. Uya nyuma',
  enteringMarketplace:
    'CON Ika Miyoo ama utu uhendao\n' +
    '0. Uya Nyuma',
  enteringProfileChangePin:
    'CON Unavoywa piniyo\n0. Uya nyuma',
  enteringProfileViewPin:
    'CON Unavoywa piniyo\n0. Uya nyuma',
  enteringYOB:
    'CON Ika mwaka wakuvyalwa\n0. Uya Nyuma',
  exit: exit,
  profileChangeSuccess:
    'CON Voyoro ra kwako ra kwika wasifu rikubaliwa\n0. Uya\n9. Laa',
  profileMenu:
    'CON Malagizo Gangu\n1. Ika dzinaro\n2. Ika kala umulume\n3. Ika umurio\n4. Ika eneoro\n5. Ika miyo\n6. Lola malagizo\n0. Uya nyuma',
  selectingGender:
    'CON Ika kala Umulume.\n1. Mulume\n2. Muche\n3. Vinjine\n0. Uya Nyuma',
  settingsMenu: settingsMenu
}

export default mij_profile

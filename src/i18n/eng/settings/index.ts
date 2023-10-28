import type { NamespaceSettingsTranslation } from '../../i18n-types';
import eng_main from '../main'

const { mainMenu } = eng_main

const eng_settings: NamespaceSettingsTranslation = {
  mainMenu: mainMenu,
  settingsMenu:
    'CON My Account\n1. Profile\n2. Change language\n3. Check balances\n4. Check statement\n5. PIN options\n6. My Address\n0. Back',
  displayAddress: 'END Address:\n{address}',
}

export default eng_settings

import type { NamespaceSettingsTranslation } from '../../i18n-types'
import kam_main from '../main';

const { mainMenu } = kam_main

const kam_settings: NamespaceSettingsTranslation = {
  mainMenu: mainMenu,
  settingsMenu:
    'CON Kinandu chakwa\n1. Welesyo wakwa\n2. Sakua luka\n3. Sisya mbalansi\n4. Sisya welesyo\n5. Welesyo wa PIN\n6. Adresi yakwa\n0. Syoka',
  displayAddress: 'CON Adresi:\n{address}\n0. Syoka',
}

export default kam_settings

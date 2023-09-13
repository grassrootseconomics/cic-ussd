import type { NamespaceSettingsTranslation } from '../../i18n-types'
import mij_main from '../main';

const { mainMenu } = mij_main

const mij_settings: NamespaceSettingsTranslation = {
  mainMenu: mainMenu,
  settingsMenu:
    'CON Akaunti yangu\n1. Malagizo gangu\n2. Tsagula luga\n3. Lola sazo\n4. Lola tarifa\n5. Galuza PIN\n6. Adilesi yangu\n0. Uya Nyuma',
  displayAddress: 'CON Adilesi:\n{address}\n0. Uya Nyuma',
}

export default mij_settings

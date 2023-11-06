import type { NamespaceSettingsTranslation } from '../../i18n-types'
import gax_main from '../main';

const { mainMenu } = gax_main

const gax_settings: NamespaceSettingsTranslation = {
  mainMenu: mainMenu,
  settingsMenu:
    'CON Akaunti khiy\n1. Profile khiy\n2. Afaan chaguad\n3. Balansi laalad\n4. Odhuu jalkaba laal\n5. Pin ta atin feet\n6. Adresi khiy\n0. Dheebi',
  displayAddress: 'END Adresi:\n{address}',
}

export default gax_settings

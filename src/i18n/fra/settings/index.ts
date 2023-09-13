import type { NamespaceSettingsTranslation } from '../../i18n-types'
import fra_main from '../main';

const { mainMenu } = fra_main

const fra_settings: NamespaceSettingsTranslation = {
  mainMenu: mainMenu,
  settingsMenu:
    'CON Mon compte\n1. Mon profil\n2. Changer langue\n3. Verifier solde\n4. Dernieres transactions\n5. Options PIN\n6. Mon adresse\n0. Retour',
  displayAddress: 'CON Adresse:\n{address}\n0. Retour',
}

export default fra_settings

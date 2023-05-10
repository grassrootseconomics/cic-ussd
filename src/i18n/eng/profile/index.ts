import type { NamespaceProfileTranslation } from '../../i18n-types';
import eng from '..';
import eng_settings from '../settings';

const { accountBlocked, exit } = eng
const { settingsMenu } = eng_settings


const eng_profile: NamespaceProfileTranslation = {
	accountBlocked: accountBlocked,
	authorizingProfileView:
		'CON Please enter your PIN:\n0. Back',
	changeError:
		'END An error occurred while updating your profile, please try again later.',
	displayingProfile:
		'CON My profile:\n{name}\n{gender}\n{age}\n{location}\n{services}\n0. Back',
	enteringFamilyName:
		'CON Enter your family name:\n0. Back',
	enteringGivenNames:
		'CON Enter your first names:\n0. Back',
	enteringLocation:
		'CON Enter your location:\n0.Back',
	enteringProfileChangePin:
		'CON Please enter your PIN:\n0. Back',
	enteringProfileViewPin:
		'CON Please enter your PIN:\n0. Back',
	enteringMarketplace:
		'CON Enter the services or goods you offer:\n0. Back',
	enteringYOB:
		'CON Enter your year of birth:\n0. Back',
	exit: exit,
	profileChangeSuccess:
		'CON Profile updated successfully.\n0. Back\n9. Exit',
	profileMenu:
		'CON My profile\n1. Edit name\n2. Edit gender\n3. Edit year of birth\n4. Edit location\n5. Edit offerings\n6. View profile\n0. Back',
	selectingGender:
		'CON Select a gender:\n1. Male\n2. Female\n3. Other\n0. Back',
	settingsMenu: settingsMenu,
}

export default eng_profile

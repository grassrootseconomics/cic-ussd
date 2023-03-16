import type { NamespaceProfileTranslation } from '../../i18n-types'

const en_profile = {
	profileMenu:
		"CON My profile\n1. Edit name\n2. Edit gender\n3. Edit year of birth\n4. Edit location\n5. View profile\n0. Back",
	enteringGivenNames:
  	"CON Enter your first names:\n0. Back",
	enteringFamilyName:
		"CON Enter your family name:\n0. Back",
	selectingGender:
		"CON Select a gender:\n1. Male\n2. Female\n3. Other\n0. Back",
	enteringYOB:
		"CON Enter your year of birth:\n0. Back",
	enteringLocation:
		"CON Enter your location:\n0.Back",
	enteringProfileChangePin:
		"CON Please enter your PIN:\n0. Back",
	authorizingProfileView:
		"CON Please enter your PIN:\n0. Back",
	profileChangeSuccess:
		"CON Profile updated successfully.\n0. Back\n9. Exit",
	changeError:
		"END An error occurred while updating your profile, please try again later.",
	enteringProfileViewPin:
		"CON Please enter your PIN:\n0. Back",
	displayingProfile:
		"CON Profile:\n{name|profileValue}\n{gender|profileValue}\n{age|profileValue}\n{location|profileValue}\n0. Back",

} satisfies NamespaceProfileTranslation

export default en_profile

import { CountryCode, parsePhoneNumber } from 'libphonenumber-js'


export function getCountryCodeFromPhoneNumber (phoneNumber: string) {
  const formattedNumber = sanitizePhoneNumber(phoneNumber)
  const parsedPhoneNumber = parsePhoneNumber(formattedNumber)
  if (parsedPhoneNumber) {
    return parsedPhoneNumber.country
  } else {
    throw new Error(
      `Could not retrieve country code phone number: ${phoneNumber}`
    )
  }
}

export function sanitizePhoneNumber (
  phoneNumber: string,
  countryCode?: CountryCode
) {
  // Remove any trailing whitespace
  phoneNumber = phoneNumber.trim()

  if (!phoneNumber.startsWith('+')) {
    try {
      const parsedPhoneNumber = parsePhoneNumber(phoneNumber, countryCode)
      phoneNumber = parsedPhoneNumber.number
    } catch (err) {
      throw new Error(`Could not parse phone number: ${phoneNumber}`)
    }
  }
  return phoneNumber
}

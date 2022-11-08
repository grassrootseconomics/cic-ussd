import { CountryCode, parsePhoneNumber } from 'libphonenumber-js';

/**
 * It takes a country code and a phone number, and returns a formatted phone number
 * in E.164 format
 * @param {CountryCode} countryCode - The country code of the phone number.
 * @param {string} phoneNumber - The phone number to be formatted.
 * @returns A string
 */
export async function formatPhoneNumberToE164(countryCode : CountryCode, phoneNumber : string) : Promise<string> {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, countryCode);
  return parsedPhoneNumber.format('E.164');
}

/**
 * It takes a phone number as a string, and returns the country code of that phone
 * number as a string
 * @param {string} phoneNumber - The phone number to parse.
 * @returns A promise that resolves to a country code.
 */
export async function getCountryCodeFromPhoneNumber(phoneNumber : string) : Promise<CountryCode> {
  let formattedNumber;
  if (!phoneNumber.startsWith('+')) {
    formattedNumber = `+${phoneNumber}`
  } else {
    formattedNumber = phoneNumber
  }
  const parsedPhoneNumber = parsePhoneNumber(formattedNumber);
  return parsedPhoneNumber.country as CountryCode;
}

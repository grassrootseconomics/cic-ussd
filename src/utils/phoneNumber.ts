import { parsePhoneNumber } from 'libphonenumber-js';

/**
 * It takes a phone number as a string, and returns the country code of that phone
 * number as a string
 * @param {string} phoneNumber - The phone number to parse.
 * @returns A promise that resolves to a country code.
 */
export function getCountryCodeFromPhoneNumber(phoneNumber : string){
  const formattedNumber = sanitizePhoneNumber(phoneNumber);
  const parsedPhoneNumber = parsePhoneNumber(formattedNumber);
  if (parsedPhoneNumber) {
    return parsedPhoneNumber.country;
  } else {
    throw new Error(`Could not retrieve country code phone number: ${phoneNumber}`);
  }
}

export function sanitizePhoneNumber(phoneNumber : string) {
  // Remove any trailing whitespace
  phoneNumber = phoneNumber.trim();

  // TODO[Philip]: Consider improving this in the future. POC scope is limited to CM, KE and ZA for now, so it's fine.
  // if phone number doesn't start with a +, add it
  if (!phoneNumber.startsWith('+')) {
    phoneNumber = `+${phoneNumber}`
  }
  return phoneNumber;
}

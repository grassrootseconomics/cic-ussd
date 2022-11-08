import { createPointer } from './pointer';

/* A constant that is used to create a session id. */
export enum ussdSalt {
  SESSION_ID = 'cic:ussd:session_id',
  SESSION_TRACKER = 'cic:ussd:session_tracker',
}

/**
 * It creates a session id from a phone number and a session tracker
 * @param {string} phoneNumber - The phone number of the user
 * @param {string} sessionTracker - This is a unique string that identifies the
 * session. It is usually a combination of the phone number and a random string.
 * @returns A session id
 */
export async function createSessionId(phoneNumber: string, sessionTracker: string){
  return createPointer([phoneNumber, sessionTracker, ussdSalt.SESSION_ID]);
}

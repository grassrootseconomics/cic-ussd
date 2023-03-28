import { SessionRequest } from '@services/session';
import { getCountryCodeFromPhoneNumber } from '@utils/phoneNumber';

/**
 * Description placeholder
 *
 * @type {{ type: string; properties: { phoneNumber: { type: string; }; sessionId: { type: string; }; serviceCode: { type: string; }; text: { type: string; }; }; required: {}; }}
 */
export const ATRequestBody = {
  type: 'object',
  properties: {
    phoneNumber: { type: 'string' },
    sessionId: { type: 'string' },
    serviceCode: { type: 'string' },
    text: { type: 'string' }
  },
  required: ['phoneNumber', 'sessionId', 'serviceCode', 'text']
}

/**
 * Description placeholder
 *
 * @export
 * @interface ATRequest
 * @typedef {ATRequest}
 */
export interface ATRequest {
  /**
   * Description placeholder
   *
   * @type {string}
   */
  phoneNumber: string
  /**
   * Description placeholder
   *
   * @type {string}
   */
  networkCode: string
  /**
   * Description placeholder
   *
   * @type {string}
   */
  sessionId: string
  /**
   * Description placeholder
   *
   * @type {string}
   */
  serviceCode: string
  /**
   * Description placeholder
   *
   * @type {string}
   */
  text: string
}

/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {SessionRequest} request
 * @returns {*}
 */
export async function ATOnRequestHook (request: SessionRequest) {
  request.uContext = {}
}

/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {SessionRequest} request
 * @returns {*}
 */
export async function ATPreHandlerHook (request: SessionRequest) {
  const { phoneNumber, sessionId, serviceCode, text } = request.body as ATRequest
  const countryCode = getCountryCodeFromPhoneNumber(phoneNumber)
  const responseContentType = 'application/json'
  const input = text.split('*').pop() || ''
  request.uContext["ussd"] = {
    countryCode,
    input,
    phoneNumber,
    responseContentType,
    requestId: sessionId,
    serviceCode,
  }
}

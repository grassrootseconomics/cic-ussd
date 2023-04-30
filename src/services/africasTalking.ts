import { SystemError } from '@lib/errors';
import { getCountryCode } from '@lib/ussd';
import { SessionRequest } from '@services/session';

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

export interface ATRequest {
  phoneNumber: string
  networkCode: string
  sessionId: string
  serviceCode: string
  text: string
}

export async function ATOnRequestHook(request: SessionRequest) {
  request.uContext = { };
}

export async function ATPreHandlerHook(request: SessionRequest) {
  const { phoneNumber, sessionId, serviceCode, text } = request.body as ATRequest;

  const countryCode = await getCountryCode(phoneNumber);
  if (!countryCode) {
    throw new SystemError(`Could not determine country code from phone number: ${phoneNumber}`);
  }

  request.uContext.ussd = {
    countryCode,
    input: text.split('*').pop() || '',
    phoneNumber,
    responseContentType: 'application/json',
    requestId: sessionId,
    serviceCode,
  };
}


import { SystemError } from '@lib/errors';
import { SessionRequest } from '@services/session';
import { getCountryCode } from '@lib/ussd';
import { config } from '@/config';
import { logger } from '@/app';
import iconv from "iconv-lite"

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

  logger.debug({
    inputUtf8Buffer: iconv.encode(text, "utf8"),
    phoneNumber: phoneNumber,
  }, "AT request as utf8 buffer")
  
  logger.debug({
    inputLatin1Buffer: iconv.encode(text, "ISO-8859-1"),
    phoneNumber: phoneNumber,
  }, "AT reuqest text as latin1 buffer")

  const countryCode = await getCountryCode(phoneNumber)
  if (!countryCode) {
    throw new SystemError(`Could not determine country code from phone number: ${phoneNumber}`);
  }

  if(!config.KE.SERVICE_CODES.includes(serviceCode)) {
    throw new SystemError(`Invalid service code: ${serviceCode}`);
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


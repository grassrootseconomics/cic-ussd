import { Redis } from 'ioredis';
import { JsonSerializer } from 'typescript-json-serializer';

import { UssdContext } from '../../helpers/context';
import { getCountryCodeFromPhoneNumber } from '../../helpers/phoneNumber';
import { createSessionId } from '../../helpers/ussd';
import {
  NexahRequest,
  TelcoRequest
} from '../interfaces/telcoRequest';
import { getSessionTracker } from '../ussd/cache/session';

export class NexahRequestHandler implements TelcoRequest {
  cache: Redis;
  request: NexahRequest;
  responseContentType: string;
  serializer: JsonSerializer;

  constructor(cache: Redis, request: NexahRequest, responseContentType: string, serializer: JsonSerializer) {
    this.cache = cache;
    this.request = request;
    this.responseContentType = responseContentType;
    this.serializer = serializer;
  }

  /**
   * It takes the request from the USSD gateway, creates a sessionId and returns an
   * object with the sessionId, phoneNumber and the USSD response
   * @returns A promise that resolves to an object with the following properties:
   * - actorInput: The user's response to the previous question
   * - phoneNumber: The user's phone number
   * - sessionId: A unique identifier for the session
   */
  async parse(): Promise<UssdContext> {
    const phoneNumber =  this.request.msisdn
    const sessionTracker = await getSessionTracker(this.cache, phoneNumber, this.serializer) as string;
    return {
      actorInput: this.request.ussd_response,
      countryCode: await getCountryCodeFromPhoneNumber(phoneNumber),
      phoneNumber: this.request.msisdn,
      sessionId: await createSessionId(this.request.msisdn, sessionTracker),
      ussdCode: this.request.ussd_code,
      responseContentType: this.responseContentType
    }
  }

}

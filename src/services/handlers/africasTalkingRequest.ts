import { UssdContext } from '../../helpers/context';
import { getCountryCodeFromPhoneNumber } from '../../helpers/phoneNumber';
import {
  AfricasTalkingRequest,
  TelcoRequest
} from '../interfaces/telcoRequest';

export class AfricasTalkingRequestHandler implements TelcoRequest {
  request
  responseContentType

  constructor(request: AfricasTalkingRequest, responseContentType: string) {
    this.request = request;
    this.responseContentType = responseContentType;
  }

  /**
   * It takes the request object and returns an object with the phone number and
   * the actor input
   * @returns An object with two properties: phoneNumber and actorInput.
   */
  async parse(): Promise<UssdContext> {
    return {
      actorInput: this.request.text,
      countryCode: await getCountryCodeFromPhoneNumber(this.request.phoneNumber),
      phoneNumber: this.request.phoneNumber,
      sessionId: this.request.sessionId,
      ussdCode: this.request.serviceCode,
      responseContentType: this.responseContentType
    }
  }
}

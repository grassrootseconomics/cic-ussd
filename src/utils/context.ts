/* Defining the interface for the UssdContext object. */
export interface UssdContext {
  actorInput: string;
  countryCode: string;
  phoneNumber: string;
  responseContentType: string;
  sessionId: string;
}
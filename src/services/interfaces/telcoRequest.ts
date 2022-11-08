/* Defining an interface for the AfricasTalkingRequest object. */
import { UssdContext } from '../../helpers/context';

export interface AfricasTalkingRequest {
  phoneNumber: string;
  networkCode: string;
  serviceCode: string;
  sessionId: string;
  text: string;
}

/* Defining an interface for the NexahRequest object. */
export interface NexahRequest {
  operator: string;
  msisdn: string;
  msg_type: number;
  ussd_code: string;
  ussd_response: string;
}

/* Defining an interface for the TelcoRequest object. */
export interface TelcoRequest {
  parse: () => Promise<UssdContext>;
}

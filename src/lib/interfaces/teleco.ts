import { UssdContext } from "@utils/helpers/context";

/* Defining an interface for the TelecoRequest object. */
export interface TelecoRequest {
  parse: () => Promise<UssdContext>;
}
import { UssdContext } from "@utils/context";

/* Defining an interface for the TelecoRequest object. */
export interface TelecoRequest {
  parse: () => Promise<UssdContext>;
}
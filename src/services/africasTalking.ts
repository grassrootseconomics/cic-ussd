import { FastifyReply } from "fastify";
import { getCountryCodeFromPhoneNumber } from "@utils/phoneNumber";
import { UssdSessionRequest } from "@src/services/ussdSession";

export const ATRequestBody = {
    type: "object",
    properties: {
      phoneNumber: { type: "string" },
      sessionId: { type: "string" },
      serviceCode: { type: "string" },
      text: { type: "string" }
    }
}

// create a hook to initialize the ussdContext object for each request.
export async function ATOnRequestHook(request: UssdSessionRequest, reply: FastifyReply) {
  request.ussdContext = {}
}

// create a hook to populate the ussdContext object for each request.
export async function ATPreHandlerHook(request: UssdSessionRequest, reply: FastifyReply) {
  const { phoneNumber, sessionId, serviceCode, text } = request.body as any;
  const countryCode = getCountryCodeFromPhoneNumber(phoneNumber) || "";
  const responseContentType = "application/json";
  const actorInput = text.split("*").pop() || "";
  request.ussdContext = {
    actorInput,
    countryCode,
    phoneNumber,
    responseContentType,
    sessionId
  }
}

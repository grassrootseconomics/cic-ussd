/* Defining the interface for the UssdContext object. */
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { PoolClient } from "pg";
import { UssdSession } from "@utils/ussdSession";

export interface UssdContext {
  account: any;
  db?: PoolClient;
  session?: UssdSession;
  data? : Record<string, string>;
  actorInput: string;
  countryCode: string;
  phoneNumber: string;
  responseContentType: string;
  serviceCode: string;
  sessionId: string;
  errorMessages?: string[]
}
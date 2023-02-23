import { userFields } from "@lib/types/graph/user";


export enum AccountType {
  CUSTODIAL_PERSONAL = 'CUSTODIAL_PERSONAL',
  CUSTODIAL_BUSINESS = "CUSTODIAL_BUSINESS",
  CUSTODIAL_COMMUNITY = "CUSTODIAL_COMMUNITY",
  CUSTODIAL_SYSTEM = "CUSTODIAL_SYSTEM",
  NON_CUSTODIAL_PERSONAL = "NON_CUSTODIAL_PERSONAL",
  NON_CUSTODIAL_BUSINESS = "NON_CUSTODIAL_BUSINESS",
  NON_CUSTODIAL_COMMUNITY = "NON_CUSTODIAL_COMMUNITY",
  NON_CUSTODIAL_SYSTEM = "NON_CUSTODIAL_SYSTEM",
}
export const accountFields = `{
    account_type
    blockchain_address
    created_at
    id
    user ${userFields}
  }`

export type Account = {
  account_type?: string;
  blockchain_address?: string;
  user_identifier?: string;
}
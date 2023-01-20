export const userAccountFields = `accounts {
            id
          }`

export const personalInformationFields = `{
            family_name
            gender
            gender_type {
              value
            }
            geo
            given_names
            location_name
            user_identifier
            year_of_birth
          }`

export const userFields = `{
          id
          created_at
          activated
          personal_information ${personalInformationFields}
          ${userAccountFields}
        }`

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum InterfaceType {
  USSD = "USSD",
  WEB = "WEB",
}

export type  PersonalInformation = {
  family_name?: string;
  gender?: string;
  gender_type?: {
    value?: string;
  }
  geo?: string;
  given_names?: string;
  location_name?: string;
  user_identifier?: number;
  year_of_birth?: number;
}

export type User = {
  activated: boolean;
  interface_identifier: string;
  interface_type: string;
  personal_information?: PersonalInformation;
}
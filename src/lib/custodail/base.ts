import { config } from "@src/config";
import { RegistrationResponse } from "@lib/types/custodail/api";

export class CicCustodial {
  //TODO[Philip]: Consider separating these member functions into separate files should functionality ever balloon.

  static async createWallet() {
    await fetch(config.CIC_CUSTODIAL.REGISTER_ENDPOINT, {
      method: 'POST',
    })
      .then((response) => {

      })
  }
}
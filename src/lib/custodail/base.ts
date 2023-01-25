import { config } from "@src/config";
import { RegistrationResponse, Transfer, TransferResponse } from "@lib/types/custodail/api";

export class CicCustodial {
  //TODO[Philip]: Consider separating these member functions into separate files should functionality ever balloon.

  static async createWallet(): Promise <RegistrationResponse> {
    const response = await fetch(config.CIC_CUSTODIAL.REGISTER_ENDPOINT, {
      method: 'POST'
    });

    if (!response.ok) {
      console.error('Failed to create wallet');
      throw new Error(`Failed to create wallet: ${response.status} ${response.statusText}`);
    }

    console.log('Successfully created wallet');
    return await response.json();
  }

  static async transfer(payload: Transfer): Promise <TransferResponse> {
    const response = await fetch(config.CIC_CUSTODIAL.TRANSFER_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Failed to initiate transfer.');
      throw new Error(`Failed to transfer funds: ${response.status} ${response.statusText}`);
    }

    console.log('Successfully initiated transfer.')
    return await response.json();
  }

  static async queryBalance(publicKey: string): Promise <void> {
    //TODO[Philip]: Not implemented yet.
  }
}
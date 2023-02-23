import { config } from "@src/config";
import { RegistrationResponse, Transfer, TransferResponse } from "@lib/types/custodail/api";

export async function createWallet(): Promise <RegistrationResponse> {
    const url = config.CIC_CUSTODIAL.REGISTER_ENDPOINT;

    const response = await fetch(url, {
      method: 'POST'
    });

    if (!response.ok) {
      console.error('Failed to create wallet');
      throw new Error(`Failed to create wallet: ${response.status} ${response.statusText}`);
    }

    console.debug('Successfully created wallet');
    return await response.json();
}

export async function transfer(payload: Transfer): Promise <TransferResponse> {
  const response = await fetch(config.CIC_CUSTODIAL.TRANSFER_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error('Failed to initiate transfer.');
    throw new Error(`Failed to transfer funds: ${response.status} ${response.statusText}`);
  }

  console.debug('Successfully initiated transfer.')
  return await response.json();
}

export async function queryBalance(publicKey: string): Promise <void> {
  //TODO[Philip]: Not implemented yet.
}
import { config } from '@src/config';

interface RegistrationResponse {
  errorCode?: string
  message?: string
  ok: boolean
  result?: {
    custodialId: number
    publicKey: string
    trackingId: string
  }
}

interface TransferPayload {
  amount: number
  from: string
  to: string
  voucherAddress: string
}

interface TransferResponse {
  errorCode?: string
  message?: string
  ok: boolean
  result?: {
    trackingId: string
  }
}

export async function createWallet(): Promise<RegistrationResponse> {
  const response = await fetch(config.CIC_CUSTODIAL.REGISTER_ENDPOINT, {
    method: 'POST'
  })

  if (!response.ok) {
    console.error('Failed to create wallet.')
    throw new Error(`Failed to create wallet: ${response.status} ${response.statusText}`)
  }

  console.debug('Successfully created wallet.')
  return await response.json()
}

export async function custodialTransfer (payload: TransferPayload): Promise<TransferResponse> {
  console.debug('Initiating transfer...')
  const response = await fetch(config.CIC_CUSTODIAL.TRANSFER_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    if (response) {
      const json = await response.json()
      console.error(`Failed to initiate transfer: ${json.errorCode}, ${json.message}`)
    }
    throw new Error(`Failed to initiate transfer: ${response.status} ${response.statusText}`)
  }

  console.debug('Successfully initiated transfer.')
  return await response.json()
}

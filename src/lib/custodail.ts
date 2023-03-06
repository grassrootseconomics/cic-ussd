import { config } from "@src/config";
import { randomBytes, randomUUID, randomInt } from "crypto";

/**
 * Description placeholder
 * @date 3/3/2023 - 10:39:37 AM
 *
 * @interface RegistrationResponse
 * @typedef {RegistrationResponse}
 */
interface RegistrationResponse {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {boolean}
   */
  ok: boolean
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {?{
      custodialId: number
      publicKey: string
      trackingId: string
    }}
   */
  result?: {
    custodialId: number
    publicKey: string
    trackingId: string
  }
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {?string}
   */
  errorCode?: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {?string}
   */
  message?: string
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:39:37 AM
 *
 * @interface TransferPayload
 * @typedef {TransferPayload}
 */
interface TransferPayload {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {string}
   */
  from: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {string}
   */
  to: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {string}
   */
  voucherAddress: string
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {string}
   */
  amount: string
}


/**
 * Description placeholder
 * @date 3/3/2023 - 10:39:37 AM
 *
 * @interface TransferResponse
 * @typedef {TransferResponse}
 */
interface TransferResponse {
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {boolean}
   */
  ok: boolean
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {?{
      trackingId: string
    }}
   */
  result?: {
    trackingId: string
  }
  /**
   * Description placeholder
   * @date 3/3/2023 - 10:38:18 AM
   *
   * @type {?string}
   */
  error?: string
}

export async function createWallet(): Promise<RegistrationResponse> {
  if(config.DEV){
    return {
      ok: true,
      result: {
        publicKey: randomBytes(21).toString('hex'),
        trackingId: randomUUID().toString(),
        custodialId: randomInt(10000000)
      }
    }
  }

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


/**
 * Description placeholder
 * @date 3/3/2023 - 10:39:37 AM
 *
 * @export
 * @async
 * @param {TransferPayload} payload
 * @returns {Promise<TransferResponse>}
 */
export async function custodialTransfer (payload: TransferPayload): Promise<TransferResponse> {
  const response = await fetch(config.CIC_CUSTODIAL.TRANSFER_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = new Error(`Failed to transfer funds: ${response.status} ${response.statusText}`)
    console.error('Failed to initiate transfer.', error)
    throw error
  }

  console.debug('Successfully initiated transfer.')
  return await response.json()
}

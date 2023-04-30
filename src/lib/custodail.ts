import { config } from '@/config';
import { logger } from '@/app';

export enum TxType {
  REGISTER = "register",
  TRANSFER = "transfer",
  TRANSFER_FROM = "transferFrom",
  MINT_TO = "mintTo",
}

export interface CustodialEvent {
  block: number;
  contractAddress: string;
  timestamp: number;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  txType: TxType;
}

export interface RegistrationEvent extends CustodialEvent {}

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

export interface TransferEvent extends CustodialEvent {
  from: string;
  success: boolean;
  value: number;
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
  const response = await fetch(`${config.CIC.CUSTODIAL}/api/account/create`, {
    method: 'POST'
  })

  if (!response.ok) {
    logger.error('Failed to create wallet.')
    throw new Error(`Failed to create wallet: ${response.status} ${response.statusText}`)
  }

  logger.debug('Successfully created wallet.')
  return await response.json()
}

export async function custodialTransfer (payload: TransferPayload): Promise<TransferResponse> {
  logger.debug('Initiating transfer...')
  const response = await fetch(`${config.CIC.CUSTODIAL}/api/sign/transfer`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    logger.error('Failed to initiate transfer.')
    throw new Error(`Failed to initiate transfer: ${response.status} ${response.statusText}`)
  }

  logger.debug('Successfully initiated transfer.')
  return await response.json()
}

export type RegistrationResponse = {
  ok: boolean;
  result?: {
    custodialId: number;
    publicKey: string;
    trackingId: string;
  }
  errorCode?: string,
  message?: string,
}

export type Transfer = {
  from: string;
  to: string;
  voucherAddress: string;
  amount: string;
}

export type TransferResponse = {
  ok: boolean;
  result? : {
    trackingId: string;
  }
  error? : string;
}

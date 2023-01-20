export type RegistrationResponse = {
  ok: boolean;
  data?: {
    publicKey: string;
    taskRef: string;
  }
  error?: string;
}

export type Transfer = {
  from: string;
  to: string;
  voucherAddress: string;
  amount: string;
}

export type TransferResponse = {
  ok: boolean;
  data? : {
    taskRef: string;
  }
  error? : string;
}

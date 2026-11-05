export type TransferStatus = 'AUTHORIZED' | 'REJECTED';

export type RejectionReason =
  | 'INVALID_AMOUNT'
  | 'SAME_ACCOUNT'
  | 'ACCOUNT_NOT_FOUND'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'INSUFFICIENT_BALANCE';

export interface TransferRequest {
  requestReference: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
}

export interface Transfer extends TransferRequest {
  id: number;
  status: TransferStatus;
  rejectionReason: RejectionReason | null;
  processedAt: string;
}

/** replayed: the reference was already processed and the original result was returned. */
export interface TransferResult {
  transfer: Transfer;
  replayed: boolean;
}

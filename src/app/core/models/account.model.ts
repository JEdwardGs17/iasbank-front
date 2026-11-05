export enum AccountType {
  SAVINGS = 'SAVINGS',
  CHECKING = 'CHECKING',
}

export interface Account {
  id: number;
  accountNumber: string;
  holder: string;
  balance: number;
  accountType: AccountType;
  dailyLimit: number;
}

export interface AccountRequest {
  accountNumber: string;
  holder: string;
  balance: number;
  accountType: AccountType;
  dailyLimit: number;
}

export interface TransactionRequest {
  accountNumber: string;
  amount: number;
}

// Types for bank operations

export interface DepositBankParams {
  cbu: string;
  amount: string;
}

export interface WithdrawBankParams {
  cbu: string;
  amount: string;
}

export interface BankResponse {
  success: boolean;
  transaction?: any;
  bank_response?: any;
  error?: string;
}

export interface BankTransactionResult {
  success: boolean;
  transactionId?: string;
  message: string;
  transaction?: any;
  bank_response?: any;
}

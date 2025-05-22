// Types para operaciones de dinero

export interface LoadMoneyParams {
  amount: string;
  recipient: string;
  bank: string;
}

export interface SendMoneyParams {
  amount: string;
  email: string;
}

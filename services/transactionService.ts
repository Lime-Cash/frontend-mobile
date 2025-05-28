import { get } from "../api/axios";

export interface Transaction {
  id: string;
  type: "transfer_sent" | "transfer_received";
  created_at: string;
  to_account?: string;
  from_account?: string;
  amount: number;
}

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await get<Transaction[]>("/activity");
    return response.data;
  },

  getTransactionById: async (id: string): Promise<Transaction | null> => {
    console.log(`TransactionService: Fetching transaction with id: ${id}`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const transactions = await transactionService.getTransactions();
    return transactions.find((transaction) => transaction.id === id) || null;
  },
};

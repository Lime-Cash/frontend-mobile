import { useState, useEffect } from "react";
import { transactionService } from "@/services/transactionService";

interface TransactionData {
  id: string;
  message: string;
  created_at: string;
  amount: number;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await transactionService.getTransactions();
      setTransactions(
        data.map(
          (transaction) =>
            ({
              id: transaction.id,
              message: getMessage(
                transaction.type,
                transaction.to_account,
                transaction.from_account,
              ),
              created_at: getDate(transaction.created_at),
              amount:
                transaction.type === "transfer_sent"
                  ? -transaction.amount
                  : transaction.amount,
            }) as TransactionData,
        ),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch transactions";
      setError(errorMessage);
      console.error("Error fetching transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const refreshTransactions = () => {
    fetchTransactions();
  };

  const getMessage = (
    type: string,
    to_account?: string,
    from_account?: string,
  ) => {
    if (type === "transfer_sent" && to_account) {
      return `Transfer Sent to ${to_account}`;
    } else if (type === "transfer_received" && from_account) {
      return `Transfer Received from ${from_account}`;
    } else {
      return "Unknown transaction";
    }
  };

  const getDate = (created_at: string) => {
    return new Date(created_at).toLocaleDateString();
  };

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions,
  };
};

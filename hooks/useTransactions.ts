import { useState, useEffect } from "react";
import { transactionService, Transaction } from "@/services/transactionService";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
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

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions,
  };
};

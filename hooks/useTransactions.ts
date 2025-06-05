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
                transaction.transaction_type,
                transaction.to_account,
                transaction.from_account,
              ),
              created_at: getDate(transaction.created_at),
              amount: getTransactionAmount(transaction),
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
    transaction_type?: string,
    to_account?: string,
    from_account?: string,
  ) => {
    // Handle new bank transaction types
    if (type === "transaction" && transaction_type) {
      if (transaction_type === "deposit") {
        return "Bank Deposit";
      } else if (transaction_type === "withdrawal") {
        return "Bank Withdrawal";
      }
    }
    
    // Handle existing transfer types
    if (type === "transfer_sent" && to_account) {
      return `Transfer Sent to ${to_account}`;
    } else if (type === "transfer_received" && from_account) {
      return `Transfer Received from ${from_account}`;
    }
    
    return "Unknown transaction";
  };

  const getTransactionAmount = (transaction: any) => {
    // For withdrawals, ensure negative amount
    if (transaction.type === "transaction" && transaction.transaction_type === "withdrawal") {
      return -Math.abs(transaction.amount);
    }
    
    // For deposits, ensure positive amount
    if (transaction.type === "transaction" && transaction.transaction_type === "deposit") {
      return Math.abs(transaction.amount);
    }
    
    // For transfers, keep existing logic
    if (transaction.type === "transfer_sent") {
      return -transaction.amount;
    }
    
    return transaction.amount;
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

import { useState } from "react";
import { LoadMoneyParams } from "@/types/money";
import { moneyService } from "@/services/moneyService";

export const useLoadMoney = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const loadMoney = async (params: LoadMoneyParams) => {
    setIsLoading(true);
    setError(null);
    setTransactionId(null);

    try {
      const result = await moneyService.loadMoney(params);
      setTransactionId(result.transactionId || null);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadMoney,
    isLoading,
    error,
    transactionId,
  };
};

import { useState, useEffect } from "react";
import { moneyService } from "@/services/moneyService";

export const useBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await moneyService.getBalance();
      setBalance(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMessage);
      console.error("Error fetching balance:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const refreshBalance = () => {
    fetchBalance();
  };

  return {
    balance,
    isLoading,
    error,
    refreshBalance,
  };
};

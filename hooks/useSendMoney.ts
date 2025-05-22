import { useState } from "react";
import { SendMoneyParams } from "@/types/money";
import { moneyService } from "@/services/moneyService";

export const useSendMoney = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMoney = async (params: SendMoneyParams): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const result = await moneyService.sendMoney(params);
    setIsLoading(false);
    if (result.success) {
      return true;
    } else {
      setError(result.message);
      return false;
    }
  };

  return {
    sendMoney,
    isLoading,
    error,
  };
};

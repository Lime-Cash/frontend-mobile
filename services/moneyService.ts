import { LoadMoneyParams, SendMoneyParams } from "@/types/money";
import { get } from "@/api/axios";

interface BalanceResponse {
  balance: string;
}

export const moneyService = {
  loadMoney: async (
    params: LoadMoneyParams
  ): Promise<{ success: boolean; transactionId?: string }> => {
    console.log("MoneyService: Loading money with params:", params);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (Math.random() < 0.9) {
      return {
        success: true,
        transactionId: "txn_" + Math.random().toString(36).substring(2, 15),
      };
    }

    throw new Error("Error processing transaction from bank");
  },

  sendMoney: async (
    params: SendMoneyParams
  ): Promise<{ success: boolean; transactionId?: string }> => {
    console.log("MoneyService: Sending money with params:", params);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (Math.random() < 0.8) {
      return {
        success: true,
        transactionId: "txn_" + Math.random().toString(36).substring(2, 15),
      };
    }

    throw new Error("Error processing transaction");
  },

  getBalance: async (): Promise<number> => {
    try {
      const response = await get<BalanceResponse>("/my_balance");
      console.log("Balance response:", response);
      return parseFloat(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw new Error("Failed to fetch account balance");
    }
  },
};

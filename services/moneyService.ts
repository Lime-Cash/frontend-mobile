import { LoadMoneyParams, SendMoneyParams } from "@/types/money";
import { get, post } from "@/api/axios";
import { AxiosError } from "axios";

interface BalanceResponse {
  balance: string;
}

export const moneyService = {
  loadMoney: async (
    params: LoadMoneyParams,
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
    params: SendMoneyParams,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await post<
        { message: string; error?: string },
        SendMoneyParams
      >("/transfer", params);

      if (response.status === 200 || response.status === 201) {
        return { success: true, message: response.data.message };
      } else {
        return {
          success: false,
          message: response.data.error || "Unknown error",
        };
      }
    } catch (error) {
      console.log("Error sending money:", error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          return {
            success: false,
            message: error.response?.data.message || "Unknown error",
          };
        } else if (error.response?.status === 404) {
          return {
            success: false,
            message: "User not found",
          };
        }
      }
      return {
        success: false,
        message: "Unknown error",
      };
    }
  },

  getBalance: async (): Promise<number> => {
    try {
      const response = await get<BalanceResponse>("/balance");
      console.log("Balance response:", response);
      return parseFloat(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw new Error("Failed to fetch account balance");
    }
  },
};

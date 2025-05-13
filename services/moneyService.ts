import { LoadMoneyParams, SendMoneyParams } from "@/types/money";

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
};

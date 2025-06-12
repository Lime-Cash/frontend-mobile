import { post } from "../api/axios";
import axios, { AxiosError } from "axios";
import {
  DepositBankParams,
  WithdrawBankParams,
  BankResponse,
  BankTransactionResult,
} from "@/types/bank";

export const bankService = {
  // Load money (deposit from bank account to app account)
  depositFromBank: async (
    params: DepositBankParams,
  ): Promise<BankTransactionResult> => {
    try {
      const response = await post<BankResponse, DepositBankParams>(
        "/deposit_bank",
        {
          cbu: params.cbu,
          amount: params.amount,
        },
      );

      if (response.data.success) {
        return {
          success: true,
          transactionId: response.data.transaction?.id || "unknown",
          message: `Successfully loaded $${params.amount} from bank account`,
          transaction: response.data.transaction,
          bank_response: response.data.bank_response,
        };
      } else {
        return {
          success: false,
          message: response.data.error || "Deposit failed",
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BankResponse>;

        // Check if we have error data in the response (like 422 with error message)
        if (axiosError.response?.data?.error) {
          return {
            success: false,
            message: axiosError.response.data.error,
          };
        }

        // Check if we have success: false in the response data
        if (
          axiosError.response?.data &&
          "success" in axiosError.response.data &&
          !axiosError.response.data.success
        ) {
          return {
            success: false,
            message: axiosError.response.data.error || "Deposit failed",
          };
        }

        // Handle specific HTTP status codes
        if (axiosError.response?.status === 422) {
          return {
            success: false,
            message:
              "Transaction failed - please check your details and try again",
          };
        }

        if (axiosError.response?.status === 400) {
          return {
            success: false,
            message: "Invalid request - please check your input",
          };
        }
      }

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during deposit",
      };
    }
  },

  // Withdraw money (withdraw from app account to bank account)
  withdrawToBank: async (
    params: WithdrawBankParams,
  ): Promise<BankTransactionResult> => {
    try {
      console.log("BankService: Withdrawing money with params:", params);

      const response = await post<BankResponse, WithdrawBankParams>(
        "/withdraw_bank",
        {
          cbu: params.cbu,
          amount: params.amount,
        },
      );

      if (response.data.success) {
        return {
          success: true,
          transactionId: response.data.transaction?.id || "unknown",
          message: `Successfully withdrew $${params.amount} to bank account`,
          transaction: response.data.transaction,
          bank_response: response.data.bank_response,
        };
      } else {
        return {
          success: false,
          message: response.data.error || "Withdrawal failed",
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BankResponse>;

        // Check if we have error data in the response (like 422 with error message)
        if (axiosError.response?.data?.error) {
          return {
            success: false,
            message: axiosError.response.data.error,
          };
        }

        // Check if we have success: false in the response data
        if (
          axiosError.response?.data &&
          "success" in axiosError.response.data &&
          !axiosError.response.data.success
        ) {
          return {
            success: false,
            message: axiosError.response.data.error || "Withdrawal failed",
          };
        }

        // Handle specific HTTP status codes
        if (axiosError.response?.status === 422) {
          return {
            success: false,
            message:
              "Transaction failed - please check your details and try again",
          };
        }

        if (axiosError.response?.status === 400) {
          return {
            success: false,
            message: "Invalid request - please check your input",
          };
        }
      }

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error occurred during withdrawal",
      };
    }
  },
};

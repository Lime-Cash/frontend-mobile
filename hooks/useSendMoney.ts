import { Alert } from "react-native";

interface SendMoneyParams {
  amount: string;
  recipient: string;
}

export const useSendMoney = () => {
  const sendMoney = ({ amount, recipient }: SendMoneyParams) => {
    console.log("Sending money", { amount, recipient });

    // Simulate backend error
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        Alert.alert(
          "Error",
          "There was a problem processing your transaction. Please try again later.",
          [{ text: "OK" }]
        );
      }, 1000);
    });
  };

  return { sendMoney };
};

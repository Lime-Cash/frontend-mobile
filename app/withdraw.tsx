import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ViewContainer from "@/components/ui/ViewContainer";
import MoneyInput from "@/components/ui/MoneyInput";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSendMoney } from "@/hooks/useSendMoney";

const Withdraw = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errors, setErrors] = useState({
    amount: "",
    recipient: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const { sendMoney } = useSendMoney();

  const handleSend = async () => {
    try {
      setIsLoading(true);
      await sendMoney({ amount, recipient });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ViewContainer>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColor.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Withdraw Money</ThemedText>
      </View>

      <View style={styles.contentContainer}>
        <MoneyInput
          value={amount}
          onChangeText={(value) => {
            setAmount(value);
            if (value) setErrors({ ...errors, amount: "" });
          }}
          containerStyle={styles.moneyInput}
          autoFocus
        />
        {errors.amount ? (
          <ThemedText style={styles.errorText}>{errors.amount}</ThemedText>
        ) : null}

        <InputField
          label=""
          placeholder="Recipient email"
          value={recipient}
          onChangeText={(value) => {
            setRecipient(value);
            if (value) setErrors({ ...errors, recipient: "" });
          }}
          containerStyle={styles.recipientInput}
          error={errors.recipient}
        />

        <Button
          title="Send Money"
          icon="paperplane.fill"
          onPress={handleSend}
          style={styles.sendButton}
          disabled={!amount || !recipient || isLoading}
          loading={isLoading}
        />
      </View>
    </ViewContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  moneyInput: {
    marginTop: 30,
    marginBottom: 10,
    width: "100%",
  },
  recipientInput: {
    width: "100%",
    marginTop: 10,
  },
  sendButton: {
    marginTop: "auto",
    marginBottom: 30,
    width: "100%",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
});

export default Withdraw;

import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ViewContainer from "@/components/ui/ViewContainer";
import MoneyInput from "@/components/ui/MoneyInput";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLoadMoney } from "@/hooks/useLoadMoney";

// Lista de bancos disponibles
const bankOptions = [
  { label: "Banco Santander", value: "santander" },
  { label: "Tarjeta Crédito", value: "tarjeta_credito" },
];

const Load = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [formErrors, setFormErrors] = useState({
    amount: "",
    recipient: "",
    bank: "",
  });

  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const { loadMoney, isLoading, error, transactionId } = useLoadMoney();

  const handleLoad = async () => {
    const newErrors = {
      amount: !amount ? "Please enter an amount" : "",
      recipient: !recipient ? "Please enter a recipient" : "",
      bank: !selectedBank ? "Please select a bank" : "",
    };

    setFormErrors(newErrors);

    if (newErrors.amount || newErrors.recipient || newErrors.bank) {
      return;
    }

    try {
      const result = await loadMoney({ amount, recipient, bank: selectedBank });
      Alert.alert(
        "Success",
        `Money loaded successfully! Transaction ID: ${result.transactionId}`
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load money"
      );
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
        <ThemedText type="subtitle">Load Money</ThemedText>
      </View>

      <View style={styles.contentContainer}>
        <MoneyInput
          value={amount}
          onChangeText={(value) => {
            setAmount(value);
            if (value) setFormErrors({ ...formErrors, amount: "" });
          }}
          containerStyle={styles.moneyInput}
          autoFocus
        />
        {formErrors.amount && (
          <ThemedText style={styles.errorText}>{formErrors.amount}</ThemedText>
        )}

        <Select
          label="From"
          options={bankOptions}
          value={selectedBank}
          onChange={(value) => {
            setSelectedBank(value);
            if (value) setFormErrors({ ...formErrors, bank: "" });
          }}
          placeholder="Select a bank to load money"
          error={formErrors.bank}
          containerStyle={styles.bankSelect}
        />

        <Button
          title="Load Money"
          icon="arrow.up.to.line"
          onPress={handleLoad}
          style={styles.sendButton}
          disabled={!amount || !recipient || !selectedBank || isLoading}
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
  bankSelect: {
    width: "100%",
    marginTop: 50,
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

export default Load;

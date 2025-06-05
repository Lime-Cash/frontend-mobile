import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ViewContainer from "@/components/ui/ViewContainer";
import MoneyInput from "@/components/ui/MoneyInput";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
// import Select from "@/components/ui/Select";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { bankService } from "@/services/bankService";
import { showSuccessToast, showErrorToast } from "@/services/toastService";

// Lista de bancos disponibles
// const bankOptions = [
//   { label: "Banco Santander", value: "santander" },
//   { label: "Tarjeta Crédito", value: "tarjeta_credito" },
// ];

const Load = () => {
  const [amount, setAmount] = useState("");
  const [cvu, setCvu] = useState("");
  // const [selectedBank, setSelectedBank] = useState("");
  const [formErrors, setFormErrors] = useState({
    amount: "",
    cvu: "",
    // bank: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (error) {
      showErrorToast({
        message: "Error",
        description: error || "Something went wrong loading money",
      });
    }
  }, [error]);

  const handleLoad = async () => {
    const newErrors = {
      amount: !amount ? "Please enter an amount" : "",
      cvu: !cvu ? "Please enter a CVU" : "",
      // bank: !selectedBank ? "Please select a bank" : "",
    };

    setFormErrors(newErrors);

    if (newErrors.amount || newErrors.cvu) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await bankService.depositFromBank({
        cbu: cvu,
        amount: amount,
      });

      if (result.success) {
        showSuccessToast({
          message: "Success",
          description: `$${amount} was loaded from bank account`,
        });
        router.push("/");
      } else {
        setError(result.message || "Failed to load money");
      }
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Failed to load money");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <ViewContainer>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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

        <InputField
          label="CVU"
          placeholder="Enter your CVU"
          value={cvu}
          onChangeText={(value) => {
            setCvu(value);
            if (value) setFormErrors({ ...formErrors, cvu: "" });
          }}
          containerStyle={styles.cvuInput}
          error={formErrors.cvu}
          keyboardType="numeric"
          maxLength={22}
        />

        {/* Bank Dropdown - Commented Out */}
        {/* <Select
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
        /> */}

        <Button
          title="Load Money"
          icon="arrow.down.to.line"
          onPress={handleLoad}
          style={styles.sendButton}
          disabled={!amount || !cvu || isLoading}
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
  cvuInput: {
    marginTop: 10,
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

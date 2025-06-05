import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import ViewContainer from "@/components/ui/ViewContainer";
import MoneyInput from "@/components/ui/MoneyInput";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { bankService } from "@/services/bankService";
import { showSuccessToast, showErrorToast } from "@/services/toastService";

const Withdraw = () => {
  const [amount, setAmount] = useState("");
  const [cvu, setCvu] = useState("");
  const [formErrors, setFormErrors] = useState({
    amount: "",
    cvu: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (error) {
      showErrorToast({
        message: "Error",
        description: error || "Something went wrong withdrawing money",
      });
    }
  }, [error]);

  const handleWithdraw = async () => {
    const newErrors = {
      amount: !amount ? "Please enter an amount" : "",
      cvu: !cvu ? "Please enter a CVU" : "",
    };

    setFormErrors(newErrors);

    if (newErrors.amount || newErrors.cvu) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await bankService.withdrawToBank({ 
        cbu: cvu, 
        amount: amount 
      });
      
      if (result.success) {
        showSuccessToast({
          message: "Success",
          description: `$${amount} was withdrawn to bank account`,
        });
        router.push("/");
      } else {
        setError(result.message || "Failed to withdraw money");
      }
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Failed to withdraw money");
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

        <Button
          title="Withdraw Money"
          icon="arrow.down.to.line"
          onPress={handleWithdraw}
          style={styles.withdrawButton}
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
  withdrawButton: {
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

import React, { useState, useEffect, ReactNode } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
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
import { showSuccessToast, showErrorToast } from "@/services/toastService";

const SendMoney = () => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errors, setErrors] = useState({
    amount: "",
    recipient: "",
  });
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const { sendMoney, isLoading, error } = useSendMoney();

  useEffect(() => {
    if (error) {
      showErrorToast({
        message: "Error",
        description: error || "Something went wrong sending money",
      });
    }
  }, [error]);

  const handleSend = async () => {
    const response = await sendMoney({ amount, email: recipient });
    if (response) {
      showSuccessToast({
        message: "Success",
        description: `$${amount} was sent to ${recipient}`,
      });
      router.push("/");
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // Content to render inside the wrapper
  const renderContent = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          testID="back-button"
          accessibilityLabel="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={themeColor.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Send Money</ThemedText>
      </View>

      <View style={styles.contentContainer}>
        <MoneyInput
          value={amount}
          onChangeText={(value) => {
            setAmount(value);
            if (value) setErrors({ ...errors, amount: "" });
          }}
          containerStyle={styles.moneyInput}
          testID="amount-input"
        />
        {errors.amount ? (
          <ThemedText style={styles.errorText} testID="error-message">
            {errors.amount}
          </ThemedText>
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
          testID="recipient-email-input"
        />

        <Button
          title="Send Money"
          icon="paperplane.fill"
          onPress={handleSend}
          style={styles.sendButton}
          disabled={!amount || !recipient || isLoading}
          loading={isLoading}
          testID="send-money-btn"
        />
      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return <ViewContainer>{renderContent()}</ViewContainer>;
  } else {
    return (
      <ViewContainer>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {renderContent()}
        </TouchableWithoutFeedback>
      </ViewContainer>
    );
  }
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

export default SendMoney;

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import MoneyInput from "@/components/ui/MoneyInput";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function MoneyInputDemo() {
  const [amount, setAmount] = useState("0");
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[styles.container, { backgroundColor: themeColor.background }]}
    >
      <MoneyInput value={amount} onChangeText={setAmount} width="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: "100%",
  },
});

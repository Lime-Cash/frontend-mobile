import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface TransactionItemProps {
  message: string;
  date: string;
  price: number;
}

export default function TransactionItem({
  message,
  date,
  price,
}: TransactionItemProps) {
  // Format the price with currency symbol and color
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const formattedPrice = `${price >= 0 ? "+" : "-"}$${Math.abs(price).toFixed(2)}`;
  const priceColor = price >= 0 ? "#4CAF50" : "#F44336"; // Green for positive, red for negative

  return (
    <View style={[styles.container, { borderColor: themeColor.border }]}>
      <View style={styles.contentContainer}>
        <ThemedText type="defaultSemiBold">{message}</ThemedText>
        <ThemedText style={styles.date}>{date}</ThemedText>
      </View>
      <ThemedText style={[styles.price, { color: priceColor }]}>
        {formattedPrice}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

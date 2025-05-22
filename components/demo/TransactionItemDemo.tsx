import React from "react";
import { View, StyleSheet } from "react-native";
import TransactionItem from "@/components/home/TransactionItem";
import { ThemedText } from "@/components/ThemedText";

export default function TransactionItemDemo() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Transaction Items
      </ThemedText>

      <TransactionItem
        message="Transfer to Mike Johnson"
        date="4/25/2025"
        price={-1000.0}
      />

      <TransactionItem message="Card Deposit" date="4/25/2025" price={200.0} />

      <TransactionItem
        message="Monthly Subscription"
        date="4/20/2025"
        price={-15.99}
      />

      <TransactionItem
        message="Refund from Amazon"
        date="4/18/2025"
        price={45.67}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: "100%",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 16,
  },
});

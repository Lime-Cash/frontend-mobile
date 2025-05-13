import React from "react";
import { View, StyleSheet } from "react-native";
import BalanceDisplay from "../home/BalanceDisplay";

/**
 * Example usage of the BalanceDisplay component
 */
const BalanceDisplayExample = () => {
  // In a real app, this would come from a state or API call
  const balance = 600;

  return (
    <View style={styles.container}>
      {/* Basic usage with default title */}
      <BalanceDisplay amount={balance} />

      {/* With custom title */}
      <BalanceDisplay amount={balance} title="Current Balance" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
  },
});

export default BalanceDisplayExample;

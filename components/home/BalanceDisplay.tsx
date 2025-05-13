import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface BalanceDisplayProps {
  amount: number;
  title?: string;
}

const BalanceDisplay = ({
  amount,
  title = "Available Balance",
}: BalanceDisplayProps) => {
  // Format amount to currency with 2 decimal places
  const formattedAmount = `$${amount.toFixed(2)}`;

  return (
    <View style={[styles.container]}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.amount}>{formattedAmount}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#0D111C",
  },
  title: {
    fontSize: 16,
    opacity: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  amount: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 58,
    paddingVertical: 4,
  },
});

export default BalanceDisplay;

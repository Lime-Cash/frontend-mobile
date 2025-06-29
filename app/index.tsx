import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import ScrollContainer from "@/components/ui/ScrollContainer";
import { ThemedText } from "@/components/ThemedText";
import LimeLogo from "@/components/ui/LimeLogo";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import TransactionItem from "@/components/home/TransactionItem";
import { useTransactions } from "@/hooks/useTransactions";
import BalanceDisplay from "@/components/home/BalanceDisplay";
import { useBalance } from "@/hooks/useBalance";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

export default function Index() {
  const {
    checkAuth,
    logout,
    confirmLogout,
    cancelLogout,
    showLogoutModal,
    isInitialized,
  } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useTransactions();
  const {
    balance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useBalance();

  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
    };

    if (isInitialized) {
      verifyAuth();
    }
  }, [isInitialized, checkAuth]);

  // Show loading indicator while auth state is initializing
  if (!isInitialized || isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColor.tint} />
      </View>
    );
  }

  // If authenticated, show home screen
  return (
    <ScrollContainer>
      <View style={styles.header}>
        <LimeLogo />

        <Button
          variant="text"
          title="Logout"
          icon="rectangle.portrait.and.arrow.forward"
          onPress={logout}
          testID="logout-button"
        />
      </View>
      <View style={styles.balanceContainer}>
        {isLoadingBalance ? (
          <ActivityIndicator color={themeColor.tint} />
        ) : balanceError ? (
          <ThemedText style={styles.errorText}>{balanceError}</ThemedText>
        ) : (
          <BalanceDisplay amount={balance || 0} testID="balance-display" />
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          title="Send"
          icon="paperplane.fill"
          onPress={() => router.push("/send")}
          style={styles.button}
          testID="send-nav-button"
        />

        <Button
          title="Withdraw"
          icon="arrow.up.to.line"
          onPress={() => router.push("/withdraw")}
          style={styles.button}
          testID="withdraw-nav-button"
        />

        <Button
          title="Load"
          icon="arrow.down.to.line"
          onPress={() => router.push("/load")}
          style={styles.button}
          testID="load-nav-button"
        />
      </View>

      <View style={styles.transactionsContainer}>
        <ThemedText type="subtitle" style={styles.transactionsTitle}>
          Transactions
        </ThemedText>

        {isLoadingTransactions ? (
          <ActivityIndicator
            color={themeColor.tint}
            style={styles.transactionsLoader}
          />
        ) : transactionsError ? (
          <ThemedText style={styles.errorText}>{transactionsError}</ThemedText>
        ) : transactions.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            No transactions found
          </ThemedText>
        ) : (
          transactions.map((transaction, index) => (
            <TransactionItem
              key={index}
              message={transaction.message}
              date={transaction.created_at}
              price={transaction.amount}
            />
          ))
        )}
      </View>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Logout"
        description="Are you sure you want to logout?"
        button1Content="Cancel"
        button2Content="Logout"
        onButton1Press={cancelLogout}
        onButton2Press={confirmLogout}
        button1Style="cancel"
        button2Style="destructive"
      />
    </ScrollContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },
  button: {},
  transactionsContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  transactionsTitle: {
    marginBottom: 16,
  },
  transactionsLoader: {
    marginVertical: 20,
  },
  errorText: {
    color: "#F44336",
    marginVertical: 10,
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 20,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D111C",
  },
  balanceContainer: {
    marginBottom: 30,
  },
});

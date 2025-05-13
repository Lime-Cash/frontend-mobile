import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import ScrollContainer from "@/components/ui/ScrollContainer";
import { ThemedText } from "@/components/ThemedText";
import LimeLogo from "@/components/ui/LimeLogo";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Define interfaces for global methods
declare global {
  var isAuthenticated: () => boolean;
  var setAuthenticated: (status: boolean) => Promise<void>;
}

export default function Index() {
  const { checkAuth, logout, isInitialized } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

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

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
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
        />
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          title="Send"
          icon="paperplane.fill"
          onPress={() => router.push("/send")}
          style={styles.button}
        />

        <Button
          title="Withdraw"
          icon="arrow.down.to.line"
          onPress={() => router.push("/withdraw")}
          style={(styles.button, {})}
        />

        <Button
          title="Load"
          icon="arrow.up.to.line"
          onPress={() => router.push("/load")}
          style={styles.button}
        />
      </View>

      <View style={styles.transactionsContainer}>
        <ThemedText type="subtitle">Transactions</ThemedText>
      </View>
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
    marginBottom: 20,
    width: "100%",
  },
  button: {
    flex: 1,
  },
  transactionsContainer: {
    marginBottom: 20,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D111C",
  },
});

import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import LimeLogo from "@/components/ui/LimeLogo";
import { ThemedText } from "@/components/ThemedText";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  const handleLogin = async () => {
    if (!email || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters");
      return;
    }

    await login(email, password);
  };

  const navigateToSignup = () => {
    // Navigate to signup screen
    router.replace("/register");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColor.background }]}
    >
      <View style={styles.logoContainer}>
        <LimeLogo size={40} />
      </View>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.title}>Welcome back</ThemedText>
        <Text style={styles.subtitle}>Enter your credentials to continue</Text>

        <View style={styles.formContainer}>
          <InputField
            label="Email"
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputContainer}
          />

          <InputField
            label="Password"
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            containerStyle={styles.inputContainer}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
            variant="filled"
          />
        </View>
      </View>

      <View style={styles.signupContainer}>
        <ThemedText style={styles.signupText}>
          Don't have an account?
        </ThemedText>
        <TouchableOpacity onPress={navigateToSignup}>
          <ThemedText style={styles.signupLink} type="link">
            Sign up
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    position: "absolute",
    top: 80,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#9BA1A6",
    marginBottom: 32,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  loginButton: {
    marginTop: 16,
    width: "100%",
  },
  signupContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
  },
  signupText: {
    fontSize: 14,
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 16,
    textAlign: "center",
    width: "100%",
  },
});

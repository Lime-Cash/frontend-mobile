import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import LimeLogo from "@/components/ui/LimeLogo";

// Define interfaces to access global methods
declare global {
  var setAuthenticated: (status: boolean) => Promise<void>;
  var isAuthenticated: () => boolean;
}

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  const handleRegister = async () => {
    // Validaciones
    if (!name || name.trim().length < 2) {
      Alert.alert("Invalid Name", "Please enter your name (min. 2 characters)");
      return;
    }

    if (!email || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    await register(name, email, password);
  };

  const navigateToLogin = () => {
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <LimeLogo size={40} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Enter your details to get started</Text>

        <View style={styles.formContainer}>
          <InputField
            label="Full Name"
            type="text"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            containerStyle={styles.inputContainer}
          />

          <InputField
            label="Email"
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={styles.inputContainer}
          />

          <InputField
            label="Password"
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create Password"
            containerStyle={styles.inputContainer}
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            containerStyle={styles.inputContainer}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
            variant="filled"
          />
        </View>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account?</Text>
        <TouchableOpacity onPress={navigateToLogin}>
          <Text style={styles.loginLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D111C",
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
    color: "#FFFFFF",
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
  registerButton: {
    marginTop: 16,
    backgroundColor: "#FBC02D",
    width: "100%",
  },
  loginContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
    color: "#FFFFFF",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FBC02D",
  },
  errorText: {
    color: "#FF6B6B",
    marginBottom: 16,
    textAlign: "center",
    width: "100%",
  },
});

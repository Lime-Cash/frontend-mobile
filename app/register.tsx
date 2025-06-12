import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import LimeLogo from "@/components/ui/LimeLogo";
import { ThemedText } from "@/components/ThemedText";
import { showErrorToast } from "@/services/toastService";
import ScrollContainer from "@/components/ui/ScrollContainer";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { register, isLoading, error } = useAuth();
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  // Password requirements checker
  const getPasswordRequirements = () => {
    return [
      {
        text: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        text: "One lowercase letter (a-z)",
        met: /[a-z]/.test(password),
      },
      {
        text: "One uppercase letter (A-Z)",
        met: /[A-Z]/.test(password),
      },
      {
        text: "One number (0-9)",
        met: /\d/.test(password),
      },
      {
        text: "One special character (@$!%*?&)",
        met: /[@$!%*?&]/.test(password),
      },
    ];
  };

  const handleRegister = async () => {
    // Name validation
    if (!name || name.trim().length < 2) {
      showErrorToast({
        message: "Invalid Name",
        description: "Please enter your name (min. 2 characters)",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showErrorToast({
        message: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    // Password validation - minimum 8 characters
    if (!password || password.length < 8) {
      showErrorToast({
        message: "Invalid Password",
        description: "Password must be at least 8 characters long",
      });
      return;
    }

    // Password validation - must include lowercase letter
    if (!/[a-z]/.test(password)) {
      showErrorToast({
        message: "Invalid Password",
        description: "Password must include at least one lowercase letter",
      });
      return;
    }

    // Password validation - must include uppercase letter
    if (!/[A-Z]/.test(password)) {
      showErrorToast({
        message: "Invalid Password",
        description: "Password must include at least one uppercase letter",
      });
      return;
    }

    // Password validation - must include number
    if (!/\d/.test(password)) {
      showErrorToast({
        message: "Invalid Password",
        description: "Password must include at least one number",
      });
      return;
    }

    // Password validation - must include special character
    if (!/[@$!%*?&]/.test(password)) {
      showErrorToast({
        message: "Invalid Password",
        description:
          "Password must include at least one special character (@$!%*?&)",
      });
      return;
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      showErrorToast({
        message: "Password Mismatch",
        description: "Passwords do not match",
      });
      return;
    }

    await register(name, email, password);
  };

  const navigateToLogin = () => {
    router.replace("/login");
  };

  const requirements = getPasswordRequirements();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollContainer>
          <View style={styles.logoContainer}>
            <LimeLogo size={40} />
          </View>

          <View style={styles.contentContainer}>
            <ThemedText style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>
              Enter your details to get started
            </ThemedText>

            <View style={styles.formContainer}>
              <InputField
                label="Full Name"
                type="text"
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                containerStyle={styles.inputContainer}
                testID="name-input"
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
                testID="email-input"
              />

              <InputField
                label="Password"
                type="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create Password"
                containerStyle={styles.inputContainer}
                testID="password-input"
              />

              {/* Password Requirements */}
              {password.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <ThemedText style={styles.requirementsTitle}>
                    Password Requirements:
                  </ThemedText>
                  {requirements.map((requirement, index) => (
                    <View key={index} style={styles.requirementRow}>
                      <Ionicons
                        name={
                          requirement.met
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={16}
                        color={requirement.met ? "#4CAF50" : themeColor.icon}
                        style={styles.requirementIcon}
                      />
                      <Text
                        style={[
                          styles.requirementText,
                          {
                            color: requirement.met
                              ? "#4CAF50"
                              : themeColor.text,
                            textDecorationLine: requirement.met
                              ? "line-through"
                              : "none",
                          },
                        ]}
                      >
                        {requirement.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <InputField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                containerStyle={styles.inputContainer}
                testID="confirm-password-input"
              />

              {error && (
                <Text style={styles.errorText} testID="error-message">
                  {error}
                </Text>
              )}

              <Button
                title="Sign Up"
                onPress={handleRegister}
                loading={isLoading}
                style={styles.registerButton}
                variant="filled"
                testID="signup-button"
              />
            </View>
          </View>

          <View style={styles.loginContainer}>
            <ThemedText style={styles.loginText}>
              Already have an account?
            </ThemedText>
            <TouchableOpacity onPress={navigateToLogin}>
              <ThemedText style={styles.loginLink} type="link">
                Sign in
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollContainer>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  contentContainer: {
    alignItems: "center",
    paddingBottom: 40,
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
  },
  inputContainer: {
    marginBottom: 16,
    width: "100%",
  },
  requirementsContainer: {
    width: "100%",
    backgroundColor: "rgba(155, 161, 166, 0.1)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementIcon: {
    marginRight: 8,
  },
  requirementText: {
    fontSize: 12,
    flex: 1,
  },
  registerButton: {
    marginTop: 16,
    width: "100%",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingBottom: 20,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
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

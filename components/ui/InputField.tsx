import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { usePasswordField, InputType } from "@/hooks/usePasswordField";

interface InputFieldProps extends Omit<TextInputProps, "secureTextEntry"> {
  label: string;
  type?: InputType;
  error?: string;
  width?: number | string;
  containerStyle?: any;
}

export default function InputField({
  label,
  type = "text",
  error,
  width,
  containerStyle,
  ...textInputProps
}: InputFieldProps) {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const { isPasswordVisible, togglePasswordVisibility, getInputProps } =
    usePasswordField(type);

  const inputProps = getInputProps();

  return (
    <View style={[styles.container, width && { width }, containerStyle]}>
      <Text style={[styles.label, { color: themeColor.text }]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          { borderColor: error ? "red" : themeColor.icon },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: themeColor.text },
            type === "password" && styles.passwordInput,
          ]}
          placeholderTextColor={themeColor.icon}
          {...inputProps}
          {...textInputProps}
        />
        {type === "password" && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color={themeColor.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 40, // Space for the eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

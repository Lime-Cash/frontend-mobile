import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  Platform,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMoneyInput } from "@/hooks/useMoneyInput";

interface MoneyInputProps
  extends Omit<TextInputProps, "value" | "onChangeText"> {
  value: string | number;
  onChangeText?: (value: string) => void;
  width?: number | string;
  containerStyle?: any;
  disabled?: boolean;
  testID?: string;
}

export default function MoneyInput({
  value,
  onChangeText,
  width,
  containerStyle,
  disabled = false,
  testID,
  ...textInputProps
}: MoneyInputProps) {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];
  const moneyInput = useMoneyInput();

  // Format value for display
  const displayValue = typeof value === "number" ? value.toString() : value;

  const handleChangeText = (text: string) => {
    const formattedValue = moneyInput.handleChange(text);
    if (onChangeText) {
      onChangeText(formattedValue);
    }
  };

  return (
    <View style={[styles.container, width && { width }, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: themeColor.background,
          },
          disabled && styles.disabledContainer,
        ]}
      >
        <Text style={[styles.currencySymbol, { color: themeColor.icon }]}>
          $
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: themeColor.text },
            Platform.OS === "web" && ({ outlineStyle: "none" } as any),
          ]}
          value={displayValue}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={themeColor.icon}
          editable={!disabled}
          testID={testID}
          {...textInputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 42,
    fontWeight: "500",
    marginRight: 8,
  },
  input: {
    maxWidth: "100%",
    height: 48,
    fontSize: 50,
    fontWeight: "500",
    padding: 0,
  },
  disabledContainer: {
    opacity: 0.7,
  },
});

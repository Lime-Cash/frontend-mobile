import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { IconSymbol, IconSymbolName } from "./IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ButtonVariant = "filled" | "text";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconSymbolName;
  disabled?: boolean;
  loading?: boolean;
  width?: number | string;
  style?: any;
  textStyle?: any;
}

export default function Button({
  title,
  onPress,
  variant = "filled",
  icon,
  disabled = false,
  loading = false,
  width,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  const getStyles = () => {
    if (variant === "filled") {
      return {
        container: [
          styles.container,
          styles.filledContainer,
          disabled && styles.disabledContainer,
          width && { width },
          {
            backgroundColor: themeColor.primary,
          },
          style,
        ],
        text: [styles.text, styles.filledText],
        icon: "#000000",
      };
    } else {
      return {
        container: [
          styles.container,
          styles.textContainer,
          disabled && styles.disabledContainer,
          width && { width },
          style,
        ],
        text: [styles.text, styles.textText, { color: themeColor.primary }],
        icon: themeColor.primary,
      };
    }
  };

  const buttonStyles = getStyles();

  return (
    <TouchableOpacity
      style={buttonStyles.container}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "filled" ? "#000000" : themeColor.primary}
            style={styles.loader}
          />
        ) : (
          <>
            {icon && (
              <IconSymbol
                name={icon}
                size={20}
                color={buttonStyles.icon}
                style={styles.icon}
              />
            )}
            <Text style={[buttonStyles.text, textStyle]}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledContainer: {
    opacity: 0.5,
  },
  filledContainer: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  textContainer: {
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  filledText: {
    color: "#000000",
  },
  textText: {
    color: Colors.light.primary,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  loader: {
    margin: 2,
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export const toastConfig: ToastConfig = {
  success: (props) => {
    const themeColors = Colors.light;

    return (
      <BaseToast
        {...props}
        style={[styles.toast, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.title, { color: themeColors.text }]}
        text2Style={[styles.message, { color: themeColors.icon }]}
        renderLeadingIcon={() => (
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={24} color="green" />
          </View>
        )}
      />
    );
  },

  error: (props) => {
    const themeColors = Colors.light;

    return (
      <View testID="error-message">
        <ErrorToast
          {...props}
          style={[styles.toast, { backgroundColor: themeColors.background }]}
          contentContainerStyle={styles.contentContainer}
          text1Style={[styles.title, { color: themeColors.text }]}
          text2Style={[styles.message, { color: themeColors.icon }]}
          renderLeadingIcon={() => (
            <View style={styles.iconContainer}>
              <Ionicons name="close-circle" size={24} color="red" />
            </View>
          )}
        />
      </View>
    );
  },

  info: (props) => {
    const themeColors = Colors.light;

    return (
      <BaseToast
        {...props}
        style={[styles.toast, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
        text1Style={[styles.title, { color: themeColors.text }]}
        text2Style={[styles.message, { color: themeColors.icon }]}
        renderLeadingIcon={() => (
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle" size={24} color="#3498db" />
          </View>
        )}
      />
    );
  },
};

const styles = StyleSheet.create({
  toast: {
    borderLeftWidth: 0,
    marginTop: 10,
    height: "auto",
    minHeight: 60,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    fontSize: 14,
    fontWeight: "400",
  },
});

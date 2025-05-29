import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Button from "./Button";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  description?: string;
  button1Content: string;
  button2Content: string;
  onButton1Press: () => void;
  onButton2Press: () => void;
  button1Style?: "cancel" | "destructive" | "default";
  button2Style?: "cancel" | "destructive" | "default";
}

export default function ConfirmationModal({
  visible,
  title,
  description,
  button1Content,
  button2Content,
  onButton1Press,
  onButton2Press,
  button1Style = "cancel",
  button2Style = "destructive",
}: ConfirmationModalProps) {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  const getButtonVariant = (style: string) => {
    switch (style) {
      case "destructive":
        return "filled";
      case "cancel":
      case "default":
      default:
        return "text";
    }
  };

  const getButtonStyle = (style: string) => {
    if (style === "destructive") {
      return {
        backgroundColor: themeColor.background,
      };
    }
    return {};
  };

  const getButtonTextStyle = (style: string) => {
    if (style === "destructive") {
      return {
        color: "#FF3B30", // Red color for destructive text
      };
    }
    return {};
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: themeColor.background },
          ]}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: themeColor.text }]}>
              {title}
            </Text>
            {description && (
              <Text style={[styles.description, { color: themeColor.text }]}>
                {description}
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={button1Content}
              onPress={onButton1Press}
              variant={getButtonVariant(button1Style)}
              style={[styles.button, styles.leftButton]}
            />
            <Button
              title={button2Content}
              onPress={onButton2Press}
              variant={getButtonVariant(button2Style)}
              style={[
                styles.button,
                styles.rightButton,
                getButtonStyle(button2Style),
              ]}
              textStyle={getButtonTextStyle(button2Style)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: Math.min(width - 40, 320),
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
  },
  leftButton: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "rgba(0, 0, 0, 0.1)",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 0,
  },
  rightButton: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 12,
  },
});

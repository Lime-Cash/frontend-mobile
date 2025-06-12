import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  ViewStyle,
  DimensionValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "@/components/ThemedText";

export interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  error?: string;
  width?: DimensionValue;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  testID?: string;
}

export default function Select({
  label,
  options,
  value,
  placeholder = "Select an option",
  onChange,
  error,
  width,
  containerStyle,
  disabled = false,
  testID,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setModalVisible(false);
  };

  const toggleModal = () => {
    if (!disabled) {
      setModalVisible(!modalVisible);
    }
  };

  return (
    <View
      style={[styles.container, width ? { width } : undefined, containerStyle]}
    >
      {label && (
        <Text style={[styles.label, { color: themeColor.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        style={[
          styles.selectContainer,
          { borderColor: error ? "red" : themeColor.icon },
          disabled && styles.disabled,
        ]}
        onPress={toggleModal}
        disabled={disabled}
        testID={testID}
      >
        <Text
          style={[
            styles.selectedText,
            { color: selectedOption ? themeColor.text : themeColor.icon },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? themeColor.icon + "80" : themeColor.icon}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: themeColor.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Select Option</ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                testID="select-close-button"
              >
                <Ionicons name="close" size={24} color={themeColor.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && {
                      backgroundColor: themeColor.primary + "20",
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: themeColor.text },
                      value === item.value && { fontWeight: "600" },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={themeColor.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  selectedText: {
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  disabled: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    paddingBottom: 20,
    maxHeight: "80%",
    minHeight: "30%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.228)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  optionText: {
    fontSize: 16,
  },
});

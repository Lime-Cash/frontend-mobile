import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const ThemedContainer = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColor.background }]}
    >
      {children}
    </ScrollView>
  );
};

export default ThemedContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
});

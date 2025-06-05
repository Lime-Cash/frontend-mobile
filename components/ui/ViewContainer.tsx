import { StyleSheet, View } from "react-native";
import React from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

const ViewContainer = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  return (
    <View
      style={[styles.container, { backgroundColor: themeColor.background }]}
    >
      {children}
    </View>
  );
};

export default ViewContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
});

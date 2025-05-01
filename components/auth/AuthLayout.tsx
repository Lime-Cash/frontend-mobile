import React, { ReactNode } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageSourcePropType,
  ViewStyle,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  logoSource?: ImageSourcePropType;
  showHeader?: boolean;
  headerTitle?: string;
  contentContainerStyle?: ViewStyle;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  logoSource = require("@/assets/images/react-logo.png"),
  showHeader = false,
  headerTitle = "",
  contentContainerStyle,
}: AuthLayoutProps) {
  const colorScheme = useColorScheme();
  const themeColor = Colors[colorScheme ?? "light"];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack.Screen
        options={{
          title: headerTitle,
          headerShown: showHeader,
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: themeColor.background },
          contentContainerStyle,
        ]}
      >
        <View style={styles.logoContainer}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={[styles.title, { color: themeColor.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: themeColor.icon }]}>
            {subtitle}
          </Text>
        )}

        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
  },
});

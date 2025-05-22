import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userService from "@/services/userService";
import { ActivityIndicator, StyleSheet } from "react-native";
import { View } from "react-native";
import { Colors } from "@/constants/Colors";

interface AuthGuardProps {
  children: ReactNode;
}

declare global {
  var setAuthenticated: (status: boolean) => Promise<void>;
  var isAuthenticated: () => boolean;
}

const publicRoutes = ["/login", "/register"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle navigation after authentication check is complete
  useEffect(() => {
    if (!isLoading && isMounted) {
      const isPublicRoute = publicRoutes.includes(pathname || "");

      if (!isPublicRoute && !isAuth) {
        // Use router instead of Redirect component to avoid layout issues
        router.replace("/login");
      }
    }
  }, [isLoading, isAuth, pathname, isMounted, router]);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Primary check based on token
      const hasToken = await userService.isAuthenticated();

      if (hasToken) {
        setIsAuth(true);
        await AsyncStorage.setItem("@auth_status", "true");
      } else {
        setIsAuth(false);
        await AsyncStorage.setItem("@auth_status", "false");
      }
    } catch (e) {
      console.error("Error checking auth status:", e);
      setIsAuth(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Define global auth functions
  global.isAuthenticated = () => isAuth;

  global.setAuthenticated = async (status: boolean) => {
    try {
      await AsyncStorage.setItem("@auth_status", status ? "true" : "false");
      if (!status) {
        // Ensure token is removed when logging out
        await userService.removeToken();
      }
      setIsAuth(status);
    } catch (e) {
      console.error("Error setting auth status:", e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Always render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.background,
  },
});

import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

declare global {
  var setAuthenticated: (status: boolean) => Promise<void>;
  var isAuthenticated: () => boolean;
}

const AUTH_STORAGE_KEY = "@auth_status";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth === "true") {
          await global.setAuthenticated(true);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await global.setAuthenticated(true);

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");

      router.replace("/");
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    return new Promise<boolean>((resolve) => {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);

            try {
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

              await global.setAuthenticated(false);

              router.replace("/login");
              resolve(true);
            } catch (err) {
              console.error("Logout error:", err);
              setError("Logout failed. Please try again.");
              resolve(false);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]);
    });
  };

  const checkAuth = () => {
    return global.isAuthenticated?.() || false;
  };

  return {
    login,
    logout,
    checkAuth,
    isLoading,
    isInitialized,
    error,
  };
}

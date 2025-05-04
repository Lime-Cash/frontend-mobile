import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userService from "@/services/userService";

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
        const isUserAuthenticated = await userService.isAuthenticated();
        if (isUserAuthenticated) {
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await userService.login({ email, password });
      await global.setAuthenticated(true);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");

      router.replace("/");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
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
              await userService.removeToken();
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

  const checkAuth = async () => {
    const isUserAuthenticated = await userService.isAuthenticated();
    return isUserAuthenticated || global.isAuthenticated?.() || false;
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

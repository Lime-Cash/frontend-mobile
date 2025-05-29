import { useState, useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userService from "@/services/userService";

const AUTH_STORAGE_KEY = "@auth_status";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isUserAuthenticated = await userService.isAuthenticated();
        if (isUserAuthenticated) {
          await (global as any).setAuthenticated(true);
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
      await (global as any).setAuthenticated(true);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");

      router.replace("/");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await userService.register({ name, email, password });
      await (global as any).setAuthenticated(true);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, "true");

      router.replace("/");
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    setShowLogoutModal(false);

    try {
      await userService.removeToken();
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await (global as any).setAuthenticated(false);

      router.replace("/login");
      return true;
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const checkAuth = async () => {
    const isUserAuthenticated = await userService.isAuthenticated();
    return isUserAuthenticated || (global as any).isAuthenticated?.() || false;
  };

  return {
    login,
    register,
    logout,
    confirmLogout,
    cancelLogout,
    checkAuth,
    isLoading,
    isInitialized,
    error,
    showLogoutModal,
  };
}

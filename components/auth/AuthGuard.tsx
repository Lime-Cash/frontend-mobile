import React, { ReactNode, useEffect, useState } from "react";
import { Redirect, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userService from "@/services/userService";

interface AuthGuardProps {
  children: ReactNode;
}

declare global {
  var setAuthenticated: (status: boolean) => Promise<void>;
  var isAuthenticated: () => boolean;
}

const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
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
        setIsLoading(true);
      }
    };

    checkAuth();
  }, []);

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

  if (isLoading && pathname === "/") {
    return <>{children}</>;
  }

  const isPublicRoute = publicRoutes.includes(pathname);

  if (pathname === "/") {
    return <>{children}</>;
  }

  if (!isPublicRoute && !isAuth) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

import React, { ReactNode, useEffect, useState } from "react";
import { Redirect, usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthGuardProps {
  children: ReactNode;
}

// Define global interfaces
declare global {
  var setAuthenticated: (status: boolean) => Promise<void>;
  var isAuthenticated: () => boolean;
}

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const value = await AsyncStorage.getItem("@auth_status");
        if (value === "true") {
          setIsAuth(true);
        }
      } catch (e) {
        console.error("Error reading auth status:", e);
      }
    };

    checkAuth();
  }, []);

  // Función para comprobar autenticación - expuesta globalmente
  global.isAuthenticated = () => isAuth;

  // Función para establecer autenticación - expuesta globalmente
  global.setAuthenticated = async (status: boolean) => {
    try {
      await AsyncStorage.setItem("@auth_status", status ? "true" : "false");
      setIsAuth(status);
    } catch (e) {
      console.error("Error setting auth status:", e);
    }
  };

  // Verifica si la ruta actual es pública (no requiere autenticación)
  const isPublicRoute = publicRoutes.includes(pathname);

  // Si estamos en index, permitimos que su propio Redirect funcione
  if (pathname === "/") {
    return <>{children}</>;
  }

  // Si la ruta actual no es pública y el usuario no está autenticado,
  // redirecciona a la página de login
  if (!isPublicRoute && !isAuth) {
    return <Redirect href="/login" />;
  }

  // Si la ruta es pública o el usuario está autenticado, muestra el contenido
  return <>{children}</>;
}

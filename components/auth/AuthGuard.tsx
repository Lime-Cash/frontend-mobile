import React, { ReactNode, useEffect } from "react";
import { Redirect, usePathname, useRouter } from "expo-router";

interface AuthGuardProps {
  children: ReactNode;
}

// Por ahora, para propósitos de desarrollo, siempre se redirige a login
// En una implementación real, esto verificaría si hay un token de autenticación válido
const isAuthenticated = () => {
  // Siempre retorna false por ahora para forzar la redirección a login
  return false;
};

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/signup", "/forgot-password"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();

  // Verifica si la ruta actual es pública (no requiere autenticación)
  const isPublicRoute = publicRoutes.includes(pathname);

  // Si estamos en index, permitimos que su propio Redirect funcione
  if (pathname === "/") {
    return <>{children}</>;
  }

  // Si la ruta actual no es pública y el usuario no está autenticado,
  // redirecciona a la página de login
  if (!isPublicRoute && !isAuthenticated()) {
    return <Redirect href="/login" />;
  }

  // Si la ruta es pública o el usuario está autenticado, muestra el contenido
  return <>{children}</>;
}

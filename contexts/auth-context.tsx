"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Administrador } from "@/lib/types";
import { authApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  admin: Administrador | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<Administrador, "id">) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Administrador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Recuperar admin del localStorage al cargar
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const adminData = response.administrador;
      
      setAdmin(adminData);
      localStorage.setItem("admin", JSON.stringify(adminData));
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${adminData.nombreCompleto}`,
      });
      
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description:
          error instanceof Error ? error.message : "Credenciales incorrectas",
      });
      throw error;
    }
  };

  const register = async (data: Omit<Administrador, "id">) => {
    try {
      const response = await authApi.register(data);
      const adminData = response.administrador;
      
      setAdmin(adminData);
      localStorage.setItem("admin", JSON.stringify(adminData));
      
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
      
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description:
          error instanceof Error ? error.message : "No se pudo completar el registro",
      });
      throw error;
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    router.push("/login");
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

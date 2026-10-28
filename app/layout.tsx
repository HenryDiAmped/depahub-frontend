import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";

export const metadata: Metadata = {
  title: "DepaHub - Sistema de Gestión de Alquileres",
  description: "Plataforma centralizada para gestión de propiedades e inquilinos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
          <AccessibilityMenu />
        </AuthProvider>
      </body>
    </html>
  );
}

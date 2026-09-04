"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Home,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/dashboard/inquilinos", label: "Inquilinos", icon: Users },
  { href: "/dashboard/contratos", label: "Contratos", icon: FileText },
  { href: "/dashboard/cuentas", label: "Cuentas", icon: CreditCard },
  { href: "/dashboard/balances", label: "Balances", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, admin } = useAuth();

  return (
    <div className="flex h-full w-16 md:w-60 flex-col bg-[hsl(229,29%,17%)]">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center md:justify-start px-0 md:px-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(4,100%,70%)]">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="hidden md:block text-base font-bold uppercase tracking-widest text-white">
            DepaHub
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-auto py-5">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-[hsl(4,100%,70%)] text-white shadow-md"
                      : "text-[hsl(220,20%,70%)] hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden md:block">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: user info + logout */}
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 hidden md:block rounded-lg bg-white/5 px-3 py-2">
          <p className="text-sm font-semibold text-white truncate">
            {admin?.nombreCompleto}
          </p>
          <p className="text-xs text-[hsl(220,20%,60%)] truncate">
            {admin?.email}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-center md:justify-start gap-2 text-[hsl(220,20%,65%)] hover:bg-red-600 hover:text-white transition-colors"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden md:block">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Home, Users, FileText } from "lucide-react";
import { propiedadesApi, inmueblesApi, inquilinosApi, contratosApi, balancesApi } from "@/lib/api";

export default function DashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    propiedades: 0,
    inmuebles: 0,
    inquilinos: 0,
    contratos: 0,
  });
  const [utilidadTotal, setUtilidadTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!admin?.id) return;

      try {
        const [propiedades, inmuebles, inquilinos, contratos, balances] =
          await Promise.all([
            propiedadesApi.getAll(admin.id),
            inmueblesApi.getAll(),
            inquilinosApi.getAll(),
            contratosApi.getAll(admin.id),
            balancesApi.getAll(admin.id),
          ]);

        // Los endpoints devuelven registros de todos los administradores. La
        // pertenencia se identifica por la propiedad anidada en cada respuesta.
        const inmueblesDelAdministrador = inmuebles.filter(
          (inmueble) => inmueble.propiedad?.administrador?.id === admin.id
        );
        const inquilinosDelAdministrador = inquilinos.filter(
          (inquilino) =>
            inquilino.inmueble?.propiedad?.administrador?.id === admin.id
        );

        setStats({
          propiedades: propiedades.length,
          inmuebles: inmueblesDelAdministrador.length,
          inquilinos: inquilinosDelAdministrador.filter(
            (inquilino) => inquilino.estado === "ACTIVO"
          ).length,
          contratos: contratos.filter((c) => c.estado === "ACTIVO").length,
        });

        // Calcular la utilidad total sumando todas las utilidades mensuales
        const utilidadCalculada = balances.reduce((sum, balance) => sum + (balance.utilidad || 0), 0);
        setUtilidadTotal(utilidadCalculada);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [admin]);

  const statCards = [
    {
      title: "Propiedades",
      value: stats.propiedades,
      icon: Building2,
      description: "Total de propiedades registradas",
    },
    {
      title: "Inmuebles",
      value: stats.inmuebles,
      icon: Home,
      description: "Total de habitaciones/departamentos",
    },
    {
      title: "Inquilinos Activos",
      value: stats.inquilinos,
      icon: Users,
      description: "Inquilinos actualmente rentando",
    },
    {
      title: "Contratos Activos",
      value: stats.contratos,
      icon: FileText,
      description: "Contratos vigentes",
    },
  ];

  const iconColors = [
    "bg-[hsl(229,29%,30%)]",  // navy para propiedades
    "bg-[hsl(4,100%,70%)]",   // coral para inmuebles
    "bg-[hsl(131,44%,62%)]",  // verde para inquilinos
    "bg-[hsl(229,29%,30%)]",  // navy para contratos
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Bienvenido, {admin?.nombreCompleto}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando estadísticas...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.title}
                className="overflow-hidden border-0 shadow-sm"
              >
                {/* Header: dark navy strip with title + icon pill */}
                <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3 space-y-0 flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                    {card.title}
                  </CardTitle>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconColors[i]}`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>

                {/* Body: white background */}
                <CardContent className="bg-white px-4 pt-4 pb-5">
                  <div className="text-3xl font-bold text-foreground">
                    {card.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Utilidad total */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
            Utilidad Total
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white px-4 pt-4 pb-5">
          <div className="text-3xl font-bold text-[hsl(4,100%,62%)]">
            S/. {utilidadTotal.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Ganancia acumulada de todos los períodos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

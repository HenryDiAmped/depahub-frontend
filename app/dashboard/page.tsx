"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Home, Users, FileText } from "lucide-react";
import { propiedadesApi, inmueblesApi, inquilinosApi, contratosApi } from "@/lib/api";

export default function DashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState({
    propiedades: 0,
    inmuebles: 0,
    inquilinos: 0,
    contratos: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!admin?.id) return;

      try {
        const [propiedades, inmuebles, inquilinos, contratos] =
          await Promise.all([
            propiedadesApi.getAll(admin.id),
            inmueblesApi.getAll(),
            inquilinosApi.getAll(),
            contratosApi.getAll(admin.id),
          ]);

        setStats({
          propiedades: propiedades.length,
          inmuebles: inmuebles.length,
          inquilinos: inquilinos.filter((i) => i.estado === "ACTIVO").length,
          contratos: contratos.filter((c) => c.estado === "ACTIVO").length,
        });
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {admin?.nombreCompleto}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando estadísticas...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Utilidad Total</CardTitle>
          <CardDescription>
            Ganancia acumulada de todos los períodos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            S/. {admin?.utilidadTotal.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

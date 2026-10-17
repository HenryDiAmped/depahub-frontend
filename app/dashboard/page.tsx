"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Home,
  Users,
  FileText,
  Percent,
  Wallet,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Shield,
} from "lucide-react";
import {
  propiedadesApi,
  inmueblesApi,
  inquilinosApi,
  contratosApi,
  balancesApi,
  cuentasApi,
} from "@/lib/api";
import type {
  BalanceMensual,
  Contrato,
  Cuenta,
  Inmueble,
  Inquilino,
  Propiedad,
} from "@/lib/types";
import {
  DonutChart,
  GroupedBarChart,
  HorizontalBarChart,
} from "@/components/dashboard/charts";
import {
  balancesParaGrafico,
  calcularMetricasDashboard,
  contarContratosPorEstado,
  contarInquilinosPorEstado,
  formatMoney,
  inmueblesPorPropiedad as contarInmueblesPorPropiedad,
  montosCuentasPorTipo,
  ocupacionPorPropiedad as calcularOcupacionPorPropiedad,
  propiedadesPorDistrito as agruparPropiedadesPorDistrito,
  rentaPorPropiedad as calcularRentaPorPropiedad,
} from "@/lib/dashboard-metrics";
import {
  filtrarInmueblesDelAdministrador,
  filtrarInquilinosDelAdministrador,
} from "@/lib/filtros";

const COLOR_NAVY = "hsl(229, 29%, 30%)";
const COLOR_CORAL = "hsl(4, 100%, 70%)";
const COLOR_GREEN = "hsl(131, 44%, 62%)";
const COLOR_NAVY_SOFT = "hsl(229, 29%, 48%)";

export default function DashboardPage() {
  const { admin } = useAuth();
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [balances, setBalances] = useState<BalanceMensual[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!admin?.id) return;

      try {
        const [
          propiedadesData,
          inmueblesData,
          inquilinosData,
          contratosData,
          balancesData,
          cuentasData,
        ] = await Promise.all([
          propiedadesApi.getAll(admin.id),
          inmueblesApi.getAll(),
          inquilinosApi.getAll(),
          contratosApi.getAll(admin.id),
          balancesApi.getAll(admin.id),
          cuentasApi.getAll(admin.id),
        ]);

        const inmueblesDelAdministrador = filtrarInmueblesDelAdministrador(
          inmueblesData,
          admin.id
        );
        const inquilinosDelAdministrador = filtrarInquilinosDelAdministrador(
          inquilinosData,
          admin.id
        );

        setPropiedades(propiedadesData);
        setInmuebles(inmueblesDelAdministrador);
        setInquilinos(inquilinosDelAdministrador);
        setContratos(contratosData);
        setBalances(balancesData);
        setCuentas(cuentasData);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [admin]);

  const metrics = useMemo(
    () => calcularMetricasDashboard(inmuebles, contratos, cuentas, balances),
    [inmuebles, contratos, cuentas, balances]
  );

  const balancesChart = useMemo(
    () => balancesParaGrafico(balances),
    [balances]
  );

  const inmueblesPorEstado = [
    { name: "Ocupados", value: metrics.ocupados, color: COLOR_GREEN },
    { name: "Disponibles", value: metrics.disponibles, color: COLOR_NAVY },
    { name: "Mantenimiento", value: metrics.mantenimiento, color: COLOR_CORAL },
  ];

  const contratosPorEstadoConteo = contarContratosPorEstado(contratos);
  const contratosPorEstado = [
    { name: "Activos", value: contratosPorEstadoConteo.activos, color: COLOR_GREEN },
    { name: "Finalizados", value: contratosPorEstadoConteo.finalizados, color: COLOR_NAVY },
    { name: "Cancelados", value: contratosPorEstadoConteo.cancelados, color: COLOR_CORAL },
  ];

  const inmueblesPorPropiedad = contarInmueblesPorPropiedad(propiedades, inmuebles).map(
    (item) => ({ ...item, color: COLOR_NAVY_SOFT })
  );

  const rentaPorPropiedad = calcularRentaPorPropiedad(propiedades, inmuebles).map(
    (item) => ({ ...item, color: COLOR_GREEN })
  );

  const cuentasPorTipoMontos = montosCuentasPorTipo(cuentas);
  const cuentasPorTipo = [
    { name: "Por cobrar", value: cuentasPorTipoMontos.porCobrar, color: COLOR_GREEN },
    { name: "Por pagar", value: cuentasPorTipoMontos.porPagar, color: COLOR_CORAL },
    { name: "Saldadas", value: cuentasPorTipoMontos.saldadas, color: COLOR_NAVY },
  ];

  const inquilinosPorEstadoConteo = contarInquilinosPorEstado(inquilinos);
  const inquilinosPorEstado = [
    { name: "Activos", value: inquilinosPorEstadoConteo.activos, color: COLOR_GREEN },
    { name: "Retirados", value: inquilinosPorEstadoConteo.retirados, color: COLOR_CORAL },
  ];

  const ocupacionPorPropiedad = calcularOcupacionPorPropiedad(propiedades, inmuebles);

  const DISTRITO_COLORS = [COLOR_NAVY, COLOR_CORAL, COLOR_GREEN, COLOR_NAVY_SOFT];
  const propiedadesPorDistrito = agruparPropiedadesPorDistrito(propiedades).map(
    (item, index) => ({
      ...item,
      color: DISTRITO_COLORS[index % DISTRITO_COLORS.length],
    })
  );

  const statCards = [
    {
      title: "Propiedades",
      value: String(propiedades.length),
      icon: Building2,
      description: "Total de propiedades registradas",
      color: "bg-[hsl(229,29%,30%)]",
    },
    {
      title: "Inmuebles",
      value: String(inmuebles.length),
      icon: Home,
      description: "Habitaciones y departamentos",
      color: "bg-[hsl(4,100%,70%)]",
    },
    {
      title: "Inquilinos Activos",
      value: String(inquilinos.filter((item) => item.estado === "ACTIVO").length),
      icon: Users,
      description: "Inquilinos actualmente rentando",
      color: "bg-[hsl(131,44%,62%)]",
    },
    {
      title: "Contratos Activos",
      value: String(metrics.contratosActivos),
      icon: FileText,
      description: "Contratos vigentes",
      color: "bg-[hsl(229,29%,30%)]",
    },
    {
      title: "Ocupación",
      value: `${metrics.ocupacion}%`,
      icon: Percent,
      description: `${metrics.ocupados} de ${inmuebles.length} inmuebles ocupados`,
      color: "bg-[hsl(131,44%,62%)]",
    },
    {
      title: "Por Cobrar",
      value: formatMoney(metrics.porCobrar),
      icon: Wallet,
      description: "Cuentas pendientes de cobro",
      color: "bg-[hsl(4,100%,70%)]",
    },
    {
      title: "Por Pagar",
      value: formatMoney(metrics.porPagar),
      icon: CreditCard,
      description: "Cuentas pendientes de pago",
      color: "bg-[hsl(229,29%,30%)]",
    },
    {
      title: "Renta Promedio",
      value: formatMoney(metrics.rentaPromedio),
      icon: TrendingUp,
      description: "Alquiler promedio de contratos activos",
      color: "bg-[hsl(131,44%,62%)]",
    },
    {
      title: "Cuentas vencidas",
      value: String(metrics.cuentasVencidas),
      icon: AlertTriangle,
      description: "Pendientes con fecha de vencimiento superada",
      color: "bg-[hsl(4,100%,70%)]",
    },
    {
      title: "Garantías",
      value: formatMoney(metrics.garantiaTotal),
      icon: Shield,
      description: "Suma de garantías de contratos activos",
      color: "bg-[hsl(229,29%,30%)]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Bienvenido, {admin?.nombreCompleto}
        </p>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          Cargando estadísticas...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-[hsl(229,29%,20%)] px-4 py-3">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                      {card.title}
                    </CardTitle>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${card.color}`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white px-4 pb-5 pt-4">
                    <div className="text-2xl font-bold text-foreground xl:text-3xl">
                      {card.value}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ResumenFinanciero
              titulo="Ingresos acumulados"
              monto={metrics.ingresos}
              color="text-[hsl(131,44%,45%)]"
            />
            <ResumenFinanciero
              titulo="Egresos acumulados"
              monto={metrics.egresos}
              color="text-[hsl(4,100%,62%)]"
            />
            <ResumenFinanciero
              titulo="Utilidad total"
              monto={metrics.utilidad}
              color="text-foreground"
            />
            <ResumenFinanciero
              titulo="Renta mensual ocupada"
              monto={metrics.rentaOcupada}
              color="text-[hsl(131,44%,45%)]"
            />
          </div>

          <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                Ingresos, egresos y utilidad por mes
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white px-4 py-5">
              <GroupedBarChart
                data={balancesChart}
                series={[
                  { key: "ingresos", label: "Ingresos", color: COLOR_GREEN },
                  { key: "egresos", label: "Egresos", color: COLOR_CORAL },
                  { key: "utilidad", label: "Utilidad", color: COLOR_NAVY },
                ]}
                formatValue={formatMoney}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                  Estado de inmuebles
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white px-4 py-6">
                <DonutChart
                  data={inmueblesPorEstado}
                  centerValue={`${metrics.ocupacion}%`}
                  centerLabel="Ocupación"
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                  Estado de contratos
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white px-4 py-6">
                <DonutChart
                  data={contratosPorEstado}
                  centerValue={String(contratos.length)}
                  centerLabel="Total"
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                  Cuentas por tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white px-4 py-6">
                <DonutChart
                  data={cuentasPorTipo}
                  centerValue={`${Math.round(
                    cuentasPorTipo.reduce((sum, item) => sum + item.value, 0)
                  )}`}
                  centerLabel="Soles"
                  formatValue={formatMoney}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                  Estado de inquilinos
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white px-4 py-6">
                <DonutChart
                  data={inquilinosPorEstado}
                  centerValue={String(inquilinos.length)}
                  centerLabel="Total"
                />
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                Ocupación de inmuebles por propiedad
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white px-4 py-5">
              <GroupedBarChart
                data={ocupacionPorPropiedad}
                series={[
                  { key: "ocupados", label: "Ocupados", color: COLOR_GREEN },
                  { key: "disponibles", label: "Disponibles", color: COLOR_NAVY },
                  {
                    key: "mantenimiento",
                    label: "Mantenimiento",
                    color: COLOR_CORAL,
                  },
                ]}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2 pb-2">
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                  Inmuebles por propiedad
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white px-4 py-5">
                <HorizontalBarChart data={inmueblesPorPropiedad} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                  Renta potencial por propiedad
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white px-4 py-5">
                <HorizontalBarChart
                  data={rentaPorPropiedad}
                  formatValue={formatMoney}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                  Propiedades por distrito
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white px-4 py-6">
                <DonutChart
                  data={propiedadesPorDistrito}
                  centerValue={String(propiedades.length)}
                  centerLabel="Total"
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function ResumenFinanciero({
  titulo,
  monto,
  color,
}: {
  titulo: string;
  monto: number;
  color: string;
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white px-4 pb-5 pt-4">
        <div className={`text-2xl font-bold ${color}`}>{formatMoney(monto)}</div>
      </CardContent>
    </Card>
  );
}

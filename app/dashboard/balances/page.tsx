"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, TrendingDown, TrendingUp } from "lucide-react";
import { balancesApi, egresosApi, ingresosApi } from "@/lib/api";
import type { BalanceMensual, Egreso, Ingreso } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function BalancesPage() {
  const { admin } = useAuth();
  const [balances, setBalances] = useState<BalanceMensual[]>([]);
  const [selectedBalance, setSelectedBalance] = useState<BalanceMensual | null>(null);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const seleccionarBalance = async (balance: BalanceMensual) => {
    setSelectedBalance(balance);
    if (!balance.id) return;
    try {
      const [ingresosData, egresosData] = await Promise.all([ingresosApi.getAll(balance.id), egresosApi.getAll(balance.id)]);
      setIngresos(ingresosData);
      setEgresos(egresosData);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el detalle del balance" });
    }
  };

  useEffect(() => {
    const cargarBalances = async () => {
      if (!admin?.id) return;
      try {
        const data = await balancesApi.getAll(admin.id);
        setBalances(data);
        if (data.length) await seleccionarBalance(data[0]);
      } catch {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los balances" });
      } finally {
        setIsLoading(false);
      }
    };
    cargarBalances();
  }, [admin]);

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">Balances Mensuales</h1><p className="mt-0.5 text-sm text-muted-foreground">Se generan al registrar un contrato vigente y se actualizan al saldar cuentas.</p></div>
    {isLoading ? <div className="py-8 text-center text-muted-foreground">Cargando balances...</div> : balances.length === 0 ? <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(229,29%,20%)]"><BarChart3 className="h-8 w-8 text-white" /></div><h3 className="mt-4 text-base font-bold uppercase tracking-wide">No hay balances registrados</h3><p className="mt-1 text-sm text-muted-foreground">El balance se creará automáticamente al existir un contrato vigente este mes.</p></CardContent></Card> : <div className="grid gap-6 lg:grid-cols-3">
      <Card className="h-fit overflow-hidden border-0 shadow-sm"><CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">Períodos</CardTitle></CardHeader><CardContent className="bg-white p-3"><div className="space-y-1">{balances.map((balance) => <Button key={balance.id} variant="ghost" onClick={() => seleccionarBalance(balance)} className={`w-full justify-start rounded-lg font-medium ${selectedBalance?.id === balance.id ? "bg-[hsl(4,100%,70%)] text-white hover:bg-[hsl(4,100%,70%)] hover:text-white" : "text-foreground hover:bg-[hsl(220,20%,95%)]"}`}><Calendar className="mr-2 h-4 w-4" />{meses[balance.mes - 1]} {balance.anio}</Button>)}</div></CardContent></Card>
      {selectedBalance && <div className="space-y-6 lg:col-span-2"><div className="grid gap-4 md:grid-cols-3"><Resumen titulo="Total Ingresos" monto={selectedBalance.totalIngresos} icono={<TrendingUp className="h-3 w-3 text-white" />} color="bg-[hsl(131,44%,62%)]" texto="text-[hsl(131,44%,45%)]" /><Resumen titulo="Total Egresos" monto={selectedBalance.totalEgresos} icono={<TrendingDown className="h-3 w-3 text-white" />} color="bg-[hsl(4,100%,70%)]" texto="text-[hsl(4,100%,62%)]" /><Resumen titulo="Utilidad" monto={selectedBalance.utilidad || 0} icono={<BarChart3 className="h-3 w-3 text-white" />} color="bg-[hsl(229,29%,35%)]" texto="text-foreground" /></div><div className="grid gap-6 md:grid-cols-2"><Movimientos titulo="Ingresos" movimientos={ingresos} signo="+" color="text-[hsl(131,44%,45%)]" /><Movimientos titulo="Egresos" movimientos={egresos} signo="-" color="text-[hsl(4,100%,62%)]" /></div></div>}
    </div>}
  </div>;
}

function Resumen({ titulo, monto, icono, color, texto }: { titulo: string; monto: number; icono: ReactNode; color: string; texto: string }) {
  return <Card className="overflow-hidden border-0 shadow-sm"><CardHeader className="flex flex-row items-center justify-between space-y-0 bg-[hsl(229,29%,20%)] px-4 py-3"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">{titulo}</CardTitle><div className={`flex h-6 w-6 items-center justify-center rounded-full ${color}`}>{icono}</div></CardHeader><CardContent className="bg-white px-4 pb-5 pt-4"><div className={`text-2xl font-bold ${texto}`}>S/. {monto.toFixed(2)}</div></CardContent></Card>;
}

function Movimientos({ titulo, movimientos, signo, color }: { titulo: string; movimientos: (Ingreso | Egreso)[]; signo: string; color: string }) {
  return <Card className="overflow-hidden border-0 shadow-sm"><CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3"><CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">{titulo}</CardTitle></CardHeader><CardContent className="bg-white p-0"><div className="divide-y divide-border">{movimientos.length === 0 ? <p className="p-4 text-center text-sm text-muted-foreground">No hay {titulo.toLowerCase()} registrados</p> : movimientos.map((movimiento) => <div key={movimiento.id} className="flex items-center justify-between px-4 py-3"><div><p className="text-sm font-semibold text-foreground">{movimiento.concepto}</p><p className="text-xs text-muted-foreground">{movimiento.fecha}</p></div><p className={`text-sm font-bold ${color}`}>{signo} S/. {movimiento.importe.toFixed(2)}</p></div>)}</div></CardContent></Card>;
}

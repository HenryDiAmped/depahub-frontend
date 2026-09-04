"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, BarChart3, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { balancesApi, ingresosApi, egresosApi, administradoresApi } from "@/lib/api";
import type { BalanceMensual, Ingreso, Egreso } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export default function BalancesPage() {
  const { admin } = useAuth();
  const [balances, setBalances] = useState<BalanceMensual[]>([]);
  const [selectedBalance, setSelectedBalance] = useState<BalanceMensual | null>(null);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openBalance, setOpenBalance] = useState(false);
  const [openIngreso, setOpenIngreso] = useState(false);
  const [openEgreso, setOpenEgreso] = useState(false);
  const [balanceForm, setBalanceForm] = useState({
    mes: "",
    anio: "",
  });
  const [ingresoForm, setIngresoForm] = useState({
    importe: "",
    concepto: "",
    fecha: "",
  });
  const [egresoForm, setEgresoForm] = useState({
    importe: "",
    concepto: "",
    fecha: "",
  });

  useEffect(() => {
    fetchBalances();
  }, [admin]);

  const fetchBalances = async () => {
    if (!admin?.id) return;

    try {
      const data = await balancesApi.getAll(admin.id);
      setBalances(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los balances",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetalleBalance = async (balanceId: number) => {
    try {
      const [ingresosData, egresosData] = await Promise.all([
        ingresosApi.getAll(balanceId),
        egresosApi.getAll(balanceId),
      ]);
      setIngresos(ingresosData);
      setEgresos(egresosData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el detalle del balance",
      });
    }
  };

  const handleSelectBalance = (balance: BalanceMensual) => {
    setSelectedBalance(balance);
    if (balance.id) {
      fetchDetalleBalance(balance.id);
    }
  };

  const handleCreateBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin?.id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const balanceData: BalanceMensual = {
        mes: Number(balanceForm.mes),
        anio: Number(balanceForm.anio),
        totalIngresos: 0,
        totalEgresos: 0,
        fechaGeneracion: today,
        administrador: { id: admin.id },
      };

      await balancesApi.create(balanceData);
      toast({
        title: "Balance creado",
        description: "El balance se creó correctamente",
      });

      setOpenBalance(false);
      setBalanceForm({ mes: "", anio: "" });
      fetchBalances();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el balance",
      });
    }
  };

  const handleCreateIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalance?.id || !admin?.id) return;

    try {
      const ingresoData: Ingreso = {
        importe: Number(ingresoForm.importe),
        concepto: ingresoForm.concepto,
        fecha: ingresoForm.fecha,
        balanceMensual: { id: selectedBalance.id },
      };

      await ingresosApi.create(ingresoData);

      const nuevosIngresos = await ingresosApi.getAll(selectedBalance.id);
      const totalIngresos = nuevosIngresos.reduce((sum, ing) => sum + ing.importe, 0);
      
      const utilidad = totalIngresos - selectedBalance.totalEgresos;
      const balanceActualizado = await balancesApi.update(selectedBalance.id, {
        ...selectedBalance,
        totalIngresos,
        utilidad,
      });

      const todosLosBalances = await balancesApi.getAll(admin.id);
      const utilidadTotal = todosLosBalances.reduce((sum, bal) => sum + (bal.utilidad || 0), 0);
      
      await administradoresApi.update(admin.id, {
        ...admin,
        utilidadTotal,
      });

      toast({
        title: "Ingreso registrado",
        description: "El ingreso se registró y el balance se actualizó",
      });

      setOpenIngreso(false);
      setIngresoForm({ importe: "", concepto: "", fecha: "" });
      
      setSelectedBalance(balanceActualizado);
      
      await fetchBalances();
      await fetchDetalleBalance(selectedBalance.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el ingreso",
      });
    }
  };

  const handleCreateEgreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBalance?.id || !admin?.id) return;

    try {
      const egresoData: Egreso = {
        importe: Number(egresoForm.importe),
        concepto: egresoForm.concepto,
        fecha: egresoForm.fecha,
        balanceMensual: { id: selectedBalance.id },
      };

      await egresosApi.create(egresoData);

      const nuevosEgresos = await egresosApi.getAll(selectedBalance.id);
      const totalEgresos = nuevosEgresos.reduce((sum, egr) => sum + egr.importe, 0);
      
      const utilidad = selectedBalance.totalIngresos - totalEgresos;
      const balanceActualizado = await balancesApi.update(selectedBalance.id, {
        ...selectedBalance,
        totalEgresos,
        utilidad,
      });

      const todosLosBalances = await balancesApi.getAll(admin.id);
      const utilidadTotal = todosLosBalances.reduce((sum, bal) => sum + (bal.utilidad || 0), 0);
      
      await administradoresApi.update(admin.id, {
        ...admin,
        utilidadTotal,
      });

      toast({
        title: "Egreso registrado",
        description: "El egreso se registró y el balance se actualizó",
      });

      setOpenEgreso(false);
      setEgresoForm({ importe: "", concepto: "", fecha: "" });
      
      setSelectedBalance(balanceActualizado);
      
      await fetchBalances();
      await fetchDetalleBalance(selectedBalance.id);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el egreso",
      });
    }
  };

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Balances Mensuales
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona los balances financieros
          </p>
        </div>
        <Dialog open={openBalance} onOpenChange={setOpenBalance}>
          <DialogTrigger asChild>
            <Button className="bg-[hsl(4,100%,70%)] text-white font-bold uppercase tracking-wider hover:bg-[hsl(4,100%,62%)] shadow-md rounded-lg">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Balance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold uppercase tracking-wide">Nuevo Balance Mensual</DialogTitle>
              <DialogDescription>Selecciona mes y año</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBalance}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">Mes</Label>
                  <Select
                    value={balanceForm.mes}
                    onValueChange={(value) =>
                      setBalanceForm({ ...balanceForm, mes: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-10 rounded-lg mt-1">
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((mes, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {mes}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">Año</Label>
                  <Input
                    id="anio"
                    type="number"
                    value={balanceForm.anio}
                    onChange={(e) =>
                      setBalanceForm({ ...balanceForm, anio: e.target.value })
                    }
                    placeholder="2026"
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenBalance(false)}
                  className="rounded-lg"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[hsl(4,100%,70%)] text-white hover:bg-[hsl(4,100%,62%)] rounded-lg font-bold uppercase tracking-wider">
                  Crear Balance
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando balances...</div>
      ) : balances.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(229,29%,20%)]">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-4 text-base font-bold uppercase tracking-wide">
              No hay balances registrados
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Crea tu primer balance mensual
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Períodos Sidebar */}
          <Card className="lg:col-span-1 overflow-hidden border-0 shadow-sm h-fit">
            <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                Períodos
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white p-3">
              <div className="space-y-1">
                {balances.map((balance) => {
                  const isSelected = selectedBalance?.id === balance.id;
                  return (
                    <Button
                      key={balance.id}
                      variant="ghost"
                      className={`w-full justify-start rounded-lg font-medium transition-colors ${
                        isSelected 
                          ? "bg-[hsl(4,100%,70%)] text-white hover:bg-[hsl(4,100%,70%)] hover:text-white" 
                          : "text-foreground hover:bg-[hsl(220,20%,95%)]"
                      }`}
                      onClick={() => handleSelectBalance(balance)}
                    >
                      <Calendar className={`mr-2 h-4 w-4 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                      {meses[balance.mes - 1]} {balance.anio}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Balance Details */}
          {selectedBalance && (
            <div className="lg:col-span-2 space-y-6">
              {/* Stat Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                      Total Ingresos
                    </CardTitle>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(131,44%,62%)]">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white px-4 pt-4 pb-5">
                    <div className="text-2xl font-bold text-[hsl(131,44%,45%)]">
                      S/. {selectedBalance.totalIngresos.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                      Total Egresos
                    </CardTitle>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(4,100%,70%)]">
                      <TrendingDown className="h-3 w-3 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white px-4 pt-4 pb-5">
                    <div className="text-2xl font-bold text-[hsl(4,100%,62%)]">
                      S/. {selectedBalance.totalEgresos.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                      Utilidad
                    </CardTitle>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(229,29%,35%)]">
                      <BarChart3 className="h-3 w-3 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="bg-white px-4 pt-4 pb-5">
                    <div className="text-2xl font-bold text-foreground">
                      S/. {(selectedBalance.utilidad || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lists */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Ingresos List */}
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                      Ingresos
                    </CardTitle>
                    <Dialog open={openIngreso} onOpenChange={setOpenIngreso}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-7 px-2 rounded bg-white/10 hover:bg-white/20 text-white border-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-bold uppercase tracking-wide">Registrar Ingreso</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateIngreso}>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs font-semibold uppercase tracking-wider">Importe (S/.)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={ingresoForm.importe}
                                onChange={(e) =>
                                  setIngresoForm({ ...ingresoForm, importe: e.target.value })
                                }
                                required
                                className="h-10 rounded-lg mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold uppercase tracking-wider">Concepto</Label>
                              <Input
                                value={ingresoForm.concepto}
                                onChange={(e) =>
                                  setIngresoForm({ ...ingresoForm, concepto: e.target.value })
                                }
                                required
                                className="h-10 rounded-lg mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold uppercase tracking-wider">Fecha</Label>
                              <Input
                                type="date"
                                value={ingresoForm.fecha}
                                onChange={(e) =>
                                  setIngresoForm({ ...ingresoForm, fecha: e.target.value })
                                }
                                required
                                className="h-10 rounded-lg mt-1"
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-6 gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpenIngreso(false)} className="rounded-lg">
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-[hsl(4,100%,70%)] text-white hover:bg-[hsl(4,100%,62%)] rounded-lg font-bold uppercase tracking-wider">
                              Registrar
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="bg-white p-0">
                    <div className="divide-y divide-border">
                      {ingresos.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          No hay ingresos registrados
                        </p>
                      ) : (
                        ingresos.map((ingreso) => (
                          <div key={ingreso.id} className="flex justify-between items-center px-4 py-3 hover:bg-[hsl(220,20%,98%)]">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{ingreso.concepto}</p>
                              <p className="text-xs text-muted-foreground">{ingreso.fecha}</p>
                            </div>
                            <p className="text-sm font-bold text-[hsl(131,44%,45%)]">
                              + S/. {ingreso.importe.toFixed(2)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Egresos List */}
                <Card className="overflow-hidden border-0 shadow-sm">
                  <CardHeader className="bg-[hsl(229,29%,20%)] px-4 py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
                      Egresos
                    </CardTitle>
                    <Dialog open={openEgreso} onOpenChange={setOpenEgreso}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="h-7 px-2 rounded bg-white/10 hover:bg-white/20 text-white border-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md rounded-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-bold uppercase tracking-wide">Registrar Egreso</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateEgreso}>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs font-semibold uppercase tracking-wider">Importe (S/.)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={egresoForm.importe}
                                onChange={(e) =>
                                  setEgresoForm({ ...egresoForm, importe: e.target.value })
                                }
                                required
                                className="h-10 rounded-lg mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold uppercase tracking-wider">Concepto</Label>
                              <Input
                                value={egresoForm.concepto}
                                onChange={(e) =>
                                  setEgresoForm({ ...egresoForm, concepto: e.target.value })
                                }
                                required
                                className="h-10 rounded-lg mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold uppercase tracking-wider">Fecha</Label>
                              <Input
                                type="date"
                                value={egresoForm.fecha}
                                onChange={(e) =>
                                  setEgresoForm({ ...egresoForm, fecha: e.target.value })
                                }
                                required
                                className="h-10 rounded-lg mt-1"
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-6 gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpenEgreso(false)} className="rounded-lg">
                              Cancelar
                            </Button>
                            <Button type="submit" className="bg-[hsl(4,100%,70%)] text-white hover:bg-[hsl(4,100%,62%)] rounded-lg font-bold uppercase tracking-wider">
                              Registrar
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="bg-white p-0">
                    <div className="divide-y divide-border">
                      {egresos.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          No hay egresos registrados
                        </p>
                      ) : (
                        egresos.map((egreso) => (
                          <div key={egreso.id} className="flex justify-between items-center px-4 py-3 hover:bg-[hsl(220,20%,98%)]">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{egreso.concepto}</p>
                              <p className="text-xs text-muted-foreground">{egreso.fecha}</p>
                            </div>
                            <p className="text-sm font-bold text-[hsl(4,100%,62%)]">
                              - S/. {egreso.importe.toFixed(2)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

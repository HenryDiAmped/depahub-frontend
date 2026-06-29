"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Plus, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { balancesApi, ingresosApi, egresosApi } from "@/lib/api";
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
    if (!selectedBalance?.id) return;

    try {
      const ingresoData: Ingreso = {
        importe: Number(ingresoForm.importe),
        concepto: ingresoForm.concepto,
        fecha: ingresoForm.fecha,
        balanceMensual: { id: selectedBalance.id },
      };

      await ingresosApi.create(ingresoData);
      toast({
        title: "Ingreso registrado",
        description: "El ingreso se registró correctamente",
      });

      setOpenIngreso(false);
      setIngresoForm({ importe: "", concepto: "", fecha: "" });
      fetchBalances();
      fetchDetalleBalance(selectedBalance.id);
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
    if (!selectedBalance?.id) return;

    try {
      const egresoData: Egreso = {
        importe: Number(egresoForm.importe),
        concepto: egresoForm.concepto,
        fecha: egresoForm.fecha,
        balanceMensual: { id: selectedBalance.id },
      };

      await egresosApi.create(egresoData);
      toast({
        title: "Egreso registrado",
        description: "El egreso se registró correctamente",
      });

      setOpenEgreso(false);
      setEgresoForm({ importe: "", concepto: "", fecha: "" });
      fetchBalances();
      fetchDetalleBalance(selectedBalance.id);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balances Mensuales</h1>
          <p className="text-muted-foreground">
            Gestiona los balances financieros
          </p>
        </div>
        <Dialog open={openBalance} onOpenChange={setOpenBalance}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Balance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Balance Mensual</DialogTitle>
              <DialogDescription>Selecciona mes y año</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBalance}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mes">Mes</Label>
                  <Select
                    value={balanceForm.mes}
                    onValueChange={(value) =>
                      setBalanceForm({ ...balanceForm, mes: value })
                    }
                    required
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="anio">Año</Label>
                  <Input
                    id="anio"
                    type="number"
                    value={balanceForm.anio}
                    onChange={(e) =>
                      setBalanceForm({ ...balanceForm, anio: e.target.value })
                    }
                    placeholder="2026"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit">Crear Balance</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando balances...</div>
      ) : balances.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">
              No hay balances registrados
            </h3>
            <p className="text-muted-foreground">
              Crea tu primer balance mensual
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Períodos</CardTitle>
              <CardDescription>Selecciona un balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {balances.map((balance) => (
                  <Button
                    key={balance.id}
                    variant={
                      selectedBalance?.id === balance.id ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => handleSelectBalance(balance)}
                  >
                    {meses[balance.mes - 1]} {balance.anio}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedBalance && (
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Ingresos
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      S/. {selectedBalance.totalIngresos.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Egresos
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      S/. {selectedBalance.totalEgresos.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Utilidad
                    </CardTitle>
                    <BarChart3 className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      S/. {(selectedBalance.utilidad || 0).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Ingresos</CardTitle>
                      <Dialog open={openIngreso} onOpenChange={setOpenIngreso}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Registrar Ingreso</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateIngreso}>
                            <div className="space-y-4">
                              <div>
                                <Label>Importe (S/.)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={ingresoForm.importe}
                                  onChange={(e) =>
                                    setIngresoForm({
                                      ...ingresoForm,
                                      importe: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>

                              <div>
                                <Label>Concepto</Label>
                                <Input
                                  value={ingresoForm.concepto}
                                  onChange={(e) =>
                                    setIngresoForm({
                                      ...ingresoForm,
                                      concepto: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label>Fecha</Label>
                                <Input
                                  type="date"
                                  value={ingresoForm.fecha}
                                  onChange={(e) =>
                                    setIngresoForm({
                                      ...ingresoForm,
                                      fecha: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <DialogFooter className="mt-6">
                              <Button type="submit">Registrar</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ingresos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No hay ingresos registrados
                        </p>
                      ) : (
                        ingresos.map((ingreso) => (
                          <div
                            key={ingreso.id}
                            className="flex justify-between text-sm border-b pb-2"
                          >
                            <div>
                              <p className="font-medium">{ingreso.concepto}</p>
                              <p className="text-muted-foreground">
                                {ingreso.fecha}
                              </p>
                            </div>
                            <p className="font-bold text-green-600">
                              S/. {ingreso.importe.toFixed(2)}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Egresos</CardTitle>
                      <Dialog open={openEgreso} onOpenChange={setOpenEgreso}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Registrar Egreso</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleCreateEgreso}>
                            <div className="space-y-4">
                              <div>
                                <Label>Importe (S/.)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={egresoForm.importe}
                                  onChange={(e) =>
                                    setEgresoForm({
                                      ...egresoForm,
                                      importe: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label>Concepto</Label>
                                <Input
                                  value={egresoForm.concepto}
                                  onChange={(e) =>
                                    setEgresoForm({
                                      ...egresoForm,
                                      concepto: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <Label>Fecha</Label>
                                <Input
                                  type="date"
                                  value={egresoForm.fecha}
                                  onChange={(e) =>
                                    setEgresoForm({
                                      ...egresoForm,
                                      fecha: e.target.value,
                                    })
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <DialogFooter className="mt-6">
                              <Button type="submit">Registrar</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      {egresos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No hay egresos registrados
                        </p>
                      ) : (
                        egresos.map((egreso) => (
                          <div
                            key={egreso.id}
                            className="flex justify-between text-sm border-b pb-2"
                          >
                            <div>
                              <p className="font-medium">{egreso.concepto}</p>
                              <p className="text-muted-foreground">
                                {egreso.fecha}
                              </p>
                            </div>
                            <p className="font-bold text-red-600">
                              S/. {egreso.importe.toFixed(2)}
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

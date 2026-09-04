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
import { Plus, CreditCard, ArrowUpCircle, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import { cuentasApi, inquilinosApi } from "@/lib/api";
import type { Cuenta, Inquilino } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export default function CuentasPage() {
  const { admin } = useAuth();
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "POR_COBRAR" as const,
    importe: "",
    concepto: "",
    fechaEmitida: "",
    estado: "PENDIENTE" as const,
    inquilinoId: "",
  });

  useEffect(() => {
    fetchData();
  }, [admin]);

  const fetchData = async () => {
    if (!admin?.id) return;

    try {
      const [cuentasData, inquilinosData] = await Promise.all([
        cuentasApi.getAll(admin.id),
        inquilinosApi.getAll(),
      ]);
      setCuentas(cuentasData);
      setInquilinos(inquilinosData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin?.id) return;

    try {
      const cuentaData: Cuenta = {
        tipo: formData.tipo,
        importe: Number(formData.importe),
        concepto: formData.concepto,
        fechaEmitida: formData.fechaEmitida,
        estado: formData.estado,
        administrador: { id: admin.id },
        inquilino: { id: Number(formData.inquilinoId) },
      };

      await cuentasApi.create(cuentaData);
      toast({
        title: "Cuenta creada",
        description: "La cuenta se creó correctamente",
      });

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la cuenta",
      });
    }
  };

  const handleMarcarSaldada = async (cuenta: Cuenta) => {
    if (!cuenta.id) return;

    try {
      await cuentasApi.update(cuenta.id, {
        ...cuenta,
        estado: "SALDADA",
      });
      toast({
        title: "Cuenta actualizada",
        description: "La cuenta se marcó como saldada",
      });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la cuenta",
      });
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      tipo: "POR_COBRAR",
      importe: "",
      concepto: "",
      fechaEmitida: today,
      estado: "PENDIENTE",
      inquilinoId: "",
    });
  };

  const cuentasPendientes = cuentas.filter((c) => c.estado === "PENDIENTE");
  const totalPorCobrar = cuentasPendientes
    .filter((c) => c.tipo === "POR_COBRAR")
    .reduce((sum, c) => sum + c.importe, 0);
  const totalPorPagar = cuentasPendientes
    .filter((c) => c.tipo === "POR_PAGAR")
    .reduce((sum, c) => sum + c.importe, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Cuentas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona las cuentas por cobrar y por pagar
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-[hsl(4,100%,70%)] text-white font-bold uppercase tracking-wider hover:bg-[hsl(4,100%,62%)] shadow-md rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold uppercase tracking-wide">
                Nueva Cuenta
              </DialogTitle>
              <DialogDescription>Complete los datos de la cuenta</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Tipo
                  </Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-lg mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POR_COBRAR">Por Cobrar</SelectItem>
                      <SelectItem value="POR_PAGAR">Por Pagar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Inquilino
                  </Label>
                  <Select
                    value={formData.inquilinoId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, inquilinoId: value })
                    }
                    required
                  >
                    <SelectTrigger className="h-10 rounded-lg mt-1">
                      <SelectValue placeholder="Seleccionar inquilino" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquilinos.map((inquilino) => (
                        <SelectItem
                          key={inquilino.id}
                          value={inquilino.id!.toString()}
                        >
                          {inquilino.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Importe (S/.)
                  </Label>
                  <Input
                    id="importe"
                    type="number"
                    step="0.01"
                    value={formData.importe}
                    onChange={(e) =>
                      setFormData({ ...formData, importe: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Fecha
                  </Label>
                  <Input
                    id="fechaEmitida"
                    type="date"
                    value={formData.fechaEmitida}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaEmitida: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Concepto
                  </Label>
                  <Input
                    id="concepto"
                    value={formData.concepto}
                    onChange={(e) =>
                      setFormData({ ...formData, concepto: e.target.value })
                    }
                    placeholder="Ej: Pago mensualidad julio"
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[hsl(4,100%,70%)] text-white hover:bg-[hsl(4,100%,62%)] rounded-lg font-bold uppercase tracking-wider"
                >
                  Crear Cuenta
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumen stat cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Por Cobrar */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader
            className="px-4 py-3 flex flex-row items-center justify-between space-y-0"
            style={{ background: "hsl(229,29%,20%)" }}
          >
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
              Por Cobrar
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(131,44%,62%)]">
              <ArrowUpCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="bg-white px-4 pt-4 pb-5">
            <div className="text-3xl font-bold text-[hsl(131,44%,45%)]">
              S/. {totalPorCobrar.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cuentasPendientes.filter((c) => c.tipo === "POR_COBRAR").length} cuentas pendientes
            </p>
          </CardContent>
        </Card>

        {/* Por Pagar */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader
            className="px-4 py-3 flex flex-row items-center justify-between space-y-0"
            style={{ background: "hsl(229,29%,20%)" }}
          >
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
              Por Pagar
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(4,100%,70%)]">
              <ArrowDownCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="bg-white px-4 pt-4 pb-5">
            <div className="text-3xl font-bold text-[hsl(4,100%,62%)]">
              S/. {totalPorPagar.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cuentasPendientes.filter((c) => c.tipo === "POR_PAGAR").length} cuentas pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Listado */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando cuentas...
        </div>
      ) : cuentas.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(229,29%,20%)]">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-4 text-base font-bold uppercase tracking-wide">
              No hay cuentas registradas
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comienza registrando tu primera cuenta
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardHeader
            className="px-4 py-3"
            style={{ background: "hsl(229,29%,20%)" }}
          >
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
              Listado de Cuentas
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white p-0">
            <div className="divide-y divide-border">
              {cuentas.map((cuenta) => {
                const esCobrar = cuenta.tipo === "POR_COBRAR";
                const isPendiente = cuenta.estado === "PENDIENTE";
                return (
                  <div
                    key={cuenta.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[hsl(220,20%,98%)] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Tipo icon */}
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          esCobrar
                            ? "bg-[hsl(131,44%,62%)]"
                            : "bg-[hsl(4,100%,70%)]"
                        }`}
                      >
                        {esCobrar ? (
                          <ArrowUpCircle className="h-4 w-4 text-white" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                              esCobrar
                                ? "bg-[hsl(131,44%,92%)] text-[hsl(131,44%,38%)]"
                                : "bg-[hsl(4,100%,95%)] text-[hsl(4,100%,50%)]"
                            }`}
                          >
                            {cuenta.tipo.replace("_", " ")}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                              isPendiente
                                ? "bg-amber-100 text-amber-700"
                                : "bg-[hsl(131,44%,92%)] text-[hsl(131,44%,38%)]"
                            }`}
                          >
                            {cuenta.estado}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {cuenta.concepto}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cuenta.fechaEmitida}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5">
                      <p
                        className={`text-lg font-bold ${
                          esCobrar
                            ? "text-[hsl(131,44%,45%)]"
                            : "text-[hsl(4,100%,62%)]"
                        }`}
                      >
                        S/. {cuenta.importe.toFixed(2)}
                      </p>
                      {isPendiente && (
                        <Button
                          size="sm"
                          onClick={() => handleMarcarSaldada(cuenta)}
                          className="h-7 rounded-lg bg-[hsl(131,44%,62%)] text-white hover:bg-[hsl(131,44%,55%)] text-[10px] font-bold uppercase tracking-wider"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Saldar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

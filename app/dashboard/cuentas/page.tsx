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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CreditCard, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cuentas</h1>
          <p className="text-muted-foreground">
            Gestiona las cuentas por cobrar y por pagar
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Cuenta</DialogTitle>
              <DialogDescription>Complete los datos de la cuenta</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POR_COBRAR">Por Cobrar</SelectItem>
                      <SelectItem value="POR_PAGAR">Por Pagar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="inquilino">Inquilino</Label>
                  <Select
                    value={formData.inquilinoId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, inquilinoId: value })
                    }
                    required
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="importe">Importe (S/.)</Label>
                  <Input
                    id="importe"
                    type="number"
                    step="0.01"
                    value={formData.importe}
                    onChange={(e) =>
                      setFormData({ ...formData, importe: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaEmitida">Fecha</Label>
                  <Input
                    id="fechaEmitida"
                    type="date"
                    value={formData.fechaEmitida}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaEmitida: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="concepto">Concepto</Label>
                  <Input
                    id="concepto"
                    value={formData.concepto}
                    onChange={(e) =>
                      setFormData({ ...formData, concepto: e.target.value })
                    }
                    placeholder="Ej: Pago mensualidad julio"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Cuenta</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              S/. {totalPorCobrar.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cuentasPendientes.filter((c) => c.tipo === "POR_COBRAR").length}{" "}
              cuentas pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Pagar</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              S/. {totalPorPagar.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cuentasPendientes.filter((c) => c.tipo === "POR_PAGAR").length}{" "}
              cuentas pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando cuentas...</div>
      ) : cuentas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">
              No hay cuentas registradas
            </h3>
            <p className="text-muted-foreground">
              Comienza registrando tu primera cuenta
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Listado de Cuentas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cuentas.map((cuenta) => (
                <div
                  key={cuenta.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          cuenta.tipo === "POR_COBRAR" ? "default" : "secondary"
                        }
                      >
                        {cuenta.tipo}
                      </Badge>
                      <Badge
                        variant={
                          cuenta.estado === "PENDIENTE"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {cuenta.estado}
                      </Badge>
                    </div>
                    <p className="font-medium">{cuenta.concepto}</p>
                    <p className="text-sm text-muted-foreground">
                      Fecha: {cuenta.fechaEmitida}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xl font-bold">
                      S/. {cuenta.importe.toFixed(2)}
                    </p>
                    {cuenta.estado === "PENDIENTE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarcarSaldada(cuenta)}
                      >
                        Marcar Saldada
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

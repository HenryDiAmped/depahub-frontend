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
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, CalendarDays, DollarSign } from "lucide-react";
import { contratosApi, inquilinosApi } from "@/lib/api";
import type { Contrato, Inquilino } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export default function ContratosPage() {
  const { admin } = useAuth();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    montoAlquiler: "",
    garantia: "",
    estado: "ACTIVO" as const,
    condiciones: "",
    inquilinoId: "",
  });

  useEffect(() => {
    fetchData();
  }, [admin]);

  const fetchData = async () => {
    if (!admin?.id) return;

    try {
      const [contratosData, inquilinosData] = await Promise.all([
        contratosApi.getAll(admin.id),
        inquilinosApi.getAll(),
      ]);
      setContratos(contratosData);
      setInquilinos(
        inquilinosData.filter(
          (inquilino) =>
            inquilino.estado === "ACTIVO" &&
            inquilino.inmueble?.propiedad?.administrador?.id === admin.id
        )
      );
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
      const today = new Date().toISOString().split("T")[0];
      const contratoData: Contrato = {
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        montoAlquiler: Number(formData.montoAlquiler),
        garantia: Number(formData.garantia),
        estado: formData.estado,
        condiciones: formData.condiciones,
        fechaRegistro: today,
        administrador: { id: admin.id },
        inquilino: { id: Number(formData.inquilinoId) },
      };

      await contratosApi.create(contratoData);
      toast({
        title: "Contrato creado",
        description: "El contrato se creó correctamente",
      });

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el contrato",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      fechaInicio: "",
      fechaFin: "",
      montoAlquiler: "",
      garantia: "",
      estado: "ACTIVO",
      condiciones: "",
      inquilinoId: "",
    });
  };

  const handleInquilinoChange = (inquilinoId: string) => {
    const inquilinoSeleccionado = inquilinos.find(
      (inquilino) => inquilino.id === Number(inquilinoId)
    );
    const precioBase = inquilinoSeleccionado?.inmueble?.precioBase;

    setFormData((currentFormData) => ({
      ...currentFormData,
      inquilinoId,
      ...(precioBase !== undefined && {
        montoAlquiler: precioBase.toString(),
        garantia: precioBase.toString(),
      }),
    }));
  };

  // Helpers de estado
  const estadoStyle = (estado: string) => {
    if (estado === "ACTIVO")
      return "bg-[hsl(131,44%,62%)] text-white";
    if (estado === "FINALIZADO")
      return "bg-[hsl(229,29%,35%)] text-white/80";
    return "bg-[hsl(4,100%,70%)] text-white";
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Contratos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona los contratos de alquiler
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-[hsl(4,100%,70%)] text-white font-bold uppercase tracking-wider hover:bg-[hsl(4,100%,62%)] shadow-md rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold uppercase tracking-wide">
                Nuevo Contrato
              </DialogTitle>
              <DialogDescription>
                Complete los datos del contrato
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Inquilino
                  </Label>
                  <Select
                    value={formData.inquilinoId}
                    onValueChange={handleInquilinoChange}
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
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaInicio: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Fecha Fin
                  </Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaFin: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Monto Alquiler (S/.)
                  </Label>
                  <Input
                    id="montoAlquiler"
                    type="number"
                    step="0.01"
                    value={formData.montoAlquiler}
                    onChange={(e) =>
                      setFormData({ ...formData, montoAlquiler: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Garantía (S/.)
                  </Label>
                  <Input
                    id="garantia"
                    type="number"
                    step="0.01"
                    value={formData.garantia}
                    onChange={(e) =>
                      setFormData({ ...formData, garantia: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Condiciones
                  </Label>
                  <Textarea
                    id="condiciones"
                    value={formData.condiciones}
                    onChange={(e) =>
                      setFormData({ ...formData, condiciones: e.target.value })
                    }
                    placeholder="Ej: Pago mensual, mantenimiento incluido..."
                    className="rounded-lg mt-1"
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
                  Crear Contrato
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando contratos...
        </div>
      ) : contratos.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(229,29%,20%)]">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-4 text-base font-bold uppercase tracking-wide">
              No hay contratos registrados
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comienza creando tu primer contrato
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contratos.map((contrato) => (
            <Card
              key={contrato.id}
              className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header: dark navy */}
              <CardHeader
                className="px-4 py-3 flex flex-row items-center justify-between space-y-0"
                style={{ background: "hsl(229,29%,20%)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(229,29%,32%)]">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">
                    Contrato #{contrato.id}
                  </CardTitle>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${estadoStyle(contrato.estado)}`}
                >
                  {contrato.estado}
                </span>
              </CardHeader>

              {/* Body: white */}
              <CardContent className="bg-white px-4 pt-3 pb-4 space-y-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {contrato.fechaInicio} — {contrato.fechaFin}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg bg-[hsl(131,44%,95%)] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(131,44%,40%)]">
                      Alquiler
                    </p>
                    <p className="text-base font-bold text-[hsl(131,44%,40%)]">
                      S/. {contrato.montoAlquiler.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[hsl(229,29%,95%)] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(229,29%,40%)]">
                      Garantía
                    </p>
                    <p className="text-base font-bold text-[hsl(229,29%,40%)]">
                      S/. {contrato.garantia.toFixed(2)}
                    </p>
                  </div>
                </div>
                {contrato.condiciones && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                    {contrato.condiciones}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

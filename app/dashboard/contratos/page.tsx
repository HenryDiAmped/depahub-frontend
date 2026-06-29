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
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText } from "lucide-react";
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
      setInquilinos(inquilinosData.filter((i) => i.estado === "ACTIVO"));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-muted-foreground">Gestiona los contratos de alquiler</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Contrato</DialogTitle>
              <DialogDescription>
                Complete los datos del contrato
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
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
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaInicio: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) =>
                      setFormData({ ...formData, fechaFin: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="montoAlquiler">Monto Alquiler (S/.)</Label>
                  <Input
                    id="montoAlquiler"
                    type="number"
                    step="0.01"
                    value={formData.montoAlquiler}
                    onChange={(e) =>
                      setFormData({ ...formData, montoAlquiler: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="garantia">Garantía (S/.)</Label>
                  <Input
                    id="garantia"
                    type="number"
                    step="0.01"
                    value={formData.garantia}
                    onChange={(e) =>
                      setFormData({ ...formData, garantia: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="condiciones">Condiciones</Label>
                  <Textarea
                    id="condiciones"
                    value={formData.condiciones}
                    onChange={(e) =>
                      setFormData({ ...formData, condiciones: e.target.value })
                    }
                    placeholder="Ej: Pago mensual, mantenimiento incluido..."
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
                <Button type="submit">Crear Contrato</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando contratos...</div>
      ) : contratos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">
              No hay contratos registrados
            </h3>
            <p className="text-muted-foreground">
              Comienza creando tu primer contrato
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {contratos.map((contrato) => (
            <Card key={contrato.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>Contrato #{contrato.id}</span>
                  <Badge
                    variant={
                      contrato.estado === "ACTIVO" ? "default" : "secondary"
                    }
                  >
                    {contrato.estado}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {contrato.fechaInicio} - {contrato.fechaFin}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alquiler:</span>
                    <span className="font-medium">
                      S/. {contrato.montoAlquiler.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Garantía:</span>
                    <span className="font-medium">
                      S/. {contrato.garantia.toFixed(2)}
                    </span>
                  </div>
                  {contrato.condiciones && (
                    <p className="mt-2 text-muted-foreground">
                      {contrato.condiciones}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

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
import { Plus, FileText, CalendarDays, Download, Eye } from "lucide-react";
import { contratosApi, inquilinosApi } from "@/lib/api";
import type { Contrato, Inquilino } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

type PlanCuotas = {
  cuotasCompletas: number;
  tieneProrrateo: boolean;
  numeroCuotas: number;
};

function fechaLocal(valor: string) {
  const [anio, mes, dia] = valor.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

function sumarMeses(fecha: Date, meses: number) {
  const mesDestino = fecha.getMonth() + meses;
  const anioDestino = fecha.getFullYear() + Math.floor(mesDestino / 12);
  const mesNormalizado = ((mesDestino % 12) + 12) % 12;
  const ultimoDia = new Date(anioDestino, mesNormalizado + 1, 0).getDate();
  return new Date(anioDestino, mesNormalizado, Math.min(fecha.getDate(), ultimoDia));
}

function calcularPlanCuotas(fechaInicio: string, fechaFin: string, frecuencia: number): PlanCuotas | null {
  if (!fechaInicio || !fechaFin || frecuencia <= 0) return null;

  const fin = fechaLocal(fechaFin);
  let inicioPeriodo = fechaLocal(fechaInicio);
  if (Number.isNaN(fin.getTime()) || Number.isNaN(inicioPeriodo.getTime()) || fin < inicioPeriodo) {
    return null;
  }

  let cuotasCompletas = 0;
  while (true) {
    const siguientePeriodo = sumarMeses(inicioPeriodo, frecuencia);
    const finPeriodo = new Date(siguientePeriodo);
    finPeriodo.setDate(finPeriodo.getDate() - 1);
    if (finPeriodo > fin) break;
    cuotasCompletas++;
    inicioPeriodo = siguientePeriodo;
  }

  const tieneProrrateo = inicioPeriodo <= fin;
  return {
    cuotasCompletas,
    tieneProrrateo,
    numeroCuotas: cuotasCompletas + (tieneProrrateo ? 1 : 0),
  };
}

export default function ContratosPage() {
  const { admin } = useAuth();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [contratoPdf, setContratoPdf] = useState<Contrato | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fechaInicio: "",
    fechaFin: "",
    montoAlquiler: "",
    garantia: "",
    frecuencia: "",
    frecuenciaPersonalizada: "",
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

    if (!planCuotas || !frecuenciaSeleccionada) {
      toast({
        variant: "destructive",
        title: "Datos de pago incompletos",
        description: "Selecciona fechas válidas y una frecuencia de pago.",
      });
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      const contratoData: Contrato = {
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        montoAlquiler: Number(formData.montoAlquiler),
        garantia: Number(formData.garantia),
        frecuencia: frecuenciaSeleccionada,
        numeroCuotas: planCuotas.numeroCuotas,
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
      await fetchData();
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
      frecuencia: "",
      frecuenciaPersonalizada: "",
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

  const fechasValidas = Boolean(
    formData.fechaInicio && formData.fechaFin && formData.fechaFin >= formData.fechaInicio
  );
  const frecuenciaSeleccionada = formData.frecuencia === "PERSONALIZADA"
    ? Number(formData.frecuenciaPersonalizada)
    : Number(formData.frecuencia);
  const planCuotas = fechasValidas
    ? calcularPlanCuotas(formData.fechaInicio, formData.fechaFin, frecuenciaSeleccionada)
    : null;

  const handleVerPdf = async (contrato: Contrato) => {
    if (!contrato.id) return;

    setIsGeneratingPdf(contrato.id);
    try {
      const pdf = await contratosApi.obtenerPdf(contrato.id);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(pdf));
      setContratoPdf(contrato);
      setPdfOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "No se pudo generar el PDF",
        description: error instanceof Error ? error.message : "Intenta nuevamente",
      });
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  const handlePdfDialogChange = (isOpen: boolean) => {
    setPdfOpen(isOpen);
    if (!isOpen && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setContratoPdf(null);
    }
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
                    Frecuencia de pago
                  </Label>
                  <Select
                    value={formData.frecuencia}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        frecuencia: value,
                        frecuenciaPersonalizada: value === "PERSONALIZADA" ? formData.frecuenciaPersonalizada : "",
                      })
                    }
                    disabled={!fechasValidas}
                  >
                    <SelectTrigger className="mt-1 h-10 rounded-lg">
                      <SelectValue placeholder={fechasValidas ? "Seleccionar frecuencia" : "Completa las fechas primero"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mensual</SelectItem>
                      <SelectItem value="2">Bimestral</SelectItem>
                      <SelectItem value="3">Trimestral</SelectItem>
                      <SelectItem value="6">Semestral</SelectItem>
                      <SelectItem value="12">Anual</SelectItem>
                      <SelectItem value="PERSONALIZADA">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.frecuencia === "PERSONALIZADA" && (
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider">
                      Cada cuántos meses
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.frecuenciaPersonalizada}
                      onChange={(event) =>
                        setFormData({ ...formData, frecuenciaPersonalizada: event.target.value })
                      }
                      disabled={!fechasValidas}
                      required
                      className="mt-1 h-10 rounded-lg"
                    />
                  </div>
                )}
                {planCuotas && (
                  <div className="col-span-2 rounded-lg bg-[hsl(131,44%,95%)] px-4 py-3 text-sm">
                    <p className="font-bold text-[hsl(131,44%,40%)]">
                      {planCuotas.numeroCuotas} cuotas en total
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {planCuotas.tieneProrrateo
                        ? `${planCuotas.cuotasCompletas} cuotas completas + 1 cuota especial prorrateada.`
                        : `${planCuotas.cuotasCompletas} cuotas completas.`}
                    </p>
                  </div>
                )}
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
                <p className="text-xs font-semibold text-[hsl(229,29%,40%)]">
                  Pago cada {contrato.frecuencia} {contrato.frecuencia === 1 ? "mes" : "meses"} · {contrato.numeroCuotas} {contrato.numeroCuotas === 1 ? "cuota" : "cuotas"}
                </p>
                {contrato.condiciones && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                    {contrato.condiciones}
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full rounded-lg"
                  onClick={() => handleVerPdf(contrato)}
                  disabled={isGeneratingPdf === contrato.id}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isGeneratingPdf === contrato.id ? "Generando PDF..." : "Ver y descargar PDF"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={pdfOpen} onOpenChange={handlePdfDialogChange}>
        <DialogContent className="flex h-[88vh] max-w-5xl flex-col rounded-2xl p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="font-bold uppercase tracking-wide">
              Contrato #{contratoPdf?.id}
            </DialogTitle>
            <DialogDescription>
              Vista previa del contrato generado con los datos registrados.
            </DialogDescription>
          </DialogHeader>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              title={`Contrato ${contratoPdf?.id}`}
              className="min-h-0 flex-1 border-0"
            />
          )}
          <DialogFooter className="border-t px-6 py-4">
            {pdfUrl && contratoPdf?.id && (
              <a href={pdfUrl} download={`contrato-${contratoPdf.id}.pdf`}>
                <Button className="bg-[hsl(4,100%,70%)] text-white hover:bg-[hsl(4,100%,62%)]">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

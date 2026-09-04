"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft, Plus, Home, Edit, Trash2, Building2, User } from "lucide-react";
import { propiedadesApi, inmueblesApi, inquilinosApi } from "@/lib/api";
import type { Propiedad, Inmueble, EstadoInmueble, Inquilino } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { errorHandlers } from "@/lib/error-handler";

export default function PropiedadDetallePage() {
  const params = useParams();
  const router = useRouter();
  const propiedadId = Number(params.id);

  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingInmueble, setEditingInmueble] = useState<Inmueble | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    piso: "",
    precioBase: "",
    estado: "DISPONIBLE" as EstadoInmueble,
    descripcion: "",
  });

  useEffect(() => {
    fetchData();
  }, [propiedadId]);

  const fetchData = async () => {
    try {
      const [propiedadData, inmueblesData, inquilinosData] = await Promise.all([
        propiedadesApi.getById(propiedadId),
        inmueblesApi.getAll(propiedadId),
        inquilinosApi.getAll(),
      ]);
      setPropiedad(propiedadData);
      setInmuebles(inmueblesData);
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

    try {
      const inmuebleData: Inmueble = {
        nombre: formData.nombre,
        piso: Number(formData.piso),
        precioBase: Number(formData.precioBase),
        estado: formData.estado,
        descripcion: formData.descripcion,
        propiedad: { id: propiedadId },
      };

      if (editingInmueble?.id) {
        await inmueblesApi.update(editingInmueble.id, {
          ...inmuebleData,
          id: editingInmueble.id,
        });
        toast({
          title: "Inmueble actualizado",
          description: "El inmueble se actualizó correctamente",
        });
      } else {
        await inmueblesApi.create(inmuebleData);
        toast({
          title: "Inmueble creado",
          description: "El inmueble se creó correctamente",
        });
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el inmueble",
      });
    }
  };

  const handleEdit = (inmueble: Inmueble) => {
    setEditingInmueble(inmueble);
    setFormData({
      nombre: inmueble.nombre,
      piso: inmueble.piso.toString(),
      precioBase: inmueble.precioBase.toString(),
      estado: inmueble.estado,
      descripcion: inmueble.descripcion,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este inmueble?")) return;

    try {
      await inmueblesApi.delete(id);
      toast({
        title: "Inmueble eliminado",
        description: "El inmueble se eliminó correctamente",
      });
      fetchData();
    } catch (error) {
      const { title, description } = errorHandlers.delete(error, "el inmueble", "inmueble");
      toast({
        variant: "destructive",
        title,
        description,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      piso: "",
      precioBase: "",
      estado: "DISPONIBLE",
      descripcion: "",
    });
    setEditingInmueble(null);
  };

  const getEstadoBadgeStyle = (estado: EstadoInmueble) => {
    switch (estado) {
      case "DISPONIBLE":
        return "bg-[hsl(131,44%,62%)] text-white"; // Green
      case "OCUPADO":
        return "bg-[hsl(4,100%,70%)] text-white"; // Coral
      case "MANTENIMIENTO":
        return "bg-amber-500 text-white";
      default:
        return "bg-[hsl(229,29%,35%)] text-white";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
  }

  if (!propiedad) {
    return <div className="text-center py-8 text-muted-foreground">Propiedad no encontrada</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/propiedades")}
          className="rounded-full h-10 w-10 hover:bg-[hsl(229,29%,90%)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            {propiedad.nombre}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {propiedad.direccion}, {propiedad.distrito}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-[hsl(4,100%,70%)] text-white font-bold uppercase tracking-wider hover:bg-[hsl(4,100%,62%)] shadow-md rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Inmueble
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold uppercase tracking-wide">
                {editingInmueble ? "Editar Inmueble" : "Nuevo Inmueble"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del inmueble
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Nombre
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Ej: Departamento 301"
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider">
                      Piso
                    </Label>
                    <Input
                      id="piso"
                      type="number"
                      value={formData.piso}
                      onChange={(e) =>
                        setFormData({ ...formData, piso: e.target.value })
                      }
                      required
                      className="h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider">
                      Precio Base (S/.)
                    </Label>
                    <Input
                      id="precioBase"
                      type="number"
                      step="0.01"
                      value={formData.precioBase}
                      onChange={(e) =>
                        setFormData({ ...formData, precioBase: e.target.value })
                      }
                      required
                      className="h-10 rounded-lg mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Estado
                  </Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: EstadoInmueble) =>
                      setFormData({ ...formData, estado: value })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-lg mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISPONIBLE">Disponible</SelectItem>
                      <SelectItem value="OCUPADO">Ocupado</SelectItem>
                      <SelectItem value="MANTENIMIENTO">
                        Mantenimiento
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Descripción
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
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
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Propiedad */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader
          className="px-4 py-3 flex flex-row items-center justify-between space-y-0"
          style={{ background: "hsl(229,29%,20%)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(229,29%,32%)]">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-[hsl(220,20%,75%)]">
              Información de la Propiedad
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="bg-white px-4 pt-4 pb-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Dirección</span>
              <span className="font-medium text-foreground">{propiedad.direccion}</span>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Distrito</span>
              <span className="font-medium text-foreground">{propiedad.distrito}</span>
            </div>
            {propiedad.descripcion && (
              <div className="md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Descripción</span>
                <span className="text-sm text-foreground/80">{propiedad.descripcion}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Listado Inmuebles */}
      <div className="pt-2">
        <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">
          Inmuebles ({inmuebles.length})
        </h2>
        {inmuebles.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(229,29%,20%)]">
                <Home className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 text-base font-bold uppercase tracking-wide">
                No hay inmuebles registrados
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comienza agregando el primer inmueble a esta propiedad
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inmuebles.map((inmueble) => {
              const inquilino = inquilinos.find(
                (inq) => inq.inmueble?.id === inmueble.id && inq.estado === "ACTIVO"
              );

              return (
                <Card
                  key={inmueble.id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <CardHeader
                    className="px-4 py-3 flex flex-row items-center justify-between space-y-0"
                    style={{ background: "hsl(229,29%,20%)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(229,29%,32%)]">
                        <Home className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-white truncate">
                        {inmueble.nombre}
                      </CardTitle>
                    </div>
                    <span
                      className={`shrink-0 ml-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${getEstadoBadgeStyle(
                        inmueble.estado
                      )}`}
                    >
                      {inmueble.estado}
                    </span>
                  </CardHeader>
                  
                  <CardContent className="bg-white px-4 pt-4 pb-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Piso {inmueble.piso}
                      </span>
                      <div className="text-lg font-bold text-[hsl(131,44%,45%)]">
                        S/. {inmueble.precioBase.toFixed(2)}
                      </div>
                    </div>
                    
                    {inmueble.descripcion && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {inmueble.descripcion}
                      </p>
                    )}

                    {/* Ocupante info */}
                    <div className="mt-auto pt-2">
                      {inquilino ? (
                        <div className="flex items-center gap-2 p-2.5 bg-[hsl(220,20%,97%)] rounded-lg border border-[hsl(220,20%,90%)]">
                          <User className="h-4 w-4 text-[hsl(220,20%,60%)]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ocupado por</p>
                            <p className="text-sm font-semibold text-foreground truncate">{inquilino.nombreCompleto}</p>
                          </div>
                        </div>
                      ) : inmueble.estado === "OCUPADO" ? (
                        <div className="flex items-center gap-2 p-2.5 bg-[hsl(220,20%,97%)] rounded-lg border border-[hsl(220,20%,90%)]">
                          <User className="h-4 w-4 text-[hsl(220,20%,60%)]" />
                          <p className="text-sm text-muted-foreground italic">Inmueble ocupado</p>
                        </div>
                      ) : (
                        <div className="h-[54px]" /> // Placeholder to align buttons if empty
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(inmueble)}
                        className="flex-1 rounded-lg text-xs font-semibold uppercase tracking-wider h-8"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(inmueble.id!)}
                        className="flex-1 rounded-lg text-xs font-semibold uppercase tracking-wider h-8 text-[hsl(4,100%,62%)] border-[hsl(4,100%,70%)] hover:bg-[hsl(4,100%,70%)] hover:text-white"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

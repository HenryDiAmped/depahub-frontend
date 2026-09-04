"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Edit, Trash2, Eye, MapPin } from "lucide-react";
import { propiedadesApi } from "@/lib/api";
import type { Propiedad } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { errorHandlers } from "@/lib/error-handler";

// ── Constantes de color del sistema de diseño ──────────────────────────────
const NAV_BG = "hsl(229,29%,20%)";
const CORAL   = "hsl(4,100%,70%)";
const CORAL_H = "hsl(4,100%,62%)";

export default function PropiedadesPage() {
  const { admin } = useAuth();
  const router = useRouter();
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPropiedad, setEditingPropiedad] = useState<Propiedad | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    distrito: "",
    descripcion: "",
  });

  useEffect(() => {
    const fetchPropiedades = async () => {
      if (!admin?.id) return;

      try {
        const data = await propiedadesApi.getAll(admin.id);
        setPropiedades(data);
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las propiedades",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropiedades();
  }, [admin?.id]);

  const fetchPropiedades = async () => {
    if (!admin?.id) return;

    try {
      const data = await propiedadesApi.getAll(admin.id);
      setPropiedades(data);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las propiedades",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!admin?.id) return;

    try {
      const propiedadData: Propiedad = {
        ...formData,
        administrador: { id: admin.id },
      };

      if (editingPropiedad?.id) {
        await propiedadesApi.update(editingPropiedad.id, {
          ...propiedadData,
          id: editingPropiedad.id,
        });
        toast({
          title: "Propiedad actualizada",
          description: "La propiedad se actualizó correctamente",
        });
      } else {
        await propiedadesApi.create(propiedadData);
        toast({
          title: "Propiedad creada",
          description: "La propiedad se creó correctamente",
        });
      }

      setOpen(false);
      resetForm();
      fetchPropiedades();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la propiedad",
      });
    }
  };

  const handleEdit = (propiedad: Propiedad) => {
    setEditingPropiedad(propiedad);
    setFormData({
      nombre: propiedad.nombre,
      direccion: propiedad.direccion,
      distrito: propiedad.distrito,
      descripcion: propiedad.descripcion,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta propiedad?")) return;

    try {
      await propiedadesApi.delete(id);
      toast({
        title: "Propiedad eliminada",
        description: "La propiedad se eliminó correctamente",
      });
      fetchPropiedades();
    } catch (error) {
      const { title, description } = errorHandlers.delete(error, "la propiedad", "propiedad");
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
      direccion: "",
      distrito: "",
      descripcion: "",
    });
    setEditingPropiedad(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Propiedades
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona tus propiedades registradas
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-[hsl(4,100%,70%)] text-white font-bold uppercase tracking-wider hover:bg-[hsl(4,100%,62%)] shadow-md rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold uppercase tracking-wide">
                {editingPropiedad ? "Editar Propiedad" : "Nueva Propiedad"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos de la propiedad
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
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
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Dirección
                  </Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Distrito
                  </Label>
                  <Input
                    id="distrito"
                    value={formData.distrito}
                    onChange={(e) =>
                      setFormData({ ...formData, distrito: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
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

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando propiedades...
        </div>
      ) : propiedades.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(229,29%,20%)]">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-4 text-base font-bold uppercase tracking-wide">
              No hay propiedades registradas
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comienza agregando tu primera propiedad
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((propiedad) => (
            <Card
              key={propiedad.id}
              className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card header: dark navy */}
              <CardHeader
                className="px-4 py-3 flex flex-row items-center justify-between space-y-0"
                style={{ background: NAV_BG }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(4,100%,70%)]">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-white truncate">
                    {propiedad.nombre}
                  </CardTitle>
                </div>
                {/* Action buttons over dark bg */}
                <div className="flex shrink-0 gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/15 rounded-md"
                    onClick={() =>
                      router.push(`/dashboard/propiedades/${propiedad.id}`)
                    }
                    title="Ver inmuebles"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/15 rounded-md"
                    onClick={() => handleEdit(propiedad)}
                    title="Editar"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/70 hover:text-[hsl(4,100%,70%)] hover:bg-white/15 rounded-md"
                    onClick={() => handleDelete(propiedad.id!)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Card body: white */}
              <CardContent className="bg-white px-4 pt-3 pb-4 space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{propiedad.direccion}</span>
                </div>
                <div className="text-xs font-semibold text-[hsl(131,44%,48%)] uppercase tracking-wide">
                  {propiedad.distrito}
                </div>
                {propiedad.descripcion && (
                  <p className="text-sm text-foreground/70 pt-1 line-clamp-2">
                    {propiedad.descripcion}
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

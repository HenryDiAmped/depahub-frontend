"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Edit, Trash2, Eye } from "lucide-react";
import { propiedadesApi } from "@/lib/api";
import type { Propiedad } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { errorHandlers } from "@/lib/error-handler";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Propiedades</h1>
          <p className="text-muted-foreground">
            Gestiona tus propiedades registradas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPropiedad ? "Editar Propiedad" : "Nueva Propiedad"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos de la propiedad
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData({ ...formData, direccion: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="distrito">Distrito</Label>
                  <Input
                    id="distrito"
                    value={formData.distrito}
                    onChange={(e) =>
                      setFormData({ ...formData, distrito: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
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
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando propiedades...</div>
      ) : propiedades.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">
              No hay propiedades registradas
            </h3>
            <p className="text-muted-foreground">
              Comienza agregando tu primera propiedad
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((propiedad) => (
            <Card key={propiedad.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{propiedad.nombre}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/dashboard/propiedades/${propiedad.id}`)}
                      title="Ver inmuebles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(propiedad)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(propiedad.id!)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>{propiedad.distrito}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {propiedad.direccion}
                </p>
                {propiedad.descripcion && (
                  <p className="text-sm">{propiedad.descripcion}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

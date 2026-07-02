"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft, Plus, Home, Edit, Trash2 } from "lucide-react";
import { propiedadesApi, inmueblesApi } from "@/lib/api";
import type { Propiedad, Inmueble, EstadoInmueble } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { errorHandlers } from "@/lib/error-handler";

export default function PropiedadDetallePage() {
  const params = useParams();
  const router = useRouter();
  const propiedadId = Number(params.id);

  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
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
      const [propiedadData, inmueblesData] = await Promise.all([
        propiedadesApi.getById(propiedadId),
        inmueblesApi.getAll(propiedadId),
      ]);
      setPropiedad(propiedadData);
      setInmuebles(inmueblesData);
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
      const { title, description } = errorHandlers.delete(error, "el inmueble");
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

  const getEstadoBadgeVariant = (estado: EstadoInmueble) => {
    switch (estado) {
      case "DISPONIBLE":
        return "default";
      case "OCUPADO":
        return "secondary";
      case "MANTENIMIENTO":
        return "destructive";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  if (!propiedad) {
    return <div className="text-center py-8">Propiedad no encontrada</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/propiedades")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{propiedad.nombre}</h1>
          <p className="text-muted-foreground">
            {propiedad.direccion}, {propiedad.distrito}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Inmueble
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingInmueble ? "Editar Inmueble" : "Nuevo Inmueble"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del inmueble
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
                    placeholder="Ej: Departamento 301"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="piso">Piso</Label>
                    <Input
                      id="piso"
                      type="number"
                      value={formData.piso}
                      onChange={(e) =>
                        setFormData({ ...formData, piso: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="precioBase">Precio Base (S/.)</Label>
                    <Input
                      id="precioBase"
                      type="number"
                      step="0.01"
                      value={formData.precioBase}
                      onChange={(e) =>
                        setFormData({ ...formData, precioBase: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: EstadoInmueble) =>
                      setFormData({ ...formData, estado: value })
                    }
                  >
                    <SelectTrigger>
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

      <Card>
        <CardHeader>
          <CardTitle>Información de la Propiedad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div>
              <span className="text-muted-foreground">Dirección: </span>
              <span className="font-medium">{propiedad.direccion}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Distrito: </span>
              <span className="font-medium">{propiedad.distrito}</span>
            </div>
            {propiedad.descripcion && (
              <div>
                <span className="text-muted-foreground">Descripción: </span>
                <span className="font-medium">{propiedad.descripcion}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Inmuebles ({inmuebles.length})
        </h2>
        {inmuebles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Home className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">
                No hay inmuebles registrados
              </h3>
              <p className="text-muted-foreground">
                Comienza agregando el primer inmueble
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inmuebles.map((inmueble) => (
              <Card key={inmueble.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{inmueble.nombre}</span>
                    <Badge variant={getEstadoBadgeVariant(inmueble.estado)}>
                      {inmueble.estado}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Piso {inmueble.piso}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      S/. {inmueble.precioBase.toFixed(2)}
                    </div>
                    {inmueble.descripcion && (
                      <p className="text-sm text-muted-foreground">
                        {inmueble.descripcion}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(inmueble)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(inmueble.id!)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

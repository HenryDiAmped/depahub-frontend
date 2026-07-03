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
import { Plus, Users, Edit, UserX } from "lucide-react";
import { inquilinosApi, inmueblesApi } from "@/lib/api";
import type { Inquilino, Inmueble, EstadoInquilino } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export default function InquilinosPage() {
  const { admin } = useAuth();
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingInquilino, setEditingInquilino] = useState<Inquilino | null>(
    null
  );
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    dni: "",
    telefono: "",
    email: "",
    fechaNacimiento: "",
    estado: "ACTIVO" as EstadoInquilino,
    inmuebleId: "",
  });

  useEffect(() => {
    fetchData();
  }, [admin]);

  const fetchData = async () => {
    try {
      const [inquilinosData, inmueblesData] = await Promise.all([
        inquilinosApi.getAll(),
        inmueblesApi.getAll(),
      ]);
      setInquilinos(inquilinosData);
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
      const inquilinoData: Inquilino = {
        nombreCompleto: formData.nombreCompleto,
        dni: formData.dni,
        telefono: formData.telefono,
        email: formData.email || "", // Email opcional
        fechaNacimiento: formData.fechaNacimiento,
        estado: formData.estado,
        inmueble: formData.inmuebleId ? { id: Number(formData.inmuebleId) } : undefined,
      };

      const inmuebleIdActual = Number(formData.inmuebleId);
      const inmuebleIdAnterior = editingInquilino?.inmueble?.id;

      if (editingInquilino?.id) {
        await inquilinosApi.update(editingInquilino.id, {
          ...inquilinoData,
          id: editingInquilino.id,
        });
        
        // Si cambió de inmueble, liberar el anterior
        if (inmuebleIdAnterior && inmuebleIdAnterior !== inmuebleIdActual) {
          const inmuebleAnterior = inmuebles.find(i => i.id === inmuebleIdAnterior);
          if (inmuebleAnterior) {
            await inmueblesApi.update(inmuebleIdAnterior, {
              ...inmuebleAnterior,
              estado: "DISPONIBLE",
            });
          }
        }
        
        toast({
          title: "Inquilino actualizado",
          description: "El inquilino se actualizó correctamente",
        });
      } else {
        await inquilinosApi.create(inquilinoData);
        toast({
          title: "Inquilino creado",
          description: "El inquilino se creó correctamente",
        });
      }

      // Si se asignó un inmueble, marcarlo como OCUPADO
      if (inmuebleIdActual) {
        const inmueble = inmuebles.find(i => i.id === inmuebleIdActual);
        if (inmueble) {
          await inmueblesApi.update(inmuebleIdActual, {
            ...inmueble,
            estado: "OCUPADO",
          });
        }
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el inquilino",
      });
    }
  };

  const handleEdit = (inquilino: Inquilino) => {
    setEditingInquilino(inquilino);
    setFormData({
      nombreCompleto: inquilino.nombreCompleto,
      dni: inquilino.dni,
      telefono: inquilino.telefono,
      email: inquilino.email || "",
      fechaNacimiento: inquilino.fechaNacimiento,
      estado: inquilino.estado,
      inmuebleId: inquilino.inmueble?.id?.toString() || "",
    });
    setOpen(true);
  };

  const handleRetirar = async (inquilino: Inquilino) => {
    if (!confirm(`¿Estás seguro de retirar a ${inquilino.nombreCompleto}?`))
      return;

    try {
      const inmuebleId = inquilino.inmueble?.id;
      
      // Retirar inquilino y desasociar del inmueble
      await inquilinosApi.update(inquilino.id!, {
        ...inquilino,
        estado: "RETIRADO",
        inmueble: undefined, // Desasociar del inmueble
      });

      // Si tenía un inmueble asignado, marcarlo como DISPONIBLE
      if (inmuebleId) {
        const inmueble = inmuebles.find(i => i.id === inmuebleId);
        if (inmueble) {
          await inmueblesApi.update(inmuebleId, {
            ...inmueble,
            estado: "DISPONIBLE",
          });
        }
      }

      toast({
        title: "Inquilino retirado",
        description: "El inquilino se marcó como retirado y se liberó el inmueble",
      });
      fetchData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo retirar el inquilino",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombreCompleto: "",
      dni: "",
      telefono: "",
      email: "",
      fechaNacimiento: "",
      estado: "ACTIVO" as EstadoInquilino,
      inmuebleId: "",
    });
    setEditingInquilino(null);
  };

  const inmueblesDisponibles = inmuebles.filter((i) => i.estado === "DISPONIBLE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inquilinos</h1>
          <p className="text-muted-foreground">Gestiona los inquilinos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Inquilino
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingInquilino ? "Editar Inquilino" : "Nuevo Inquilino"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del inquilino
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                  <Input
                    id="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={(e) =>
                      setFormData({ ...formData, nombreCompleto: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fechaNacimiento: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="inmueble">Inmueble</Label>
                  <Select
                    value={formData.inmuebleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, inmuebleId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar inmueble" />
                    </SelectTrigger>
                    <SelectContent>
                      {inmueblesDisponibles.map((inmueble) => (
                        <SelectItem
                          key={inmueble.id}
                          value={inmueble.id!.toString()}
                        >
                          {inmueble.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        <div className="text-center py-8">Cargando inquilinos...</div>
      ) : inquilinos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">
              No hay inquilinos registrados
            </h3>
            <p className="text-muted-foreground">
              Comienza agregando tu primer inquilino
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {inquilinos.map((inquilino) => (
            <Card key={inquilino.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{inquilino.nombreCompleto}</span>
                  <Badge
                    variant={
                      inquilino.estado === "ACTIVO" ? "default" : "secondary"
                    }
                  >
                    {inquilino.estado}
                  </Badge>
                </CardTitle>
                <CardDescription>DNI: {inquilino.dni}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {inquilino.email && <p>📧 {inquilino.email}</p>}
                  <p>📞 {inquilino.telefono}</p>
                  <p>🎂 {inquilino.fechaNacimiento}</p>
                  {inquilino.inmueble?.id && (
                    <p className="font-medium text-primary">
                      🏠 {inmuebles.find(i => i.id === inquilino.inmueble?.id)?.nombre || `Inmueble #${inquilino.inmueble.id}`}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(inquilino)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  {inquilino.estado === "ACTIVO" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetirar(inquilino)}
                    >
                      <UserX className="mr-1 h-3 w-3" />
                      Retirar
                    </Button>
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

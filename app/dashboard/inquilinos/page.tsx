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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, Edit, UserX, Phone, Mail, Home } from "lucide-react";
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
    if (!admin?.id) return;

    try {
      const [inquilinosData, inmueblesData] = await Promise.all([
        inquilinosApi.getAll(),
        inmueblesApi.getAll(),
      ]);

      const inmueblesDelAdministrador = inmueblesData.filter(
        (inmueble) => inmueble.propiedad?.administrador?.id === admin.id
      );
      const inquilinosDelAdministrador = inquilinosData.filter(
        (inquilino) =>
          inquilino.inmueble?.propiedad?.administrador?.id === admin.id
      );

      setInquilinos(inquilinosDelAdministrador);
      setInmuebles(inmueblesDelAdministrador);
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
        email: formData.email || "",
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

      await inquilinosApi.update(inquilino.id!, {
        ...inquilino,
        estado: "RETIRADO",
        inmueble: undefined,
      });

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

  const inmueblesParaSeleccion = inmuebles.filter(
    (inmueble) =>
      inmueble.estado === "DISPONIBLE" ||
      inmueble.id === editingInquilino?.inmueble?.id
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Inquilinos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona los inquilinos
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-[hsl(4,100%,70%)] text-white font-bold uppercase tracking-wider hover:bg-[hsl(4,100%,62%)] shadow-md rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Inquilino
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-bold uppercase tracking-wide">
                {editingInquilino ? "Editar Inquilino" : "Nuevo Inquilino"}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del inquilino
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Nombre Completo
                  </Label>
                  <Input
                    id="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={(e) =>
                      setFormData({ ...formData, nombreCompleto: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    DNI
                  </Label>
                  <Input
                    id="dni"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    required
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Email (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Fecha de Nacimiento
                  </Label>
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
                    className="h-10 rounded-lg mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Inmueble
                  </Label>
                  <Select
                    value={formData.inmuebleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, inmuebleId: value })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-lg mt-1">
                      <SelectValue placeholder="Seleccionar inmueble" />
                    </SelectTrigger>
                    <SelectContent>
                      {inmueblesParaSeleccion.map((inmueble) => (
                        <SelectItem
                          key={inmueble.id}
                          value={inmueble.id!.toString()}
                        >
                          <span className="flex w-full items-center justify-between gap-6">
                            <span>{inmueble.nombre}</span>
                            <span className="text-muted-foreground">
                              {inmueble.propiedad?.nombre ?? "Sin propiedad"}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          Cargando inquilinos...
        </div>
      ) : inquilinos.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(229,29%,20%)]">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="mt-4 text-base font-bold uppercase tracking-wide">
              No hay inquilinos registrados
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comienza agregando tu primer inquilino
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {inquilinos.map((inquilino) => {
            const isActivo = inquilino.estado === "ACTIVO";
            return (
              <Card
                key={inquilino.id}
                className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card header: dark navy */}
                <CardHeader
                  className="px-4 py-3 flex flex-row items-center justify-between space-y-0"
                  style={{ background: "hsl(229,29%,20%)" }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isActivo ? "bg-[hsl(131,44%,62%)]" : "bg-[hsl(229,29%,35%)]"}`}>
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-white truncate">
                      {inquilino.nombreCompleto}
                    </CardTitle>
                  </div>
                  <span
                    className={`shrink-0 ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      isActivo
                        ? "bg-[hsl(131,44%,62%)] text-white"
                        : "bg-[hsl(229,29%,35%)] text-white/70"
                    }`}
                  >
                    {inquilino.estado}
                  </span>
                </CardHeader>

                {/* Card body: white */}
                <CardContent className="bg-white px-4 pt-3 pb-4 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    DNI: {inquilino.dni}
                  </p>
                  {inquilino.email && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{inquilino.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{inquilino.telefono}</span>
                  </div>
                  {inquilino.inmueble?.id && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(131,44%,48%)]">
                      <Home className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {inmuebles.find(i => i.id === inquilino.inmueble?.id)?.nombre ||
                          `Inmueble #${inquilino.inmueble.id}`}
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(inquilino)}
                      className="rounded-lg text-xs font-semibold uppercase tracking-wider h-8"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    {isActivo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetirar(inquilino)}
                        className="rounded-lg text-xs font-semibold uppercase tracking-wider h-8 text-[hsl(4,100%,62%)] border-[hsl(4,100%,70%)] hover:bg-[hsl(4,100%,70%)] hover:text-white"
                      >
                        <UserX className="mr-1 h-3 w-3" />
                        Retirar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

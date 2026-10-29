"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CharacterCounter } from "@/components/ui/character-counter";
import { evaluatePassword } from "@/lib/password";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    dni: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const passwordEvaluation = evaluatePassword(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const valueWithoutLetters = name === "dni" || name === "telefono"
      ? value.replace(/\D/g, "")
      : value;
    setFormData({ ...formData, [name]: valueWithoutLetters });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!passwordEvaluation.isValid) {
      toast({
        variant: "destructive",
        title: "Contraseña insuficiente",
        description: "Usa al menos 9 caracteres, una letra mayúscula y un número.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Las contraseñas no coinciden",
        description: "Escribe la misma contraseña en ambos campos.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      await register({
        nombreCompleto: formData.nombreCompleto,
        dni: formData.dni,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
        fechaRegistro: today,
        utilidadTotal: 0,
      });
    } catch {
      // AuthProvider ya informa un mensaje claro mediante una notificación.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(229,29%,17%)] p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
        <CardHeader className="bg-[hsl(229,29%,20%)] px-6 py-6 space-y-1">
          <div className="flex items-center justify-center mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(4,100%,70%)]">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl text-center font-bold uppercase tracking-widest text-white">
            Crear Cuenta en DepaHub
          </CardTitle>
          <CardDescription className="text-center text-[hsl(220,20%,65%)]">
            Completa el formulario para registrarte
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="bg-white space-y-4 px-6 pt-6">
            <div className="space-y-1.5">
              <Label htmlFor="nombreCompleto" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Nombre Completo
              </Label>
              <Input
                id="nombreCompleto"
                name="nombreCompleto"
                type="text"
                placeholder="Juan Pérez"
                value={formData.nombreCompleto}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-10 rounded-lg border-border focus-visible:ring-[hsl(4,100%,70%)]"
              />
              <CharacterCounter value={formData.nombreCompleto} limit={45} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dni" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  DNI
                </Label>
                <Input
                  id="dni"
                  name="dni"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="12345678"
                  value={formData.dni}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-10 rounded-lg border-border focus-visible:ring-[hsl(4,100%,70%)]"
                />
                <CharacterCounter value={formData.dni} limit={8} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefono" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="987654321"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-10 rounded-lg border-border focus-visible:ring-[hsl(4,100%,70%)]"
                />
                <CharacterCounter value={formData.telefono} limit={9} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-10 rounded-lg border-border focus-visible:ring-[hsl(4,100%,70%)]"
              />
              <CharacterCounter value={formData.email} limit={45} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={9}
                disabled={isLoading}
                className="h-10 rounded-lg border-border focus-visible:ring-[hsl(4,100%,70%)]"
              />
              <CharacterCounter value={formData.password} limit={100} />
              <div className="rounded-md bg-muted px-3 py-2 text-xs" aria-live="polite">
                <p className={passwordEvaluation.strength === "débil" ? "font-semibold text-destructive" : "font-semibold text-foreground"}>
                  Seguridad: {passwordEvaluation.strength}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Mínimo 9 caracteres, una mayúscula y un número.
                </p>
                {!passwordEvaluation.hasMinimumLength && formData.password && <p className="mt-1 text-destructive">Faltan {9 - formData.password.length} caracteres.</p>}
                {!passwordEvaluation.hasUppercase && formData.password && <p className="mt-1 text-destructive">Agrega al menos una letra mayúscula.</p>}
                {!passwordEvaluation.hasNumber && formData.password && <p className="mt-1 text-destructive">Agrega al menos un número.</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-10 rounded-lg border-border focus-visible:ring-[hsl(4,100%,70%)]"
              />
              <CharacterCounter value={formData.confirmPassword} limit={100} />
            </div>
          </CardContent>
          <CardFooter className="bg-white flex flex-col space-y-3 px-6 pb-6 pt-2">
            <Button
              type="submit"
              className="w-full h-10 rounded-lg bg-[hsl(4,100%,70%)] text-white font-bold uppercase tracking-wider hover:bg-[hsl(4,100%,62%)] shadow-md"
              disabled={isLoading || !passwordEvaluation.isValid}
            >
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-[hsl(131,44%,50%)] font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

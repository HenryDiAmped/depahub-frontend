"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowUpCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cuentasApi, inquilinosApi } from "@/lib/api";
import type { Cuenta, Inquilino } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

export default function InquilinoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const inquilinoId = Number(params.id);
  const [inquilino, setInquilino] = useState<Inquilino | null>(null);
  const [cuentasPendientes, setCuentasPendientes] = useState<Cuenta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!Number.isInteger(inquilinoId) || inquilinoId <= 0) {
      setIsLoading(false);
      return;
    }

    const cargarDetalle = async () => {
      setIsLoading(true);
      try {
        const [inquilinoData, cuentasData] = await Promise.all([
          inquilinosApi.getById(inquilinoId),
          cuentasApi.getAll(undefined, inquilinoId),
        ]);
        setInquilino(inquilinoData);
        setCuentasPendientes(
          cuentasData.filter((cuenta) => cuenta.estado === "PENDIENTE")
        );
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los pagos del inquilino.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarDetalle();
  }, [inquilinoId]);

  const totalPendiente = cuentasPendientes.reduce(
    (total, cuenta) => total + cuenta.importe,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/inquilinos")}
          className="h-10 w-10 rounded-full hover:bg-[hsl(229,29%,90%)]"
          aria-label="Volver a inquilinos"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            Información del inquilino
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {inquilino?.nombreCompleto ?? `Inquilino #${params.id}`}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader
          className="flex flex-row items-center justify-between gap-3 space-y-0 px-5 py-4"
          style={{ background: "hsl(229,29%,20%)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(131,44%,62%)]">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">
              Pagos pendientes
            </CardTitle>
          </div>
          {!isLoading && (
            <span className="text-sm font-bold text-white">
              S/. {totalPendiente.toFixed(2)}
            </span>
          )}
        </CardHeader>

        <CardContent className="bg-white p-0">
          {isLoading ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Cargando pagos pendientes...
            </p>
          ) : cuentasPendientes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(131,44%,95%)]">
                <CheckCircle2 className="h-7 w-7 text-[hsl(131,44%,42%)]" />
              </div>
              <p className="mt-4 text-base font-medium text-foreground">
                No tiene pagos pendientes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cuentasPendientes.map((cuenta) => {
                const esPorCobrar = cuenta.tipo === "POR_COBRAR";
                return (
                  <div
                    key={cuenta.id}
                    className="flex items-start justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          esPorCobrar
                            ? "bg-[hsl(131,44%,62%)]"
                            : "bg-[hsl(4,100%,70%)]"
                        }`}
                      >
                        {esPorCobrar ? (
                          <ArrowUpCircle className="h-4 w-4 text-white" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{cuenta.concepto}</p>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {cuenta.fechaVencimiento
                              ? `Vence: ${cuenta.fechaVencimiento}`
                              : `Emitida: ${cuenta.fechaEmitida}`}
                          </span>
                          {cuenta.contrato?.id && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              Contrato #{cuenta.contrato.id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-base font-bold ${
                          esPorCobrar
                            ? "text-[hsl(131,44%,42%)]"
                            : "text-[hsl(4,100%,55%)]"
                        }`}
                      >
                        S/. {cuenta.importe.toFixed(2)}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {cuenta.tipo.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

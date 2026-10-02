"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InquilinoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

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
            Inquilino #{params.id}
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader
          className="flex flex-row items-center gap-3 space-y-0 px-5 py-4"
          style={{ background: "hsl(229,29%,20%)" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(131,44%,62%)]">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">
            Pagos del inquilino
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white px-5 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(229,29%,95%)]">
            <Users className="h-7 w-7 text-[hsl(229,29%,40%)]" />
          </div>
          <p className="mt-4 text-base font-medium text-foreground">
            Aquí se mostrará información de pagos del inquilino.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

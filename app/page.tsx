"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const router = useRouter();
  const { admin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (admin) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [admin, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Cargando...</h1>
      </div>
    </div>
  );
}

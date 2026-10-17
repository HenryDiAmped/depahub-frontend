import { describe, expect, it } from "vitest";
import { nombreInquilinoDeCuenta, totalesCuentasPendientes } from "./cuentas";
import type { Cuenta, Inquilino } from "./types";

function cuenta(parcial: Partial<Cuenta> & Pick<Cuenta, "id" | "tipo" | "estado" | "importe">): Cuenta {
  return {
    concepto: "Mensualidad",
    fechaEmitida: "2026-09-01",
    ...parcial,
  };
}

describe("totalesCuentasPendientes", () => {
  it("suma solo cuentas pendientes y separa por cobrar y por pagar", () => {
    const resultado = totalesCuentasPendientes([
      cuenta({ id: 1, tipo: "POR_COBRAR", estado: "PENDIENTE", importe: 350 }),
      cuenta({ id: 2, tipo: "POR_COBRAR", estado: "SALDADA", importe: 400 }),
      cuenta({ id: 3, tipo: "POR_PAGAR", estado: "PENDIENTE", importe: 80 }),
      cuenta({ id: 4, tipo: "POR_PAGAR", estado: "PENDIENTE", importe: 20 }),
    ]);

    expect(resultado.cuentasPendientes).toHaveLength(3);
    expect(resultado.totalPorCobrar).toBe(350);
    expect(resultado.totalPorPagar).toBe(100);
  });
});

describe("nombreInquilinoDeCuenta", () => {
  const catalogo: Inquilino[] = [
    {
      id: 7,
      nombreCompleto: "María Torres",
      dni: "71794266",
      telefono: "999999999",
      fechaNacimiento: "1998-09-01",
      estado: "ACTIVO",
    },
  ];

  it("usa el nombre embebido en la cuenta", () => {
    expect(
      nombreInquilinoDeCuenta(
        cuenta({
          id: 1,
          tipo: "POR_COBRAR",
          estado: "PENDIENTE",
          importe: 350,
          inquilino: { id: 7, nombreCompleto: "Nombre en cuenta" },
        }),
        catalogo
      )
    ).toBe("Nombre en cuenta");
  });

  it("busca el nombre en el catálogo si la cuenta solo trae el id", () => {
    expect(
      nombreInquilinoDeCuenta(
        cuenta({
          id: 1,
          tipo: "POR_COBRAR",
          estado: "PENDIENTE",
          importe: 350,
          inquilino: { id: 7 },
        }),
        catalogo
      )
    ).toBe("María Torres");
  });

  it("usa un texto por defecto si no hay inquilino", () => {
    expect(
      nombreInquilinoDeCuenta(
        cuenta({ id: 1, tipo: "POR_COBRAR", estado: "PENDIENTE", importe: 350 }),
        catalogo
      )
    ).toBe("Sin inquilino asignado");
  });
});

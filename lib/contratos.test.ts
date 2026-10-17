import { describe, expect, it } from "vitest";
import {
  calcularPlanCuotas,
  esFrecuenciaCompatible,
  fechaComoTexto,
  fechaLocal,
  fechaMinimaFinContrato,
  sumarMeses,
} from "./contratos";

describe("fechaLocal y fechaComoTexto", () => {
  it("interpreta YYYY-MM-DD como fecha local", () => {
    const fecha = fechaLocal("2026-09-04");
    expect(fecha.getFullYear()).toBe(2026);
    expect(fecha.getMonth()).toBe(8);
    expect(fecha.getDate()).toBe(4);
  });

  it("formatea una fecha a YYYY-MM-DD", () => {
    expect(fechaComoTexto(new Date(2026, 8, 4))).toBe("2026-09-04");
  });
});

describe("sumarMeses", () => {
  it("avanza meses y ajusta el día si el mes destino es más corto", () => {
    expect(fechaComoTexto(sumarMeses(new Date(2026, 0, 31), 1))).toBe("2026-02-28");
  });
});

describe("esFrecuenciaCompatible", () => {
  it("acepta un contrato de al menos un mes con frecuencia 1", () => {
    expect(esFrecuenciaCompatible("2026-09-01", "2026-09-30", 1)).toBe(true);
  });

  it("rechaza si la fecha fin no cubre el primer período", () => {
    expect(esFrecuenciaCompatible("2026-09-01", "2026-09-29", 1)).toBe(false);
  });

  it("rechaza fechas vacías, inválidas o frecuencia no positiva", () => {
    expect(esFrecuenciaCompatible("", "2026-09-30", 1)).toBe(false);
    expect(esFrecuenciaCompatible("2026-09-01", "2026-09-30", 0)).toBe(false);
    expect(esFrecuenciaCompatible("fecha", "2026-09-30", 1)).toBe(false);
  });
});

describe("fechaMinimaFinContrato", () => {
  it("devuelve el último día del primer mes de contrato", () => {
    expect(fechaMinimaFinContrato("2026-09-01")).toBe("2026-09-30");
  });
});

describe("calcularPlanCuotas", () => {
  it("calcula 12 cuotas mensuales en un año exacto", () => {
    expect(calcularPlanCuotas("2026-09-01", "2027-08-31", 1)).toEqual({
      cuotasCompletas: 12,
      tieneProrrateo: false,
      numeroCuotas: 12,
    });
  });

  it("calcula 4 cuotas trimestrales en un año exacto", () => {
    expect(calcularPlanCuotas("2026-01-01", "2026-12-31", 3)).toEqual({
      cuotasCompletas: 4,
      tieneProrrateo: false,
      numeroCuotas: 4,
    });
  });

  it("agrega una cuota de prorrateo si queda un remanente", () => {
    expect(calcularPlanCuotas("2026-01-15", "2026-03-01", 1)).toEqual({
      cuotasCompletas: 1,
      tieneProrrateo: true,
      numeroCuotas: 2,
    });
  });

  it("devuelve null si la frecuencia no cabe en el contrato", () => {
    expect(calcularPlanCuotas("2026-09-01", "2026-09-29", 1)).toBeNull();
  });
});

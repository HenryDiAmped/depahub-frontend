import { describe, expect, it } from "vitest";
import {
  balancesParaGrafico,
  calcularMetricasDashboard,
  contarContratosPorEstado,
  contarInquilinosPorEstado,
  formatMoney,
  inmueblesPorPropiedad,
  montosCuentasPorTipo,
  ocupacionPorPropiedad,
  propiedadesPorDistrito,
  rentaPorPropiedad,
} from "./dashboard-metrics";
import type {
  BalanceMensual,
  Contrato,
  Cuenta,
  Inmueble,
  Inquilino,
  Propiedad,
} from "./types";

function inmueble(
  parcial: Partial<Inmueble> & Pick<Inmueble, "id" | "estado" | "precioBase">
): Inmueble {
  return {
    nombre: String(parcial.id),
    piso: 1,
    descripcion: "",
    ...parcial,
  };
}

function contrato(
  parcial: Partial<Contrato> & Pick<Contrato, "id" | "estado" | "montoAlquiler" | "garantia">
): Contrato {
  return {
    fechaInicio: "2026-09-01",
    fechaFin: "2027-08-31",
    frecuencia: 1,
    numeroCuotas: 12,
    condiciones: "",
    fechaRegistro: "2026-09-01",
    ...parcial,
  };
}

function cuenta(
  parcial: Partial<Cuenta> & Pick<Cuenta, "id" | "tipo" | "estado" | "importe">
): Cuenta {
  return {
    concepto: "Pago",
    fechaEmitida: "2026-09-01",
    ...parcial,
  };
}

describe("formatMoney", () => {
  it("formatea soles con dos decimales", () => {
    expect(formatMoney(350)).toMatch(/^S\/\. /);
    expect(formatMoney(350)).toContain("350");
    expect(formatMoney(350)).toContain("00");
  });
});

describe("calcularMetricasDashboard", () => {
  const inmuebles: Inmueble[] = [
    inmueble({ id: 1, estado: "OCUPADO", precioBase: 350, propiedad: { id: 1 } }),
    inmueble({ id: 2, estado: "DISPONIBLE", precioBase: 400, propiedad: { id: 1 } }),
    inmueble({ id: 3, estado: "MANTENIMIENTO", precioBase: 200, propiedad: { id: 1 } }),
  ];
  const contratos: Contrato[] = [
    contrato({ id: 1, estado: "ACTIVO", montoAlquiler: 300, garantia: 300 }),
    contrato({ id: 2, estado: "ACTIVO", montoAlquiler: 500, garantia: 500 }),
    contrato({ id: 3, estado: "FINALIZADO", montoAlquiler: 900, garantia: 900 }),
  ];
  const cuentas: Cuenta[] = [
    cuenta({ id: 1, tipo: "POR_COBRAR", estado: "PENDIENTE", importe: 350, fechaVencimiento: "2026-09-01" }),
    cuenta({ id: 2, tipo: "POR_COBRAR", estado: "SALDADA", importe: 800 }),
    cuenta({ id: 3, tipo: "POR_PAGAR", estado: "PENDIENTE", importe: 50, fechaVencimiento: "2026-10-20" }),
    cuenta({ id: 4, tipo: "POR_COBRAR", estado: "PENDIENTE", importe: 100 }),
  ];
  const balances: BalanceMensual[] = [
    {
      id: 1,
      mes: 9,
      anio: 2026,
      totalIngresos: 700,
      totalEgresos: 100,
      utilidad: 600,
      fechaGeneracion: "2026-09-04",
    },
    {
      id: 2,
      mes: 8,
      anio: 2026,
      totalIngresos: 200,
      totalEgresos: 50,
      fechaGeneracion: "2026-08-31",
    },
  ];
  const ahora = new Date(2026, 9, 16);

  it("calcula ocupación, rentas, cuentas y balances", () => {
    const metrics = calcularMetricasDashboard(
      inmuebles,
      contratos,
      cuentas,
      balances,
      ahora
    );

    expect(metrics.ocupados).toBe(1);
    expect(metrics.disponibles).toBe(1);
    expect(metrics.mantenimiento).toBe(1);
    expect(metrics.ocupacion).toBe(33);
    expect(metrics.contratosActivos).toBe(2);
    expect(metrics.rentaPromedio).toBe(400);
    expect(metrics.porCobrar).toBe(450);
    expect(metrics.porPagar).toBe(50);
    expect(metrics.ingresos).toBe(900);
    expect(metrics.egresos).toBe(150);
    expect(metrics.utilidad).toBe(600);
    expect(metrics.rentaOcupada).toBe(350);
    expect(metrics.cuentasVencidas).toBe(1);
    expect(metrics.garantiaTotal).toBe(800);
  });

  it("devuelve ocupación 0 y renta promedio 0 cuando no hay datos", () => {
    const metrics = calcularMetricasDashboard([], [], [], [], ahora);
    expect(metrics.ocupacion).toBe(0);
    expect(metrics.rentaPromedio).toBe(0);
    expect(metrics.cuentasVencidas).toBe(0);
    expect(metrics.utilidad).toBe(0);
  });
});

describe("agregados del dashboard", () => {
  const propiedades: Propiedad[] = [
    {
      id: 1,
      nombre: "Edificio Central",
      direccion: "Av. 1",
      distrito: "Chorrillos",
      descripcion: "",
    },
    {
      id: 2,
      nombre: "Torre Sur",
      direccion: "Av. 2",
      distrito: "  ",
      descripcion: "",
    },
  ];
  const inmuebles: Inmueble[] = [
    inmueble({ id: 1, estado: "OCUPADO", precioBase: 350, propiedad: { id: 1 } }),
    inmueble({ id: 2, estado: "DISPONIBLE", precioBase: 400, propiedad: { id: 1 } }),
    inmueble({ id: 3, estado: "MANTENIMIENTO", precioBase: 200, propiedad: { id: 2 } }),
  ];

  it("ordena balances y deja los últimos 12 períodos", () => {
    const grafico = balancesParaGrafico([
      {
        id: 2,
        mes: 2,
        anio: 2026,
        totalIngresos: 20,
        totalEgresos: 5,
        utilidad: 15,
        fechaGeneracion: "2026-02-01",
      },
      {
        id: 1,
        mes: 1,
        anio: 2026,
        totalIngresos: 10,
        totalEgresos: 1,
        utilidad: 9,
        fechaGeneracion: "2026-01-01",
      },
    ]);

    expect(grafico.map((item) => item.label)).toEqual(["Ene 26", "Feb 26"]);
    expect(grafico[0].ingresos).toBe(10);
  });

  it("cuenta contratos e inquilinos por estado", () => {
    expect(
      contarContratosPorEstado([
        contrato({ id: 1, estado: "ACTIVO", montoAlquiler: 1, garantia: 1 }),
        contrato({ id: 2, estado: "FINALIZADO", montoAlquiler: 1, garantia: 1 }),
        contrato({ id: 3, estado: "CANCELADO", montoAlquiler: 1, garantia: 1 }),
      ])
    ).toEqual({ activos: 1, finalizados: 1, cancelados: 1 });

    const inquilinos: Inquilino[] = [
      {
        id: 1,
        nombreCompleto: "A",
        dni: "1",
        telefono: "1",
        fechaNacimiento: "1990-01-01",
        estado: "ACTIVO",
      },
      {
        id: 2,
        nombreCompleto: "B",
        dni: "2",
        telefono: "2",
        fechaNacimiento: "1990-01-01",
        estado: "RETIRADO",
      },
    ];
    expect(contarInquilinosPorEstado(inquilinos)).toEqual({
      activos: 1,
      retirados: 1,
    });
  });

  it("agrupa inmuebles, renta y ocupación por propiedad", () => {
    expect(inmueblesPorPropiedad(propiedades, inmuebles)).toEqual([
      { name: "Edificio Central", value: 2 },
      { name: "Torre Sur", value: 1 },
    ]);
    expect(rentaPorPropiedad(propiedades, inmuebles)).toEqual([
      { name: "Edificio Central", value: 750 },
      { name: "Torre Sur", value: 200 },
    ]);
    expect(ocupacionPorPropiedad(propiedades, inmuebles)).toEqual([
      { label: "Edificio Central", ocupados: 1, disponibles: 1, mantenimiento: 0 },
      { label: "Torre Sur", ocupados: 0, disponibles: 0, mantenimiento: 1 },
    ]);
  });

  it("separa montos de cuentas pendientes y saldadas", () => {
    expect(
      montosCuentasPorTipo([
        cuenta({ id: 1, tipo: "POR_COBRAR", estado: "PENDIENTE", importe: 350 }),
        cuenta({ id: 2, tipo: "POR_PAGAR", estado: "PENDIENTE", importe: 50 }),
        cuenta({ id: 3, tipo: "POR_COBRAR", estado: "SALDADA", importe: 100 }),
      ])
    ).toEqual({ porCobrar: 350, porPagar: 50, saldadas: 100 });
  });

  it("agrupa propiedades por distrito y usa Sin distrito si falta", () => {
    expect(propiedadesPorDistrito(propiedades)).toEqual([
      { name: "Chorrillos", value: 1 },
      { name: "Sin distrito", value: 1 },
    ]);
  });
});

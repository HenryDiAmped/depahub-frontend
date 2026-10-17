import type {
  BalanceMensual,
  Contrato,
  Cuenta,
  Inmueble,
  Inquilino,
  Propiedad,
} from "./types";

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function formatMoney(value: number) {
  return `S/. ${value.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calcularMetricasDashboard(
  inmuebles: Inmueble[],
  contratos: Contrato[],
  cuentas: Cuenta[],
  balances: BalanceMensual[],
  ahora: Date = new Date()
) {
  const ocupados = inmuebles.filter((item) => item.estado === "OCUPADO").length;
  const disponibles = inmuebles.filter((item) => item.estado === "DISPONIBLE").length;
  const mantenimiento = inmuebles.filter(
    (item) => item.estado === "MANTENIMIENTO"
  ).length;
  const ocupacion =
    inmuebles.length === 0 ? 0 : Math.round((ocupados / inmuebles.length) * 100);

  const contratosActivos = contratos.filter((item) => item.estado === "ACTIVO");
  const rentaPromedio =
    contratosActivos.length === 0
      ? 0
      : contratosActivos.reduce((sum, item) => sum + (item.montoAlquiler || 0), 0) /
        contratosActivos.length;

  const porCobrar = cuentas
    .filter((item) => item.tipo === "POR_COBRAR" && item.estado === "PENDIENTE")
    .reduce((sum, item) => sum + (item.importe || 0), 0);
  const porPagar = cuentas
    .filter((item) => item.tipo === "POR_PAGAR" && item.estado === "PENDIENTE")
    .reduce((sum, item) => sum + (item.importe || 0), 0);

  const ingresos = balances.reduce(
    (sum, item) => sum + (item.totalIngresos || 0),
    0
  );
  const egresos = balances.reduce(
    (sum, item) => sum + (item.totalEgresos || 0),
    0
  );
  const utilidad = balances.reduce(
    (sum, item) => sum + (item.utilidad || 0),
    0
  );
  const rentaOcupada = inmuebles
    .filter((item) => item.estado === "OCUPADO")
    .reduce((sum, item) => sum + (item.precioBase || 0), 0);

  const hoy = new Date(ahora);
  hoy.setHours(0, 0, 0, 0);
  const cuentasVencidas = cuentas.filter((item) => {
    if (item.estado !== "PENDIENTE" || !item.fechaVencimiento) return false;
    const vencimiento = new Date(item.fechaVencimiento);
    return !Number.isNaN(vencimiento.getTime()) && vencimiento < hoy;
  }).length;
  const garantiaTotal = contratosActivos.reduce(
    (sum, item) => sum + (item.garantia || 0),
    0
  );

  return {
    ocupados,
    disponibles,
    mantenimiento,
    ocupacion,
    contratosActivos: contratosActivos.length,
    rentaPromedio,
    porCobrar,
    porPagar,
    ingresos,
    egresos,
    utilidad,
    rentaOcupada,
    cuentasVencidas,
    garantiaTotal,
  };
}

export function balancesParaGrafico(balances: BalanceMensual[]) {
  return [...balances]
    .sort((a, b) => a.anio - b.anio || a.mes - b.mes)
    .slice(-12)
    .map((item) => ({
      label: `${MESES_CORTOS[item.mes - 1]} ${String(item.anio).slice(-2)}`,
      ingresos: item.totalIngresos || 0,
      egresos: item.totalEgresos || 0,
      utilidad: item.utilidad || 0,
    }));
}

export function contarContratosPorEstado(contratos: Contrato[]) {
  return {
    activos: contratos.filter((item) => item.estado === "ACTIVO").length,
    finalizados: contratos.filter((item) => item.estado === "FINALIZADO").length,
    cancelados: contratos.filter((item) => item.estado === "CANCELADO").length,
  };
}

export function inmueblesPorPropiedad(
  propiedades: Propiedad[],
  inmuebles: Inmueble[]
) {
  return propiedades.map((propiedad) => ({
    name: propiedad.nombre,
    value: inmuebles.filter((item) => item.propiedad?.id === propiedad.id).length,
  }));
}

export function rentaPorPropiedad(
  propiedades: Propiedad[],
  inmuebles: Inmueble[]
) {
  return propiedades.map((propiedad) => ({
    name: propiedad.nombre,
    value: inmuebles
      .filter((item) => item.propiedad?.id === propiedad.id)
      .reduce((sum, item) => sum + (item.precioBase || 0), 0),
  }));
}

export function montosCuentasPorTipo(cuentas: Cuenta[]) {
  return {
    porCobrar: cuentas
      .filter((item) => item.tipo === "POR_COBRAR" && item.estado === "PENDIENTE")
      .reduce((sum, item) => sum + (item.importe || 0), 0),
    porPagar: cuentas
      .filter((item) => item.tipo === "POR_PAGAR" && item.estado === "PENDIENTE")
      .reduce((sum, item) => sum + (item.importe || 0), 0),
    saldadas: cuentas
      .filter((item) => item.estado === "SALDADA")
      .reduce((sum, item) => sum + (item.importe || 0), 0),
  };
}

export function contarInquilinosPorEstado(inquilinos: Inquilino[]) {
  return {
    activos: inquilinos.filter((item) => item.estado === "ACTIVO").length,
    retirados: inquilinos.filter((item) => item.estado === "RETIRADO").length,
  };
}

export function ocupacionPorPropiedad(
  propiedades: Propiedad[],
  inmuebles: Inmueble[]
) {
  return propiedades.map((propiedad) => ({
    label: propiedad.nombre,
    ocupados: inmuebles.filter(
      (item) => item.propiedad?.id === propiedad.id && item.estado === "OCUPADO"
    ).length,
    disponibles: inmuebles.filter(
      (item) =>
        item.propiedad?.id === propiedad.id && item.estado === "DISPONIBLE"
    ).length,
    mantenimiento: inmuebles.filter(
      (item) =>
        item.propiedad?.id === propiedad.id && item.estado === "MANTENIMIENTO"
    ).length,
  }));
}

export function propiedadesPorDistrito(propiedades: Propiedad[]) {
  return Object.entries(
    propiedades.reduce<Record<string, number>>((acc, propiedad) => {
      const distrito = propiedad.distrito?.trim() || "Sin distrito";
      acc[distrito] = (acc[distrito] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
}

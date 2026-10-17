import type { Cuenta, Inquilino } from "./types";

export function totalesCuentasPendientes(cuentas: Cuenta[]) {
  const cuentasPendientes = cuentas.filter((cuenta) => cuenta.estado === "PENDIENTE");
  const totalPorCobrar = cuentasPendientes
    .filter((cuenta) => cuenta.tipo === "POR_COBRAR")
    .reduce((sum, cuenta) => sum + cuenta.importe, 0);
  const totalPorPagar = cuentasPendientes
    .filter((cuenta) => cuenta.tipo === "POR_PAGAR")
    .reduce((sum, cuenta) => sum + cuenta.importe, 0);

  return { cuentasPendientes, totalPorCobrar, totalPorPagar };
}

export function nombreInquilinoDeCuenta(
  cuenta: Cuenta,
  inquilinos: Inquilino[]
) {
  if (cuenta.inquilino?.nombreCompleto) return cuenta.inquilino.nombreCompleto;

  const inquilino = inquilinos.find((item) => item.id === cuenta.inquilino?.id);
  return inquilino?.nombreCompleto ?? "Sin inquilino asignado";
}

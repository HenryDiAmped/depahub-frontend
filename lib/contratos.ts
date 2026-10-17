export type PlanCuotas = {
  cuotasCompletas: number;
  tieneProrrateo: boolean;
  numeroCuotas: number;
};

export function fechaLocal(valor: string) {
  const [anio, mes, dia] = valor.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function sumarMeses(fecha: Date, meses: number) {
  const mesDestino = fecha.getMonth() + meses;
  const anioDestino = fecha.getFullYear() + Math.floor(mesDestino / 12);
  const mesNormalizado = ((mesDestino % 12) + 12) % 12;
  const ultimoDia = new Date(anioDestino, mesNormalizado + 1, 0).getDate();
  return new Date(anioDestino, mesNormalizado, Math.min(fecha.getDate(), ultimoDia));
}

export function fechaComoTexto(fecha: Date) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function esFrecuenciaCompatible(
  fechaInicio: string,
  fechaFin: string,
  frecuencia: number
) {
  if (!fechaInicio || !fechaFin || frecuencia <= 0) return false;

  const inicio = fechaLocal(fechaInicio);
  const fin = fechaLocal(fechaFin);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return false;

  const finPrimerPeriodo = sumarMeses(inicio, frecuencia);
  finPrimerPeriodo.setDate(finPrimerPeriodo.getDate() - 1);
  return fin >= finPrimerPeriodo;
}

export function fechaMinimaFinContrato(fechaInicio: string) {
  const finPrimerPeriodo = sumarMeses(fechaLocal(fechaInicio), 1);
  finPrimerPeriodo.setDate(finPrimerPeriodo.getDate() - 1);
  return fechaComoTexto(finPrimerPeriodo);
}

export function calcularPlanCuotas(
  fechaInicio: string,
  fechaFin: string,
  frecuencia: number
): PlanCuotas | null {
  if (!esFrecuenciaCompatible(fechaInicio, fechaFin, frecuencia)) return null;

  const fin = fechaLocal(fechaFin);
  let inicioPeriodo = fechaLocal(fechaInicio);

  let cuotasCompletas = 0;
  while (true) {
    const siguientePeriodo = sumarMeses(inicioPeriodo, frecuencia);
    const finPeriodo = new Date(siguientePeriodo);
    finPeriodo.setDate(finPeriodo.getDate() - 1);
    if (finPeriodo > fin) break;
    cuotasCompletas++;
    inicioPeriodo = siguientePeriodo;
  }

  const tieneProrrateo = inicioPeriodo <= fin;
  return {
    cuotasCompletas,
    tieneProrrateo,
    numeroCuotas: cuotasCompletas + (tieneProrrateo ? 1 : 0),
  };
}

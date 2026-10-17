import type { Inmueble, Inquilino } from "./types";

export function esInmuebleDelAdministrador(
  inmueble: Inmueble,
  administradorId: number
) {
  return inmueble.propiedad?.administrador?.id === administradorId;
}

export function esInquilinoDelAdministrador(
  inquilino: Inquilino,
  administradorId: number
) {
  return inquilino.inmueble?.propiedad?.administrador?.id === administradorId;
}

export function filtrarInmueblesDelAdministrador(
  inmuebles: Inmueble[],
  administradorId: number
) {
  return inmuebles.filter((inmueble) =>
    esInmuebleDelAdministrador(inmueble, administradorId)
  );
}

export function filtrarInquilinosDelAdministrador(
  inquilinos: Inquilino[],
  administradorId: number
) {
  return inquilinos.filter((inquilino) =>
    esInquilinoDelAdministrador(inquilino, administradorId)
  );
}

export function filtrarInquilinosActivosDelAdministrador(
  inquilinos: Inquilino[],
  administradorId: number
) {
  return inquilinos.filter(
    (inquilino) =>
      inquilino.estado === "ACTIVO" &&
      esInquilinoDelAdministrador(inquilino, administradorId)
  );
}

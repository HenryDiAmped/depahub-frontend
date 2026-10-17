import { describe, expect, it } from "vitest";
import {
  esInmuebleDelAdministrador,
  esInquilinoDelAdministrador,
  filtrarInmueblesDelAdministrador,
  filtrarInquilinosActivosDelAdministrador,
  filtrarInquilinosDelAdministrador,
} from "./filtros";
import type { Inmueble, Inquilino } from "./types";

const inmueblePropio: Inmueble = {
  id: 1,
  nombre: "201",
  piso: 2,
  precioBase: 350,
  estado: "OCUPADO",
  descripcion: "",
  propiedad: { id: 10, administrador: { id: 1 } },
};

const inmuebleAjeno: Inmueble = {
  ...inmueblePropio,
  id: 2,
  propiedad: { id: 11, administrador: { id: 2 } },
};

const inmuebleSinRelacion: Inmueble = {
  ...inmueblePropio,
  id: 3,
  propiedad: undefined,
};

function inquilino(parcial: Partial<Inquilino> & Pick<Inquilino, "id" | "estado">): Inquilino {
  return {
    nombreCompleto: "María Torres",
    dni: "71794266",
    telefono: "999999999",
    fechaNacimiento: "1998-09-01",
    ...parcial,
  };
}

describe("filtros por administrador", () => {
  it("reconoce un inmueble del administrador y rechaza el resto", () => {
    expect(esInmuebleDelAdministrador(inmueblePropio, 1)).toBe(true);
    expect(esInmuebleDelAdministrador(inmuebleAjeno, 1)).toBe(false);
    expect(esInmuebleDelAdministrador(inmuebleSinRelacion, 1)).toBe(false);
  });

  it("filtra inmuebles del administrador autenticado", () => {
    expect(
      filtrarInmueblesDelAdministrador(
        [inmueblePropio, inmuebleAjeno, inmuebleSinRelacion],
        1
      )
    ).toEqual([inmueblePropio]);
  });

  it("reconoce un inquilino a través de inmueble.propiedad.administrador.id", () => {
    const propio = inquilino({
      id: 1,
      estado: "ACTIVO",
      inmueble: { id: 1, propiedad: { id: 10, administrador: { id: 1 } } },
    });
    const ajeno = inquilino({
      id: 2,
      estado: "ACTIVO",
      inmueble: { id: 2, propiedad: { id: 11, administrador: { id: 99 } } },
    });
    const incompleto = inquilino({ id: 3, estado: "ACTIVO" });

    expect(esInquilinoDelAdministrador(propio, 1)).toBe(true);
    expect(esInquilinoDelAdministrador(ajeno, 1)).toBe(false);
    expect(esInquilinoDelAdministrador(incompleto, 1)).toBe(false);
  });

  it("filtra inquilinos del administrador, incluyendo retirados", () => {
    const activo = inquilino({
      id: 1,
      estado: "ACTIVO",
      inmueble: { id: 1, propiedad: { id: 10, administrador: { id: 1 } } },
    });
    const retirado = inquilino({
      id: 2,
      estado: "RETIRADO",
      inmueble: { id: 1, propiedad: { id: 10, administrador: { id: 1 } } },
    });
    const ajeno = inquilino({
      id: 3,
      estado: "ACTIVO",
      inmueble: { id: 2, propiedad: { id: 11, administrador: { id: 2 } } },
    });

    expect(filtrarInquilinosDelAdministrador([activo, retirado, ajeno], 1)).toEqual([
      activo,
      retirado,
    ]);
  });

  it("filtra solo inquilinos activos del administrador", () => {
    const activo = inquilino({
      id: 1,
      estado: "ACTIVO",
      inmueble: { id: 1, propiedad: { id: 10, administrador: { id: 1 } } },
    });
    const retirado = inquilino({
      id: 2,
      estado: "RETIRADO",
      inmueble: { id: 1, propiedad: { id: 10, administrador: { id: 1 } } },
    });

    expect(filtrarInquilinosActivosDelAdministrador([activo, retirado], 1)).toEqual([
      activo,
    ]);
  });
});

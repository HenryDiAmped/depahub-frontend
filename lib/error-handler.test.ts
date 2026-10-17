import { describe, expect, it } from "vitest";
import { errorHandlers, getErrorMessage } from "./error-handler";

describe("getErrorMessage — integridad referencial", () => {
  it("con foreign key y entityType propiedad explica inmuebles asociados", () => {
    expect(
      getErrorMessage(
        new Error("Foreign key constraint fails"),
        "delete",
        "Edificio Central",
        "propiedad"
      )
    ).toEqual({
      title: "No se puede eliminar Edificio Central",
      description:
        "Esta propiedad tiene inmuebles asociados. Elimina primero todos los inmuebles antes de eliminar la propiedad.",
    });
  });

  it("con constraint y entityType inmueble explica inquilinos asociados", () => {
    expect(
      getErrorMessage(
        new Error("Cannot delete: constraint violation"),
        "delete",
        "Dpto 201",
        "inmueble"
      )
    ).toEqual({
      title: "No se puede eliminar Dpto 201",
      description:
        "Este inmueble tiene inquilinos asociados. Los inquilinos deben retirarse primero antes de eliminar el inmueble.",
    });
  });

  it("sin entityType infiere por la palabra inmueble en el mensaje", () => {
    const result = getErrorMessage(
      new Error("Violación de referencia: inmueble"),
      "delete",
      "la propiedad"
    );
    expect(result.description).toContain("inmuebles asociados");
  });

  it("sin entityType infiere inquilinos, contratos o cuentas", () => {
    expect(
      getErrorMessage(new Error("foreign key inquilino"), "delete", "el inmueble")
        .description
    ).toContain("inquilinos asociados");
    expect(
      getErrorMessage(new Error("constraint contrato"), "delete", "el registro")
        .description
    ).toContain("contratos asociados");
    expect(
      getErrorMessage(new Error("constraint cuenta"), "delete", "el registro")
        .description
    ).toContain("cuentas asociadas");
  });

  it("sin pistas concretas pide eliminar las dependencias", () => {
    expect(
      getErrorMessage(new Error("foreign key constraint"), "delete", "el registro")
        .description
    ).toBe("Este registro tiene datos relacionados. Elimina primero las dependencias.");
  });
});

describe("getErrorMessage — códigos HTTP y red", () => {
  it("mapea 404 y not found", () => {
    expect(getErrorMessage(new Error("404"), "fetch", "Inmueble")).toEqual({
      title: "Inmueble no encontrado",
      description: "El inmueble que buscas ya no existe o fue eliminado.",
    });
    expect(getErrorMessage(new Error("Resource not found"), "fetch", "Inmueble").title).toBe(
      "Inmueble no encontrado"
    );
  });

  it("mapea 401, 403 y unauthorized", () => {
    const esperado = {
      title: "Acceso denegado",
      description: "No tienes permisos para realizar esta acción. Inicia sesión nuevamente.",
    };
    expect(getErrorMessage(new Error("401 Unauthorized"))).toEqual(esperado);
    expect(getErrorMessage(new Error("403 Forbidden"))).toEqual(esperado);
    expect(getErrorMessage(new Error("unauthorized"))).toEqual(esperado);
  });

  it("mapea 409 y duplicate", () => {
    expect(getErrorMessage(new Error("409 Conflict"), "create", "Inquilino")).toEqual({
      title: "Registro duplicado",
      description: "Ya existe un inquilino con estos datos. Verifica la información.",
    });
    expect(getErrorMessage(new Error("duplicate key"), "create", "Inquilino").title).toBe(
      "Registro duplicado"
    );
  });

  it("mapea 500 e internal server", () => {
    const esperado = {
      title: "Error del servidor",
      description: "Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.",
    };
    expect(getErrorMessage(new Error("500"))).toEqual(esperado);
    expect(getErrorMessage(new Error("Internal Server Error"))).toEqual(esperado);
  });

  it("mapea Failed to fetch como error de red", () => {
    expect(getErrorMessage(new Error("Failed to fetch"))).toEqual({
      title: "Error de conexión",
      description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
    });
  });
});

describe("getErrorMessage — mensaje del backend", () => {
  it("muestra tal cual un mensaje descriptivo como Token inválido o expirado", () => {
    expect(getErrorMessage(new Error("Token inválido o expirado"), "fetch")).toEqual({
      title: "Error al cargar",
      description: "Token inválido o expirado",
    });
  });

  it("usa el fallback del contexto si el mensaje no es descriptivo", () => {
    expect(getErrorMessage(new Error("Error: x"), "create", "el contrato")).toEqual({
      title: "Error al crear",
      description: "No se pudo crear el contrato",
    });
  });

  it("si el valor no es Error, usa Error desconocido como descripción", () => {
    expect(getErrorMessage(null, "update")).toEqual({
      title: "Error al actualizar",
      description: "Error desconocido",
    });
  });
});

describe("errorHandlers", () => {
  it("delete con entityType propiedad reutiliza getErrorMessage", () => {
    expect(
      errorHandlers.delete(new Error("constraint"), "Edificio Central", "propiedad")
        .description
    ).toContain("inmuebles asociados");
  });
});

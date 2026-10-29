/**
 * Utilidades para manejo de errores en la aplicación
 */

export interface ErrorDetails {
  title: string;
  description: string;
}

const mensajesDeValidacion: Array<[RegExp, string]> = [
  [/fecha de vencimiento.*anterior/i, "La fecha de vencimiento debe ser igual o posterior a la fecha de emisión."],
  [/fechas de inicio y fin.*obligatorias/i, "Indica la fecha de inicio y la fecha de fin del contrato."],
  [/fecha de fin.*anterior/i, "La fecha de fin debe ser posterior a la fecha de inicio."],
  [/duración mínima de un mes/i, "El contrato debe tener una duración mínima de un mes."],
  [/frecuencia.*mayor que cero/i, "Selecciona una frecuencia de pago válida."],
  [/frecuencia de pago.*compatible/i, "La frecuencia de pago no es compatible con las fechas elegidas."],
  [/dni/i, "El DNI ya está registrado. Verifica el número ingresado."],
  [/email|correo/i, "El correo electrónico ya está registrado. Usa otro correo."],
  [/teléfono|telefono/i, "El número de teléfono ya está registrado. Verifica el dato ingresado."],
];

function mensajeAmigableDeValidacion(errorMessage: string) {
  return mensajesDeValidacion.find(([patron]) => patron.test(errorMessage))?.[1];
}

/**
 * Analiza un error y retorna un mensaje amigable para el usuario
 */
export function getErrorMessage(
  error: unknown,
  context: 'delete' | 'create' | 'update' | 'fetch' = 'fetch',
  entityName: string = 'registro',
  entityType?: string // Nuevo parámetro para identificar el tipo de entidad
): ErrorDetails {
  const errorMessage = error instanceof Error ? error.message : "Error desconocido";
  const mensajeValidacion = mensajeAmigableDeValidacion(errorMessage);

  if (mensajeValidacion) {
    return {
      title: "Revisa la información",
      description: mensajeValidacion,
    };
  }
  
  // Errores de integridad referencial (restricciones de FK)
  if (errorMessage.toLowerCase().includes("constraint") || 
      errorMessage.toLowerCase().includes("foreign key") ||
      errorMessage.toLowerCase().includes("referencia")) {
    
    if (context === 'delete') {
      // Mensajes específicos según el tipo de entidad
      if (entityType === 'propiedad') {
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Esta propiedad tiene inmuebles asociados. Elimina primero todos los inmuebles antes de eliminar la propiedad.",
        };
      } else if (entityType === 'inmueble') {
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Este inmueble tiene inquilinos asociados. Los inquilinos deben retirarse primero antes de eliminar el inmueble.",
        };
      }
      
      // Detectar por palabras clave en el mensaje de error (fallback)
      if (errorMessage.toLowerCase().includes("inmueble")) {
        // Si el mensaje dice "inmueble" es porque una propiedad tiene inmuebles
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Esta propiedad tiene inmuebles asociados. Elimina primero todos los inmuebles.",
        };
      } else if (errorMessage.toLowerCase().includes("inquilino")) {
        // Si el mensaje dice "inquilino" es porque un inmueble tiene inquilinos
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Este inmueble tiene inquilinos asociados. Los inquilinos deben retirarse primero antes de eliminar el inmueble.",
        };
      } else if (errorMessage.toLowerCase().includes("contrato")) {
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Este registro tiene contratos asociados. Finaliza o elimina primero los contratos.",
        };
      } else if (errorMessage.toLowerCase().includes("cuenta")) {
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Este registro tiene cuentas asociadas. Elimina primero las cuentas.",
        };
      } else {
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Este registro tiene datos relacionados. Elimina primero las dependencias.",
        };
      }
    }
  }
  
  // Error 404 - No encontrado
  if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404")) {
    return {
      title: `${entityName} no encontrado`,
      description: `El ${entityName.toLowerCase()} que buscas ya no existe o fue eliminado.`,
    };
  }
  
  // Error 401/403 - No autorizado
  if (errorMessage.includes("401") || errorMessage.includes("403") || 
      errorMessage.toLowerCase().includes("unauthorized") ||
      errorMessage.toLowerCase().includes("forbidden")) {
    return {
      title: "Acceso denegado",
      description: "No tienes permisos para realizar esta acción. Inicia sesión nuevamente.",
    };
  }
  
  // Error 409 - Conflicto (duplicados)
  if (errorMessage.includes("409") || errorMessage.toLowerCase().includes("conflict") ||
      errorMessage.toLowerCase().includes("already exists") ||
      errorMessage.toLowerCase().includes("duplicate")) {
    return {
      title: "Registro duplicado",
      description: `Ya existe un ${entityName.toLowerCase()} con estos datos. Verifica la información.`,
    };
  }
  
  // Error 500 - Error del servidor
  if (errorMessage.includes("500") || errorMessage.toLowerCase().includes("internal server")) {
    return {
      title: "Error del servidor",
      description: "Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.",
    };
  }
  
  // Error de red/conexión
  if (errorMessage.toLowerCase().includes("network") || 
      errorMessage.toLowerCase().includes("fetch") ||
      errorMessage.toLowerCase().includes("connection")) {
    return {
      title: "Error de conexión",
      description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
    };
  }
  
  // Mensaje por contexto
  const nombreParaMensaje = entityName === "registro"
    ? (context === "fetch" ? "los datos" : "el registro")
    : entityName.toLowerCase();
  const contextMessages: Record<typeof context, ErrorDetails> = {
    delete: {
      title: "Error al eliminar",
      description: `No se pudo eliminar ${nombreParaMensaje}`,
    },
    create: {
      title: "Error al crear",
      description: `No se pudo crear ${nombreParaMensaje}`,
    },
    update: {
      title: "Error al actualizar",
      description: `No se pudo actualizar ${nombreParaMensaje}`,
    },
    fetch: {
      title: "Error al cargar",
      description: `No se pudo cargar ${nombreParaMensaje}`,
    },
  };
  
  return contextMessages[context];
}

export function getAuthErrorMessage(error: unknown, action: "login" | "register"): ErrorDetails {
  const errorMessage = error instanceof Error ? error.message : "";

  if (/401|403|credenciales|invalid.*password|bad credentials/i.test(errorMessage)) {
    return {
      title: "No pudimos iniciar sesión",
      description: "El correo o la contraseña no son correctos.",
    };
  }

  if (action === "register") {
    return getErrorMessage(error, "create", "la cuenta");
  }

  return getErrorMessage(error, "fetch", "la sesión");
}

/**
 * Variantes específicas para cada tipo de operación
 */
export const errorHandlers = {
  delete: (error: unknown, entityName: string = 'el registro', entityType?: string) => 
    getErrorMessage(error, 'delete', entityName, entityType),
  
  create: (error: unknown, entityName: string = 'el registro', entityType?: string) => 
    getErrorMessage(error, 'create', entityName, entityType),
  
  update: (error: unknown, entityName: string = 'el registro', entityType?: string) => 
    getErrorMessage(error, 'update', entityName, entityType),
  
  fetch: (error: unknown, entityName: string = 'los datos', entityType?: string) => 
    getErrorMessage(error, 'fetch', entityName, entityType),
};

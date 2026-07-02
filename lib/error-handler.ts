/**
 * Utilidades para manejo de errores en la aplicación
 */

export interface ErrorDetails {
  title: string;
  description: string;
}

/**
 * Analiza un error y retorna un mensaje amigable para el usuario
 */
export function getErrorMessage(
  error: unknown,
  context: 'delete' | 'create' | 'update' | 'fetch' = 'fetch',
  entityName: string = 'registro'
): ErrorDetails {
  const errorMessage = error instanceof Error ? error.message : "Error desconocido";
  
  // Errores de integridad referencial (restricciones de FK)
  if (errorMessage.toLowerCase().includes("constraint") || 
      errorMessage.toLowerCase().includes("foreign key") ||
      errorMessage.toLowerCase().includes("referencia")) {
    
    if (context === 'delete') {
      // Detectar tipo de relación
      if (errorMessage.toLowerCase().includes("inmueble")) {
        return {
          title: `No se puede eliminar ${entityName}`,
          description: "Este registro tiene inmuebles asociados. Elimina primero todos los inmuebles.",
        };
      } else if (errorMessage.toLowerCase().includes("inquilino")) {
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
  const contextMessages: Record<typeof context, ErrorDetails> = {
    delete: {
      title: "Error al eliminar",
      description: `No se pudo eliminar ${entityName.toLowerCase()}`,
    },
    create: {
      title: "Error al crear",
      description: `No se pudo crear ${entityName.toLowerCase()}`,
    },
    update: {
      title: "Error al actualizar",
      description: `No se pudo actualizar ${entityName.toLowerCase()}`,
    },
    fetch: {
      title: "Error al cargar",
      description: `No se pudo cargar ${entityName.toLowerCase()}`,
    },
  };
  
  // Si el mensaje del backend es descriptivo, usarlo
  if (errorMessage && 
      !errorMessage.startsWith("Error:") && 
      errorMessage.length > 10 && 
      errorMessage.length < 200) {
    return {
      title: contextMessages[context].title,
      description: errorMessage,
    };
  }
  
  return contextMessages[context];
}

/**
 * Variantes específicas para cada tipo de operación
 */
export const errorHandlers = {
  delete: (error: unknown, entityName: string = 'el registro') => 
    getErrorMessage(error, 'delete', entityName),
  
  create: (error: unknown, entityName: string = 'el registro') => 
    getErrorMessage(error, 'create', entityName),
  
  update: (error: unknown, entityName: string = 'el registro') => 
    getErrorMessage(error, 'update', entityName),
  
  fetch: (error: unknown, entityName: string = 'los datos') => 
    getErrorMessage(error, 'fetch', entityName),
};

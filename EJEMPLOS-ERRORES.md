# 📋 Ejemplos de Mensajes de Error - DepHub Frontend

Este documento muestra los diferentes mensajes de error que el sistema muestra al usuario según el tipo de problema.

---

## 🚫 Errores de Eliminación (DELETE)

### 1. Restricción de Integridad Referencial

#### Caso: Intentar eliminar una propiedad con inmuebles
**Error del backend:**
```
constraint violation / foreign key / referencia + "inmueble"
```

**Mensaje al usuario:**
```
🔴 No se puede eliminar la propiedad
Esta propiedad tiene inmuebles asociados. Elimina primero todos los inmuebles.
```

#### Caso: Intentar eliminar un inmueble con inquilino
**Error del backend:**
```
constraint violation / foreign key + "inquilino"
```

**Mensaje al usuario:**
```
🔴 No se puede eliminar el inmueble
Este inmueble tiene un inquilino asociado. Retira primero al inquilino antes de eliminar el inmueble.
```

#### Caso: Restricción genérica
**Error del backend:**
```
constraint violation / foreign key
```

**Mensaje al usuario:**
```
🔴 No se puede eliminar el registro
Este registro tiene datos relacionados. Elimina primero las dependencias.
```

---

### 2. Registro No Encontrado (404)

**Error del backend:**
```
404 / not found
```

**Mensaje al usuario:**
```
🔴 Propiedad no encontrada
La propiedad que buscas ya no existe o fue eliminado.
```

---

### 3. Acceso Denegado (401/403)

**Error del backend:**
```
401 / 403 / unauthorized / forbidden
```

**Mensaje al usuario:**
```
🔴 Acceso denegado
No tienes permisos para realizar esta acción. Inicia sesión nuevamente.
```

---

## ➕ Errores de Creación (CREATE)

### 1. Registro Duplicado (409)

**Error del backend:**
```
409 / conflict / already exists / duplicate
```

**Mensaje al usuario:**
```
🔴 Registro duplicado
Ya existe una propiedad con estos datos. Verifica la información.
```

---

### 2. Error de Validación

**Error del backend:**
```
validation error / invalid data
```

**Mensaje al usuario:**
```
🔴 Error al crear
[Mensaje específico del backend si está disponible]
```

---

## 🔄 Errores de Actualización (UPDATE)

### 1. Registro No Encontrado

**Error del backend:**
```
404
```

**Mensaje al usuario:**
```
🔴 Propiedad no encontrada
El registro que buscas ya no existe o fue eliminado.
```

---

### 2. Conflicto de Versión

**Error del backend:**
```
409 / conflict
```

**Mensaje al usuario:**
```
🔴 Registro duplicado
Ya existe un registro con estos datos. Verifica la información.
```

---

## 📥 Errores de Carga (FETCH)

### 1. Error de Conexión

**Error del backend:**
```
network error / connection refused / fetch failed
```

**Mensaje al usuario:**
```
🔴 Error de conexión
No se pudo conectar con el servidor. Verifica tu conexión a internet.
```

---

### 2. Error del Servidor (500)

**Error del backend:**
```
500 / internal server error
```

**Mensaje al usuario:**
```
🔴 Error del servidor
Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.
```

---

## 🎯 Ejemplos por Módulo

### Módulo de Propiedades

| Acción | Escenario | Mensaje |
|--------|-----------|---------|
| **Eliminar** | Propiedad con inmuebles | "Esta propiedad tiene inmuebles asociados. Elimina primero todos los inmuebles." |
| **Eliminar** | Propiedad ya eliminada | "La propiedad que buscas ya no existe o fue eliminado." |
| **Crear** | Nombre duplicado | "Ya existe una propiedad con estos datos. Verifica la información." |
| **Actualizar** | Propiedad no existe | "La propiedad que buscas ya no existe o fue eliminado." |

### Módulo de Inmuebles

| Acción | Escenario | Mensaje |
|--------|-----------|---------|
| **Eliminar** | Inmueble con inquilino | "Este inmueble tiene un inquilino asociado. Retira primero al inquilino antes de eliminar el inmueble." |
| **Eliminar** | Inmueble con contratos | "Este inmueble tiene contratos asociados. Finaliza o elimina primero los contratos." |
| **Crear** | Sin propiedad asignada | "Error al crear el inmueble" + mensaje del backend |

### Módulo de Inquilinos

| Acción | Escenario | Mensaje |
|--------|-----------|---------|
| **Retirar** | Inquilino con cuentas pendientes | Advertencia pero permite continuar |
| **Eliminar** | Inquilino con contratos | "Este registro tiene contratos asociados. Finaliza o elimina primero los contratos." |

---

## 🔧 Cómo Funciona

### 1. Error Handler Centralizado

Ubicación: `lib/error-handler.ts`

```typescript
export function getErrorMessage(
  error: unknown,
  context: 'delete' | 'create' | 'update' | 'fetch',
  entityName: string
): ErrorDetails
```

### 2. Detección Inteligente

El sistema analiza el mensaje de error del backend y detecta:
- Palabras clave (`constraint`, `foreign key`, `not found`, etc.)
- Códigos de estado HTTP (404, 409, 500, etc.)
- Entidades relacionadas (`inmueble`, `inquilino`, `contrato`, etc.)

### 3. Mensaje Contextual

Según el análisis, genera un mensaje apropiado con:
- **Título descriptivo**: Explica qué tipo de error ocurrió
- **Descripción específica**: Indica exactamente qué hacer para resolverlo

---

## 🎨 Presentación Visual

### Toast de Error
```
┌─────────────────────────────────────┐
│ 🔴 No se puede eliminar la propiedad│
│                                     │
│ Esta propiedad tiene inmuebles      │
│ asociados. Elimina primero todos    │
│ los inmuebles.                      │
│                                     │
│                              [Cerrar]│
└─────────────────────────────────────┘
```

### Toast de Éxito
```
┌─────────────────────────────────────┐
│ ✅ Propiedad eliminada              │
│                                     │
│ La propiedad se eliminó             │
│ correctamente                       │
│                                     │
│                              [Cerrar]│
└─────────────────────────────────────┘
```

---

## 📝 Uso en el Código

### Antes (v1.0.1)
```typescript
try {
  await propiedadesApi.delete(id);
  toast({ title: "Éxito" });
} catch (error) {
  toast({
    variant: "destructive",
    title: "Error",
    description: "No se pudo eliminar la propiedad" // ❌ Genérico
  });
}
```

### Ahora (v1.0.2)
```typescript
try {
  await propiedadesApi.delete(id);
  toast({ title: "Éxito" });
} catch (error) {
  const { title, description } = errorHandlers.delete(error, "la propiedad");
  toast({
    variant: "destructive",
    title,    // ✅ "No se puede eliminar la propiedad"
    description // ✅ "Esta propiedad tiene inmuebles asociados..."
  });
}
```

---

## 🚀 Aplicar en Otros Módulos

Para agregar manejo de errores mejorado en otros módulos:

### 1. Importar el error handler
```typescript
import { errorHandlers } from "@/lib/error-handler";
```

### 2. Usar en catch blocks
```typescript
// Para DELETE
const { title, description } = errorHandlers.delete(error, "el inquilino");

// Para CREATE
const { title, description } = errorHandlers.create(error, "el contrato");

// Para UPDATE
const { title, description } = errorHandlers.update(error, "la cuenta");

// Para FETCH
const { title, description } = errorHandlers.fetch(error, "los datos");
```

### 3. Mostrar en toast
```typescript
toast({
  variant: "destructive",
  title,
  description,
});
```

---

## ✅ Beneficios

1. **Claridad**: El usuario sabe exactamente qué salió mal
2. **Acción**: El usuario sabe qué hacer para resolver el problema
3. **Profesionalismo**: Mensajes bien redactados y contextuales
4. **Mantenibilidad**: Lógica centralizada y reutilizable
5. **Consistencia**: Mismo formato en toda la aplicación

---

**Versión:** v1.0.2  
**Última actualización:** 2026-07-02

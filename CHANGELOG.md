# Changelog - DepHub Frontend

## [1.0.2] - 2026-07-02

### ✨ Mejoras

#### Mensajes de error descriptivos y contextuales
- **Mejora**: Los mensajes de error ahora explican claramente la razón por la que una acción falló.
- **Beneficio**: El usuario entiende exactamente qué hacer para resolver el problema.
- **Implementación**:
  - Nuevo módulo `lib/error-handler.ts` con función centralizada de manejo de errores
  - Detección inteligente de tipos de error:
    - **Restricciones de integridad**: "Esta propiedad tiene inmuebles asociados. Elimina primero todos los inmuebles."
    - **Registro no encontrado**: "El registro que buscas ya no existe o fue eliminado."
    - **Acceso denegado**: "No tienes permisos para realizar esta acción."
    - **Registro duplicado**: "Ya existe un registro con estos datos."
    - **Error del servidor**: "Ocurrió un error en el servidor. Intenta nuevamente más tarde."
    - **Error de conexión**: "No se pudo conectar con el servidor. Verifica tu conexión."
  - Aplicado en módulos de Propiedades e Inmuebles
  - Mensajes personalizados según el contexto (crear, actualizar, eliminar, cargar)

#### Mejor extracción de mensajes del backend
- **Mejora**: La función `fetchApi` ahora extrae correctamente los mensajes de error del backend.
- **Soporte para**:
  - Respuestas JSON con campo `message` o `error`
  - Respuestas de texto plano
  - Manejo robusto de diferentes formatos de error

### 📝 Archivos creados
- `lib/error-handler.ts` - Utilidad centralizada para manejo de errores

### 📝 Archivos modificados
- `lib/api.ts` - Mejorada extracción de mensajes de error
- `app/dashboard/propiedades/page.tsx` - Implementado error handler
- `app/dashboard/propiedades/[id]/page.tsx` - Implementado error handler

---

## [1.0.1] - 2026-07-02

### 🐛 Fixes

#### DELETE requests ahora funcionan correctamente
- **Problema**: Al eliminar una propiedad, el backend la eliminaba correctamente de la BD, pero el frontend mostraba un error porque intentaba parsear una respuesta vacía como JSON.
- **Causa**: La función `fetchApi` siempre intentaba hacer `response.json()`, pero las respuestas DELETE pueden ser:
  - 204 No Content (sin body)
  - 200 OK con body vacío
  - 200 OK con texto plano
- **Solución**: Actualizada la función `fetchApi` en `lib/api.ts` para manejar correctamente:
  - Respuestas con status 204
  - Respuestas con content-length 0
  - Respuestas sin content-type JSON
  - Intentar parsear como JSON, y si falla, retornar objeto vacío
- **Impacto**: Ahora todas las operaciones DELETE funcionan correctamente sin mostrar errores falsos.

### 📝 Archivos modificados
- `lib/api.ts` - Mejorada la función `fetchApi` para manejar respuestas vacías

---

## [1.0.0] - 2026-07-02

### 🎉 Release Inicial

#### ✅ Características implementadas

**Autenticación**
- Registro de administrador
- Login con email/contraseña
- Persistencia de sesión
- Protección de rutas

**Módulos CRUD**
- Propiedades (CRUD completo)
- Inmuebles (CRUD completo por propiedad)
- Inquilinos (CRUD + gestión de estados)
- Contratos (CRUD + asociación con inquilinos)
- Cuentas (CRUD por cobrar/pagar)
- Balances mensuales (CRUD + ingresos/egresos)

**UI/UX**
- Dashboard con estadísticas
- Diseño responsive
- Notificaciones toast
- Validaciones de formularios
- Estados visuales con badges
- Sidebar de navegación

**Integración API**
- Cliente API completo
- 30+ endpoints implementados
- Manejo de errores
- TypeScript completo

**Documentación**
- README técnico completo
- Guía de inicio rápido
- Resumen de implementación
- Especificaciones del sistema

---

## Notas de Versión

### Compatibilidad
- Node.js 20+
- API Backend en http://localhost:8080
- Navegadores modernos (Chrome, Firefox, Edge, Safari)

### Dependencias principales
- Next.js 16.2.9
- React 19.2.4
- TypeScript 5+
- Tailwind CSS 4
- shadcn/ui components

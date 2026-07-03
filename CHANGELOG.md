# Changelog - DepHub Frontend

## [1.0.6] - 2026-07-02

### ✨ Actualización Automática de Totales en Balance Mensual

#### 1. Recálculo automático al registrar ingresos
- **Mejora**: Cuando se registra un nuevo ingreso, el `totalIngresos` del balance se actualiza automáticamente.
- **Implementación**:
  - Después de crear el ingreso, se obtienen todos los ingresos del balance
  - Se calcula la suma total de todos los ingresos
  - Se actualiza el balance con el nuevo `totalIngresos`
  - Se recalcula la `utilidad` (totalIngresos - totalEgresos)
- **Beneficio**: Los totales siempre reflejan el estado actual sin necesidad de refrescar manualmente.

#### 2. Recálculo automático al registrar egresos
- **Mejora**: Cuando se registra un nuevo egreso, el `totalEgresos` del balance se actualiza automáticamente.
- **Implementación**:
  - Después de crear el egreso, se obtienen todos los egresos del balance
  - Se calcula la suma total de todos los egresos
  - Se actualiza el balance con el nuevo `totalEgresos`
  - Se recalcula la `utilidad` (totalIngresos - totalEgresos)
- **Beneficio**: Los totales siempre reflejan el estado actual sin necesidad de refrescar manualmente.

#### 3. Actualización de la utilidad en tiempo real
- **Mejora**: La utilidad del balance se recalcula automáticamente con cada ingreso o egreso.
- **Fórmula aplicada**: `utilidad = totalIngresos - totalEgresos`
- **Beneficio**: El administrador ve en tiempo real la situación financiera del período.

### 🔄 Flujo Mejorado

**Antes:**
```
1. Registrar ingreso/egreso
2. Los totales no se actualizaban
3. Era necesario recargar la página o backend calculaba mal
4. Inconsistencia en los datos mostrados
```

**Ahora:**
```
1. Registrar ingreso/egreso
2. Sistema recalcula totales automáticamente ✨
3. totalIngresos y totalEgresos se actualizan
4. Utilidad se recalcula
5. Vista se actualiza con datos correctos
6. Todo sucede en una sola operación
```

### 📊 Ejemplo de Cálculo

**Escenario:**
- Balance inicial: totalIngresos = S/. 1,000.00, totalEgresos = S/. 500.00
- Se registra nuevo ingreso: S/. 300.00
- **Sistema automáticamente**:
  - Suma todos los ingresos: S/. 1,300.00
  - Actualiza totalIngresos: S/. 1,300.00
  - Recalcula utilidad: S/. 1,300.00 - S/. 500.00 = S/. 800.00
  - Muestra los nuevos totales instantáneamente

### 📝 Archivos modificados
- `app/dashboard/balances/page.tsx` - Recálculo automático de totales

---

## [1.0.5] - 2026-07-02

### ✨ Gestión Automática del Estado de Inmuebles

#### 1. Cambio automático a estado OCUPADO
- **Mejora**: Cuando un inquilino se asigna a un inmueble, el inmueble cambia automáticamente su estado a "OCUPADO".
- **Flujo implementado**:
  - Al crear un nuevo inquilino con inmueble asignado → Inmueble cambia a OCUPADO
  - Al editar un inquilino y asignarle un inmueble → Inmueble cambia a OCUPADO
  - Al editar un inquilino y cambiar de inmueble → Inmueble anterior vuelve a DISPONIBLE, nuevo inmueble cambia a OCUPADO
- **Beneficio**: Eliminación de inconsistencias entre el estado del inmueble y la asignación de inquilinos.

#### 2. Cambio automático a estado DISPONIBLE
- **Mejora**: Cuando un inquilino se retira, el inmueble que ocupaba vuelve automáticamente a estado "DISPONIBLE".
- **Flujo implementado**:
  - Al retirar un inquilino → Inquilino cambia a RETIRADO
  - Al retirar un inquilino → Se desasocia del inmueble
  - Al retirar un inquilino → Inmueble cambia a DISPONIBLE
- **Beneficio**: El inmueble queda disponible automáticamente para ser asignado a otro inquilino.

#### 3. Corrección: Email realmente opcional
- **Fix**: Removido el atributo `required` del campo email que se había dejado por error.
- **Estado**: Email ahora es completamente opcional en el formulario.

### 🔄 Flujos Automatizados

**Crear Inquilino con Inmueble:**
```
1. Usuario crea inquilino
2. Usuario selecciona inmueble disponible
3. Sistema guarda inquilino con inmueble asignado
4. Sistema cambia estado del inmueble a OCUPADO ✨
5. Usuario ve inmueble marcado como ocupado
```

**Retirar Inquilino:**
```
1. Usuario retira inquilino
2. Sistema cambia estado del inquilino a RETIRADO
3. Sistema desasocia inquilino del inmueble
4. Sistema cambia estado del inmueble a DISPONIBLE ✨
5. Usuario ve inmueble disponible para nuevo inquilino
```

**Cambiar Inmueble de Inquilino:**
```
1. Usuario edita inquilino
2. Usuario selecciona nuevo inmueble
3. Sistema actualiza inquilino con nuevo inmueble
4. Sistema cambia inmueble anterior a DISPONIBLE ✨
5. Sistema cambia nuevo inmueble a OCUPADO ✨
```

### 📝 Archivos modificados
- `app/dashboard/inquilinos/page.tsx` - Gestión automática del estado de inmuebles

---

## [1.0.4] - 2026-07-02

### ✨ Mejoras en Mensajes de Error y Visualización de Datos

#### 1. Mensajes de error diferenciados por entidad
- **Mejora**: Los mensajes de error al eliminar ahora son específicos para cada tipo de entidad.
- **Implementación**:
  - Nuevo parámetro `entityType` en el error handler
  - Mensajes distintos para propiedades vs inmuebles
- **Resultados**:
  - **Propiedad con inmuebles**: "Esta propiedad tiene inmuebles asociados. Elimina primero todos los inmuebles antes de eliminar la propiedad."
  - **Inmueble con inquilinos**: "Este inmueble tiene inquilinos asociados. Los inquilinos deben retirarse primero antes de eliminar el inmueble."
- **Beneficio**: Mayor claridad y precisión en los mensajes de error.

#### 2. Visualización de inquilino en tarjeta de inmueble
- **Mejora**: Ahora se muestra qué inquilino ocupa cada inmueble en la vista de inmuebles.
- **Visualización**:
  - Si hay inquilino activo: Muestra nombre del inquilino en recuadro destacado
  - Si está ocupado pero no se encuentra inquilino: Muestra "Inmueble ocupado"
  - Si está disponible: No muestra nada
- **Diseño**:
  ```
  👤 Ocupado por:
  Juan Pérez [en color primario]
  ```
- **Beneficio**: El administrador ve inmediatamente quién ocupa cada inmueble.

#### 3. Estado OCUPADO automático (Backend)
- **Nota**: El backend debe actualizar automáticamente el estado del inmueble a OCUPADO cuando se asigna un inquilino.
- **Frontend**: Recarga los datos después de crear/actualizar inquilinos para reflejar el cambio de estado.
- **Comportamiento esperado**:
  - Inquilino asignado a inmueble → Inmueble estado: OCUPADO
  - Inquilino retirado → Inmueble estado: DISPONIBLE

### 📝 Archivos modificados
- `lib/error-handler.ts` - Nuevo parámetro `entityType` para mensajes específicos
- `app/dashboard/propiedades/page.tsx` - Usa entityType "propiedad"
- `app/dashboard/propiedades/[id]/page.tsx` - Usa entityType "inmueble" y muestra inquilino
- `app/dashboard/inquilinos/page.tsx` - Recarga datos después de actualizar

---

## [1.0.3] - 2026-07-02

### ✨ Mejoras en Módulo de Inquilinos

#### 1. Visualización del inmueble ocupado
- **Mejora**: Ahora se muestra el departamento/inmueble que ocupa cada inquilino en su tarjeta.
- **Visualización**: Icono 🏠 con el nombre del inmueble en color primario.
- **Beneficio**: El administrador puede ver rápidamente qué inmueble ocupa cada inquilino.

#### 2. Email opcional
- **Mejora**: El campo email ahora es opcional al crear o editar inquilinos.
- **Cambios**:
  - Removido el `required` del campo email en el formulario
  - Actualizada la interfaz `Inquilino` para que `email` sea opcional
  - Label actualizado a "Email (opcional)"
- **Beneficio**: Mayor flexibilidad al registrar inquilinos que no tienen email.

#### 3. Desasociación automática al retirar inquilino
- **Mejora**: Cuando un inquilino se retira, automáticamente se desasocia del inmueble.
- **Comportamiento**:
  - Estado del inquilino cambia a "RETIRADO"
  - El inquilino se desvincula del inmueble (`inmueble: undefined`)
  - El inmueble queda libre para asignar a otro inquilino
- **Beneficio**: El flujo es más natural y evita inconsistencias en los datos.

#### 4. Mensaje de error mejorado para inmuebles
- **Mejora**: El mensaje al intentar eliminar un inmueble con inquilinos ahora es más específico.
- **Mensaje anterior**: "Este registro tiene inquilinos asociados. Retira primero a los inquilinos."
- **Mensaje nuevo**: "Este inmueble tiene inquilinos asociados. Los inquilinos deben retirarse primero antes de eliminar el inmueble."
- **Beneficio**: Más claridad sobre qué acción tomar.

### 🔧 Reglas de Negocio Implementadas

1. ✅ Se permite borrar inmueble solo si:
   - No tiene inquilino asociado, O
   - El inquilino que lo ocupaba ya se retiró (estado: RETIRADO)

2. ✅ No se permite borrar inmueble si:
   - Tiene un inquilino activo asociado

### 📝 Archivos modificados
- `app/dashboard/inquilinos/page.tsx` - Todas las mejoras del módulo
- `lib/types.ts` - Email opcional en interfaz Inquilino
- `lib/error-handler.ts` - Mensaje mejorado para inmuebles con inquilinos

---

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

# Informe de pruebas — DepaHub Frontend

**Proyecto:** `depahub-frontend`  
**Fecha:** 18 de octubre de 2026  
**Resultado de la última ejecución:** 55 pruebas aprobadas (0 fallidas)

---

## 1. Software utilizado

| Herramienta | Versión | Uso |
| --- | --- | --- |
| Vitest | 3.2.4 | Ejecutor de pruebas unitarias |
| Node.js (entorno Vitest `node`) | — | Pruebas de lógica pura (`lib/`) |
| jsdom | 30.1.3 | DOM simulado para el contexto de autenticación |
| React Testing Library | 16.3.3 | Pruebas de `AuthProvider` (render, clics, `waitFor`) |
| @testing-library/dom | 10.4.2 | Consultas DOM usadas por RTL |
| TypeScript | 5.x | Tipado de código y tests |

Configuración: `vitest.config.ts`. Las pruebas de `lib/` corren en Node (sin DOM). Las de `contexts/` usan `@vitest-environment jsdom`.

No se llama al backend real (`localhost:8080`). El cliente HTTP se prueba con `globalThis.fetch` mockeado.

---

## 2. Cómo ejecutarlas

Desde la raíz del frontend (`depahub-frontend`):

```bash
pnpm test:run
```

Modo watch (se reejecutan al guardar):

```bash
pnpm test
```

Un archivo concreto:

```bash
pnpm test:run lib/contratos.test.ts
pnpm test:run contexts/auth-context.test.tsx
```

---

## 3. Cantidad de pruebas

| Archivo de prueba | Módulo bajo prueba | Cantidad |
| --- | --- | --- |
| `lib/contratos.test.ts` | `lib/contratos.ts` | 11 |
| `lib/filtros.test.ts` | `lib/filtros.ts` | 5 |
| `lib/dashboard-metrics.test.ts` | `lib/dashboard-metrics.ts` | 8 |
| `lib/cuentas.test.ts` | `lib/cuentas.ts` | 4 |
| `lib/error-handler.test.ts` | `lib/error-handler.ts` | 14 |
| `lib/api.test.ts` | `lib/api.ts` | 7 |
| `contexts/auth-context.test.tsx` | `contexts/auth-context.tsx` | 6 |
| **Total** | | **55** |

**7 archivos de prueba** en total.

---

## 4. Funciones y comportamientos probados

### Contratos (`lib/contratos.ts`)

- `fechaLocal`, `fechaComoTexto`, `sumarMeses`
- `esFrecuenciaCompatible`: contrato de al menos un mes; fin anterior al primer período; fechas inválidas o frecuencia 0
- `fechaMinimaFinContrato`: duración mínima de 1 mes
- `calcularPlanCuotas`: 12 cuotas en un año (frecuencia 1); 4 cuotas en un año (frecuencia 3); prorrateo; `null` si la frecuencia no cabe

### Filtros por administrador (`lib/filtros.ts`)

- `esInmuebleDelAdministrador` / `filtrarInmueblesDelAdministrador`
- `esInquilinoDelAdministrador` / `filtrarInquilinosDelAdministrador` / `filtrarInquilinosActivosDelAdministrador`
- Incluye el recurso si `inmueble.propiedad.administrador.id` coincide; excluye los de otro administrador; no rompe con datos incompletos (sin inmueble o propiedad)

### Métricas del dashboard (`lib/dashboard-metrics.ts`)

- `formatMoney`
- `calcularMetricasDashboard`: % ocupación (0 si no hay inmuebles); renta promedio solo de contratos `ACTIVO`; por cobrar / por pagar solo `PENDIENTE` (`SALDADA` no suma); `cuentasVencidas` (`PENDIENTE` con fecha anterior a hoy); garantía solo de contratos activos; utilidad de balances (0 si falta)
- `balancesParaGrafico`, `contarContratosPorEstado`, `contarInquilinosPorEstado`
- `inmueblesPorPropiedad`, `rentaPorPropiedad`, `ocupacionPorPropiedad`
- `montosCuentasPorTipo`, `propiedadesPorDistrito`

### Cuentas (`lib/cuentas.ts`)

- `totalesCuentasPendientes`: totales `POR_COBRAR` vs `POR_PAGAR` (solo pendientes)
- `nombreInquilinoDeCuenta`: `cuenta.inquilino.nombreCompleto` → catálogo → `"Sin inquilino asignado"`

### Manejo de errores (`lib/error-handler.ts`)

- `getErrorMessage` y `errorHandlers.delete`
- Foreign key / constraint + `entityType: 'propiedad'` o `'inmueble'`
- Inferencia por palabras clave (inmueble, inquilino, contrato, cuenta)
- 404 / not found, 401 / 403 / unauthorized, 409 / duplicate, 500
- Error de red (`Failed to fetch`)
- Mensaje descriptivo del backend (p. ej. “Token inválido o expirado”) se muestra tal cual

### Cliente API (`lib/api.ts`) — `fetch` mockeado

- `Content-Type: application/json`
- Si hay `authToken` en `localStorage`, envía `Authorization: Bearer …`
- Login / register no dependen de token previo
- Error JSON usa `message` o `error`
- 204 o cuerpo vacío no explota al parsear
- `contratosApi.obtenerPdf`: `Accept: application/pdf` y devuelve un `Blob`
- Query params: `/propiedades?administradorId=1`, `/contratos?administradorId=1&inquilinoId=2`, `/ingresos?balanceId=5`

### Autenticación (`contexts/auth-context.tsx`) — RTL + mocks de `authApi` y `next/navigation`

- Login OK: guarda `admin` y `authToken`, redirige a `/dashboard`
- Login fallido: no escribe en `localStorage`
- Register OK: guarda token + administrador y redirige a `/dashboard`
- Al montar: si hay admin y token, restaura sesión; si falta uno, limpia ambos
- Logout: borra storage y va a `/login`

---

## 5. Alcance y limitaciones

- Se probaron **funciones puras** extraídas a `lib/` y el **contexto de autenticación**.
- No hay pruebas E2E ni de páginas completas del dashboard (formularios, tablas, gráficos en pantalla).
- El único contexto de React del proyecto es `AuthProvider`; no hay más contextos que cubrir.
- Las pruebas de API **no** golpean el servidor Spring Boot: se mockea `fetch`.

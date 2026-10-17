# Documentación de la API — DepaHub

Esta documentación describe los endpoints que consume el frontend de DepaHub.

## URL base

```
http://localhost:8080/api
```

Las solicitudes con cuerpo deben incluir el encabezado:

```
Content-Type: application/json
```

## Convenciones

- Las respuestas de listado son arreglos JSON.
- Los recursos se identifican con `id` numérico.
- Para crear se usa `POST`, para actualizar `PUT` y para eliminar `DELETE`.
- Una creación exitosa responde `201 Created`.
- Una eliminación exitosa responde sin contenido (`204 No Content`).
- Los campos de fecha usan el formato `YYYY-MM-DD`.
- Los importes monetarios son números decimales.
- La `password` del administrador es de solo escritura: se envía al crear o actualizar, pero **nunca** aparece en las respuestas JSON.

## Autenticación

Todas las rutas, excepto `/auth/register` y `/auth/login`, requieren un JWT válido:

```
Authorization: Bearer <token>
```

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/auth/register` | Registra un administrador e inicia su sesión. |
| `POST` | `/auth/login` | Inicia sesión con email y contraseña. |

### Registrar administrador

`POST /auth/register`

```json
{
  "nombreCompleto": "Ana Pérez",
  "dni": "12345678",
  "email": "ana@correo.com",
  "telefono": "999999999",
  "password": "secreto",
  "fechaRegistro": "2026-09-04",
  "utilidadTotal": 0
}
```

### Iniciar sesión

`POST /auth/login`

```json
{
  "email": "ana@correo.com",
  "password": "secreto"
}
```

`fechaRegistro` y `utilidadTotal` son opcionales al registrar: si no se envían, el backend usa la fecha de hoy y `0`.

Respuestas:

- `POST /auth/register` → `201 Created`, `"mensaje": "Registro exitoso"`
- `POST /auth/login` → `200 OK`, `"mensaje": "Login exitoso"`

```json
{
  "mensaje": "Registro exitoso",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "administrador": {
    "id": 1,
    "nombreCompleto": "Ana Pérez",
    "dni": "12345678",
    "email": "ana@correo.com",
    "telefono": "999999999",
    "fechaRegistro": "2026-09-04",
    "utilidadTotal": 0
  }
}
```

Errores de autenticación:

| Estado | Cuándo |
| --- | --- |
| `400` | Password vacía al registrar. |
| `401` | Email o password incorrectos al iniciar sesión. |
| `409` | El email ya está registrado. |

## Administradores

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/administradores` | Lista los administradores. |
| `GET` | `/administradores/{id}` | Obtiene un administrador. |
| `POST` | `/administradores` | Crea un administrador. |
| `PUT` | `/administradores/{id}` | Actualiza un administrador. |
| `DELETE` | `/administradores/{id}` | Elimina un administrador. |

Objeto `Administrador`:

Cuerpo al crear o actualizar (la `password` es obligatoria al crear; al actualizar, si viene vacía se conserva la actual):

```json
{
  "nombreCompleto": "Ana Pérez",
  "dni": "12345678",
  "email": "ana@correo.com",
  "telefono": "999999999",
  "password": "secreto",
  "fechaRegistro": "2026-09-04",
  "utilidadTotal": 2500.5
}
```

La respuesta **no incluye** `password`. El email no puede repetirse (`409`).

## Propiedades

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/propiedades` | Lista las propiedades. |
| `GET` | `/propiedades?administradorId={id}` | Lista las propiedades de un administrador. |
| `GET` | `/propiedades/{id}` | Obtiene una propiedad. |
| `POST` | `/propiedades` | Crea una propiedad. |
| `PUT` | `/propiedades/{id}` | Actualiza una propiedad. |
| `DELETE` | `/propiedades/{id}` | Elimina una propiedad. |

```json
{
  "nombre": "Edificio Central",
  "direccion": "Av. Principal 123",
  "distrito": "Chorrillos",
  "descripcion": "Propiedad con habitaciones para alquiler",
  "administrador": { "id": 1 }
}
```

## Inmuebles

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/inmuebles` | Lista los inmuebles. |
| `GET` | `/inmuebles?propiedadId={id}` | Lista los inmuebles de una propiedad. |
| `GET` | `/inmuebles/{id}` | Obtiene un inmueble. |
| `POST` | `/inmuebles` | Crea un inmueble. |
| `PUT` | `/inmuebles/{id}` | Actualiza un inmueble. |
| `DELETE` | `/inmuebles/{id}` | Elimina un inmueble. |

```json
{
  "nombre": "201",
  "piso": 2,
  "precioBase": 350,
  "estado": "DISPONIBLE",
  "descripcion": "Habitación para una persona",
  "propiedad": { "id": 1 }
}
```

Valores admitidos para `estado`:

- `DISPONIBLE`
- `OCUPADO`
- `MANTENIMIENTO`

Un inmueble devuelto por la API incluye su propiedad y su administrador. Esta relación permite asociar el inmueble a la sesión actual:

```json
{
  "id": 10,
  "nombre": "201",
  "propiedad": {
    "id": 1,
    "nombre": "Edificio Central",
    "administrador": { "id": 1 }
  }
}
```

## Inquilinos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/inquilinos` | Lista los inquilinos. |
| `GET` | `/inquilinos?inmuebleId={id}` | Lista los inquilinos asociados a un inmueble. |
| `GET` | `/inquilinos/{id}` | Obtiene un inquilino. |
| `POST` | `/inquilinos` | Crea un inquilino. |
| `PUT` | `/inquilinos/{id}` | Actualiza un inquilino. |
| `DELETE` | `/inquilinos/{id}` | Elimina un inquilino. |

```json
{
  "nombreCompleto": "María Torres",
  "dni": "71794266",
  "telefono": "923742746",
  "email": "maria@correo.com",
  "fechaNacimiento": "1998-09-01",
  "estado": "ACTIVO",
  "inmueble": { "id": 10 }
}
```

Valores admitidos para `estado`:

- `ACTIVO`
- `RETIRADO`

La respuesta de un inquilino puede incluir el inmueble, su propiedad y el administrador de dicha propiedad. Para filtrar los inquilinos del administrador autenticado se usa la ruta:

```text
inquilino.inmueble.propiedad.administrador.id
```

## Contratos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/contratos` | Lista los contratos. |
| `GET` | `/contratos?administradorId={id}` | Lista contratos de un administrador. |
| `GET` | `/contratos?inquilinoId={id}` | Lista contratos de un inquilino. |
| `GET` | `/contratos/{id}` | Obtiene un contrato. |
| `GET` | `/contratos/{id}/pdf` | Genera y devuelve el contrato en PDF. |
| `POST` | `/contratos` | Crea un contrato. |
| `PUT` | `/contratos/{id}` | Actualiza un contrato. |
| `DELETE` | `/contratos/{id}` | Elimina un contrato. |

La respuesta de `GET /contratos/{id}/pdf` es binaria (`application/pdf`), con
`Content-Disposition: inline; filename="contrato-{id}.pdf"`. Requiere
`Authorization: Bearer <token>`. Solo el administrador titular del contrato
puede obtenerlo (`403` si no es el dueño).

```json
{
  "fechaInicio": "2026-09-01",
  "fechaFin": "2027-08-31",
  "montoAlquiler": 350,
  "garantia": 350,
  "frecuencia": 1,
  "estado": "ACTIVO",
  "condiciones": "Pago mensual adelantado",
  "administrador": { "id": 1 },
  "inquilino": { "id": 1 }
}
```

Valores admitidos para `estado`: `ACTIVO`, `FINALIZADO`, `CANCELADO`.

Al crear o actualizar, el backend **calcula** `numeroCuotas` según `fechaInicio`,
`fechaFin` y `frecuencia` (meses entre cuotas). `fechaRegistro` es opcional; si
no se envía, se usa la fecha de hoy. `condiciones` es opcional.

Reglas de validación (`400`):

- `fechaInicio` y `fechaFin` son obligatorias.
- `fechaFin` no puede ser anterior a `fechaInicio`.
- El contrato debe durar al menos un mes.
- `frecuencia` debe ser mayor que cero y caber en la duración del contrato.

Efectos al crear un contrato:

- Genera una cuenta por cobrar de **garantía** (vence 3 días después del inicio)
  y una por cada cuota, con su vencimiento.
- Si el contrato está vigente hoy, obtiene o crea el **balance mensual** del
  administrador para el mes actual.

## Cuentas

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/cuentas` | Lista las cuentas. |
| `GET` | `/cuentas?administradorId={id}` | Lista cuentas de un administrador. |
| `GET` | `/cuentas?inquilinoId={id}` | Lista cuentas de un inquilino. |
| `GET` | `/cuentas/{id}` | Obtiene una cuenta. |
| `POST` | `/cuentas` | Crea una cuenta. |
| `PUT` | `/cuentas/{id}` | Actualiza una cuenta. |
| `DELETE` | `/cuentas/{id}` | Elimina una cuenta. |

```json
{
  "tipo": "POR_COBRAR",
  "importe": 350,
  "concepto": "Mensualidad de septiembre",
  "fechaEmitida": "2026-09-01",
  "fechaVencimiento": "2026-09-05",
  "estado": "PENDIENTE",
  "administrador": { "id": 1 },
  "inquilino": { "id": 1 },
  "contrato": { "id": 9 }
}
```

Valores de `tipo`: `POR_COBRAR`, `POR_PAGAR`.

Valores de `estado`: `PENDIENTE`, `SALDADA`.

`fechaVencimiento` es opcional. Si se envía, no puede ser anterior a
`fechaEmitida` (`400`). `contrato` es opcional (las cuentas generadas al crear
un contrato sí lo traen).

Al pasar una cuenta de `PENDIENTE` a `SALDADA` con `PUT`:

- `POR_COBRAR` crea un **ingreso** en el balance del mes actual.
- `POR_PAGAR` crea un **egreso** en el balance del mes actual.
- Se actualizan `totalIngresos` / `totalEgresos` y se recalcula `utilidad`.
- Si la cuenta ya estaba `SALDADA`, no se duplica el movimiento.

## Balances mensuales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/balances-mensuales` | Lista los balances. |
| `GET` | `/balances-mensuales?administradorId={id}` | Lista balances de un administrador. |
| `GET` | `/balances-mensuales/{id}` | Obtiene un balance. |
| `POST` | `/balances-mensuales` | Crea un balance. |
| `PUT` | `/balances-mensuales/{id}` | Actualiza un balance. |
| `DELETE` | `/balances-mensuales/{id}` | Elimina un balance. |

```json
{
  "mes": 9,
  "anio": 2026,
  "totalIngresos": 700,
  "totalEgresos": 100,
  "utilidad": 600,
  "fechaGeneracion": "2026-09-04",
  "administrador": { "id": 1 }
}
```

`utilidad` se recalcula como `totalIngresos - totalEgresos`. Si no se envía
`fechaGeneracion` al crear, se usa la fecha de hoy.

## Ingresos y egresos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/ingresos` | Lista ingresos. |
| `GET` | `/ingresos?balanceId={id}` | Lista ingresos de un balance. |
| `GET` | `/ingresos/{id}` | Obtiene un ingreso. |
| `POST` | `/ingresos` | Crea un ingreso. |
| `PUT` | `/ingresos/{id}` | Actualiza un ingreso. |
| `DELETE` | `/ingresos/{id}` | Elimina un ingreso. |
| `GET` | `/egresos` | Lista egresos. |
| `GET` | `/egresos?balanceId={id}` | Lista egresos de un balance. |
| `GET` | `/egresos/{id}` | Obtiene un egreso. |
| `POST` | `/egresos` | Crea un egreso. |
| `PUT` | `/egresos/{id}` | Actualiza un egreso. |
| `DELETE` | `/egresos/{id}` | Elimina un egreso. |

Formato de un ingreso:

```json
{
  "importe": 350,
  "concepto": "Pago de alquiler",
  "fecha": "2026-09-01",
  "balanceMensual": { "id": 5 }
}
```

Un egreso utiliza el mismo formato, cambiando el concepto según corresponda.

## Manejo de errores

Cuando la API devuelve un estado HTTP no exitoso, el frontend intenta leer los campos `message` o `error` del JSON de respuesta. Si no están disponibles, muestra el código HTTP como mensaje de error.

Estados habituales:

| Estado | Significado |
| --- | --- |
| `400` | Datos inválidos (fechas, frecuencia, password vacía, etc.). |
| `401` | Credenciales incorrectas, o JWT inválido/expirado (`{"message":"Token inválido o expirado"}`). |
| `403` | Sin permiso (por ejemplo, PDF de un contrato ajeno). |
| `404` | Registro no encontrado. |
| `409` | Email de administrador duplicado. |

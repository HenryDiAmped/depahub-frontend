# Documentacion de API - DepaHub

## Base URL

```txt
http://localhost:8080/api
```

La API no usa JWT. El login devuelve los datos del administrador, no un token.

## Auth

### Registrar administrador

```http
POST /api/auth/register
```

Body:

```json
{
  "nombreCompleto": "Juan Perez",
  "dni": "12345678",
  "email": "juan@mail.com",
  "telefono": "987654321",
  "password": "123456",
  "fechaRegistro": "2026-06-29",
  "utilidadTotal": 0
}
```

Respuesta:

```json
{
  "mensaje": "Registro exitoso",
  "administrador": {
    "id": 1,
    "nombreCompleto": "Juan Perez",
    "dni": "12345678",
    "email": "juan@mail.com",
    "telefono": "987654321",
    "fechaRegistro": "2026-06-29",
    "utilidadTotal": 0
  }
}
```

### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "juan@mail.com",
  "password": "123456"
}
```

Respuesta:

```json
{
  "mensaje": "Login exitoso",
  "administrador": {
    "id": 1,
    "nombreCompleto": "Juan Perez",
    "dni": "12345678",
    "email": "juan@mail.com",
    "telefono": "987654321",
    "fechaRegistro": "2026-06-29",
    "utilidadTotal": 0
  }
}
```

## CRUD General

Todos estos recursos tienen operaciones CRUD completas:

```http
GET    /api/recurso
GET    /api/recurso/{id}
POST   /api/recurso
PUT    /api/recurso/{id}
DELETE /api/recurso/{id}
```

Recursos disponibles:

```txt
/api/administradores
/api/propiedades
/api/inmuebles
/api/inquilinos
/api/contratos
/api/cuentas
/api/balances-mensuales
/api/ingresos
/api/egresos
```

Para enviar relaciones, usar el objeto relacionado con su `id`:

```json
{
  "administrador": { "id": 1 }
}
```

## Administradores

### Crear administrador

```http
POST /api/administradores
```

Body:

```json
{
  "nombreCompleto": "Juan Perez",
  "dni": "12345678",
  "email": "juan@mail.com",
  "telefono": "987654321",
  "password": "123456",
  "fechaRegistro": "2026-06-29",
  "utilidadTotal": 0
}
```

Endpoints:

```http
GET    /api/administradores
GET    /api/administradores/{id}
POST   /api/administradores
PUT    /api/administradores/{id}
DELETE /api/administradores/{id}
```

## Propiedades

### Crear propiedad

```http
POST /api/propiedades
```

Body:

```json
{
  "nombre": "Edificio Central",
  "direccion": "Av. Principal 123",
  "distrito": "Miraflores",
  "descripcion": "Propiedad principal",
  "administrador": { "id": 1 }
}
```

Endpoints:

```http
GET    /api/propiedades
GET    /api/propiedades/{id}
POST   /api/propiedades
PUT    /api/propiedades/{id}
DELETE /api/propiedades/{id}
```

Filtro:

```http
GET /api/propiedades?administradorId=1
```

## Inmuebles

Estados permitidos:

```txt
DISPONIBLE
OCUPADO
MANTENIMIENTO
```

### Crear inmueble

```http
POST /api/inmuebles
```

Body:

```json
{
  "nombre": "Departamento 301",
  "piso": 3,
  "precioBase": 1200.00,
  "estado": "DISPONIBLE",
  "descripcion": "Vista a la calle",
  "propiedad": { "id": 1 }
}
```

Endpoints:

```http
GET    /api/inmuebles
GET    /api/inmuebles/{id}
POST   /api/inmuebles
PUT    /api/inmuebles/{id}
DELETE /api/inmuebles/{id}
```

Filtro:

```http
GET /api/inmuebles?propiedadId=1
```

## Inquilinos

Estados permitidos:

```txt
ACTIVO
RETIRADO
```

### Crear inquilino

```http
POST /api/inquilinos
```

Body:

```json
{
  "nombreCompleto": "Maria Lopez",
  "dni": "87654321",
  "telefono": "912345678",
  "email": "maria@mail.com",
  "fechaNacimiento": "1998-04-15",
  "estado": "ACTIVO",
  "inmueble": { "id": 1 }
}
```

Endpoints:

```http
GET    /api/inquilinos
GET    /api/inquilinos/{id}
POST   /api/inquilinos
PUT    /api/inquilinos/{id}
DELETE /api/inquilinos/{id}
```

Filtro:

```http
GET /api/inquilinos?inmuebleId=1
```

## Contratos

Estados permitidos:

```txt
ACTIVO
FINALIZADO
CANCELADO
```

### Crear contrato

```http
POST /api/contratos
```

Body:

```json
{
  "fechaInicio": "2026-07-01",
  "fechaFin": "2027-07-01",
  "montoAlquiler": 1200.00,
  "garantia": 1200.00,
  "estado": "ACTIVO",
  "condiciones": "Pago mensual",
  "fechaRegistro": "2026-06-29",
  "administrador": { "id": 1 },
  "inquilino": { "id": 1 }
}
```

Endpoints:

```http
GET    /api/contratos
GET    /api/contratos/{id}
POST   /api/contratos
PUT    /api/contratos/{id}
DELETE /api/contratos/{id}
```

Filtros:

```http
GET /api/contratos?administradorId=1
GET /api/contratos?inquilinoId=1
```

## Cuentas

Tipos permitidos:

```txt
POR_PAGAR
POR_COBRAR
```

Estados permitidos:

```txt
PENDIENTE
SALDADA
```

### Crear cuenta

```http
POST /api/cuentas
```

Body:

```json
{
  "tipo": "POR_COBRAR",
  "importe": 1200.00,
  "concepto": "Alquiler julio",
  "fechaEmitida": "2026-07-01",
  "estado": "PENDIENTE",
  "administrador": { "id": 1 },
  "inquilino": { "id": 1 }
}
```

Endpoints:

```http
GET    /api/cuentas
GET    /api/cuentas/{id}
POST   /api/cuentas
PUT    /api/cuentas/{id}
DELETE /api/cuentas/{id}
```

Filtros:

```http
GET /api/cuentas?administradorId=1
GET /api/cuentas?inquilinoId=1
```

## Balances Mensuales

### Crear balance mensual

```http
POST /api/balances-mensuales
```

Body:

```json
{
  "mes": 7,
  "anio": 2026,
  "totalIngresos": 3000.00,
  "totalEgresos": 800.00,
  "fechaGeneracion": "2026-07-31",
  "administrador": { "id": 1 }
}
```

La utilidad se recalcula automaticamente:

```txt
utilidad = totalIngresos - totalEgresos
```

Endpoints:

```http
GET    /api/balances-mensuales
GET    /api/balances-mensuales/{id}
POST   /api/balances-mensuales
PUT    /api/balances-mensuales/{id}
DELETE /api/balances-mensuales/{id}
```

Filtro:

```http
GET /api/balances-mensuales?administradorId=1
```

## Ingresos

### Crear ingreso

```http
POST /api/ingresos
```

Body:

```json
{
  "importe": 1200.00,
  "concepto": "Pago alquiler julio",
  "fecha": "2026-07-05",
  "balanceMensual": { "id": 1 }
}
```

Endpoints:

```http
GET    /api/ingresos
GET    /api/ingresos/{id}
POST   /api/ingresos
PUT    /api/ingresos/{id}
DELETE /api/ingresos/{id}
```

Filtro:

```http
GET /api/ingresos?balanceId=1
```

## Egresos

### Crear egreso

```http
POST /api/egresos
```

Body:

```json
{
  "importe": 250.00,
  "concepto": "Mantenimiento",
  "fecha": "2026-07-10",
  "balanceMensual": { "id": 1 }
}
```

Endpoints:

```http
GET    /api/egresos
GET    /api/egresos/{id}
POST   /api/egresos
PUT    /api/egresos/{id}
DELETE /api/egresos/{id}
```

Filtro:

```http
GET /api/egresos?balanceId=1
```

## Notas Para El Frontend

### PUT

Para actualizar, enviar el objeto completo actualizado:

```http
PUT /api/inmuebles/1
```

Body:

```json
{
  "nombre": "Departamento 301",
  "piso": 3,
  "precioBase": 1300.00,
  "estado": "OCUPADO",
  "descripcion": "Vista a la calle",
  "propiedad": { "id": 1 }
}
```

### DELETE

Para eliminar, no se envia body:

```http
DELETE /api/inquilinos/1
```

### Errores Comunes

```txt
404 Registro no encontrado
401 Credenciales invalidas
409 El email ya esta registrado
```


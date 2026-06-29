# 🚀 Guía de Inicio Rápido - DepHub Frontend

## Prerrequisitos

- Node.js 20+ instalado
- pnpm instalado (`npm install -g pnpm`)
- API Backend corriendo en `http://localhost:8080`

## Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Ejecutar en desarrollo
pnpm dev

# 3. Abrir en el navegador
# http://localhost:3000
```

## Primer Uso

### 1. Registrarse como Administrador

1. Abre `http://localhost:3000`
2. Serás redirigido a `/login`
3. Haz clic en "Regístrate aquí"
4. Completa el formulario:
   - Nombre Completo
   - DNI
   - Teléfono
   - Email
   - Contraseña
5. Haz clic en "Registrarse"

### 2. Crear tu Primera Propiedad

1. En el dashboard, ve a "Propiedades"
2. Haz clic en "Nueva Propiedad"
3. Completa:
   - Nombre: Ej. "Edificio Los Olivos"
   - Dirección: Ej. "Av. Principal 123"
   - Distrito: Ej. "Miraflores"
   - Descripción: Ej. "Edificio de 5 pisos"
4. Guardar

### 3. Agregar Inmuebles a la Propiedad

1. En la lista de propiedades, haz clic en el ícono de ojo 👁️
2. Haz clic en "Nuevo Inmueble"
3. Completa:
   - Nombre: Ej. "Departamento 301"
   - Piso: 3
   - Precio Base: 1200
   - Estado: Disponible
   - Descripción: Ej. "Vista a la calle"
4. Guardar

### 4. Registrar un Inquilino

1. Ve a "Inquilinos"
2. Haz clic en "Nuevo Inquilino"
3. Completa:
   - Nombre Completo
   - DNI
   - Teléfono
   - Email
   - Fecha de Nacimiento
   - Selecciona un Inmueble disponible
4. Guardar
   - **Nota:** El inmueble automáticamente cambiará a estado "OCUPADO"

### 5. Crear un Contrato

1. Ve a "Contratos"
2. Haz clic en "Nuevo Contrato"
3. Completa:
   - Selecciona un Inquilino activo
   - Fecha Inicio: Ej. 2026-07-01
   - Fecha Fin: Ej. 2027-07-01
   - Monto Alquiler: 1200
   - Garantía: 1200
   - Condiciones: Ej. "Pago mensual anticipado"
4. Guardar
   - **Nota:** Se crea automáticamente una cuenta de garantía

### 6. Gestionar Cuentas

1. Ve a "Cuentas"
2. Haz clic en "Nueva Cuenta"
3. Selecciona:
   - Tipo: Por Cobrar / Por Pagar
   - Inquilino
   - Importe
   - Fecha
   - Concepto
4. Marcar como "Saldada" cuando se pague

### 7. Balance Mensual

1. Ve a "Balances"
2. Haz clic en "Nuevo Balance"
3. Selecciona mes y año
4. Registra Ingresos:
   - Concepto: Ej. "Alquiler Julio"
   - Importe: 1200
   - Fecha
5. Registra Egresos:
   - Concepto: Ej. "Mantenimiento"
   - Importe: 250
   - Fecha
6. **La utilidad se calcula automáticamente**

## Flujos Completos

### Flujo: Nuevo Inquilino con Contrato

```
1. Crear Propiedad
   ↓
2. Crear Inmuebles (estado: DISPONIBLE)
   ↓
3. Crear Inquilino (asignar a inmueble)
   ↓ (inmueble cambia a OCUPADO)
4. Crear Contrato para el inquilino
   ↓ (se genera cuenta de garantía)
5. Crear cuentas mensuales (Por Cobrar)
   ↓
6. Registrar pagos en Balance Mensual
```

### Flujo: Retiro de Inquilino

```
1. Ir a "Inquilinos"
   ↓
2. Buscar inquilino activo
   ↓
3. Clic en "Retirar"
   ↓ 
4. Confirmar
   ↓
   - Inquilino → estado RETIRADO
   - Inmueble → estado DISPONIBLE
   - Contratos → estado FINALIZADO
```

## Estructura de Navegación

```
Dashboard (/)
├── Propiedades
│   └── [Ver Propiedad] → Inmuebles
├── Inquilinos
│   ├── Activos
│   └── Retirados
├── Contratos
│   ├── Activos
│   ├── Finalizados
│   └── Cancelados
├── Cuentas
│   ├── Por Cobrar
│   └── Por Pagar
└── Balances
    ├── Seleccionar Período
    ├── Ingresos
    └── Egresos
```

## Tips y Mejores Prácticas

### ✅ Hacer

- Crear propiedades antes de inmuebles
- Asignar inquilinos a inmuebles disponibles
- Crear contratos para todos los inquilinos activos
- Registrar cuentas mensuales regularmente
- Mantener balances mensuales actualizados

### ❌ Evitar

- No intentes asignar un inquilino a un inmueble ocupado
- No elimines propiedades con inmuebles asociados
- No cambies estado de inmueble manualmente si tiene inquilino activo

## Solución de Problemas

### API no responde

```bash
# Verificar que el backend esté corriendo
curl http://localhost:8080/api/administradores
```

### Error de CORS

Asegúrate de que el backend permita peticiones desde `http://localhost:3000`

### No aparecen datos

1. Verifica la consola del navegador (F12)
2. Revisa que la API devuelva datos correctos
3. Asegúrate de haber iniciado sesión

## Comandos Útiles

```bash
# Desarrollo
pnpm dev

# Build de producción
pnpm build

# Preview de producción
pnpm start

# Linter
pnpm lint

# Limpiar node_modules y reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Atajos de Teclado

- `Ctrl + K` - Buscar (cuando se implemente)
- `Esc` - Cerrar diálogos
- `Tab` - Navegar entre campos

## Próximos Pasos

Una vez familiarizado con el sistema, puedes:

1. Personalizar colores en `app/globals.css`
2. Agregar más validaciones en formularios
3. Implementar búsqueda y filtros avanzados
4. Agregar exportación de reportes
5. Implementar notificaciones push

## Soporte

Para dudas o problemas:
- Revisa `README-FRONTEND.md` para documentación completa
- Consulta `AGENTS.md` para especificaciones del sistema
- Revisa `DOCU-API.md` para endpoints de la API

---

**¡Listo! Ya puedes gestionar tus propiedades e inquilinos con DepHub 🏠**

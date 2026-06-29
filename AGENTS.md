# Spec-First: Sistema de Gestión de Alquileres
## Documento de Especificación Técnica y Funcional (v1.0)

---

## SECCIÓN 1 — Visión del Producto

### Descripción General
Una plataforma web centralizada para que administradores de inmuebles gestionen sus propiedades, habitaciones, inquilinos, contratos, cuentas y balance financiero mensual, todo desde un único panel de control seguro.

### Preguntas Guía Respondidas
* **¿Qué hace exactamente este producto?** Permite al administrador registrar y gestionar propiedades, inmuebles (habitaciones), inquilinos y contratos de alquiler. También lleva un control financiero mediante cuentas (deudas entre admin e inquilino) y balances mensuales con ingresos y egresos.
* **¿Para quién es?** Administradores de inmuebles en alquiler (personas físicas o pequeñas empresas que gestionan una o más propiedades con múltiples habitaciones/cuartos).
* **¿Qué problema resuelve?** Elimina el uso de hojas de cálculo dispersas y registros manuales, unificando en un solo sistema seguro toda la información de propiedades, inquilinos activos e históricos, contratos vigentes y anteriores, y el estado financiero mensual.

---

## SECCIÓN 2 — Usuarios y Casos de Uso

En la primera versión (v1) del sistema, solo existe un tipo de usuario único y centralizado.

### Perfil: Administrador
* **Autenticación:** Requiere email y contraseña para acceder de forma segura.
* **Permisos:** Control total sobre todos los módulos del sistema.

### Acciones Principales del Administrador
* Gestionar propiedades (crear, editar, ver).
* Gestionar inmuebles (habitaciones) dentro de cada propiedad.
* Registrar inquilinos, asignarlos a un inmueble y cambiar su estado (activo / retirado).
* Crear y consultar contratos entre el administrador y los inquilinos (activos e históricos).
* Registrar cuentas: montos de garantías (admin debe a inquilino) y mensualidades (inquilino debe a admin).
* Consultar y gestionar el balance mensual con sus ingresos y egresos.

---

## SECCIÓN 3 — Funcionalidades

### 1. Módulo de Autenticación
* **Registro:** El administrador puede registrarse ingresando nombre completo, DNI, email, teléfono y contraseña.
* **Login:** Inicio de sesión mediante email y contraseña.
* **Seguridad:** El sistema protege todas las rutas; si no hay una sesión activa, redirige automáticamente al login.
* **Cierre de Sesión:** El administrador puede cerrar su sesión de forma segura.
* **Persistencia:** El sistema almacena la utilidad total acumulada del administrador.

### 2. Módulo de Propiedades
* **Creación:** Permite crear una propiedad con nombre, dirección, distrito y descripción.
* **Edición:** Permite modificar los datos de una propiedad existente.
* **Visualización General:** Vista en lista de todas las propiedades registradas.
* **Visualización Detallada:** Detalle de una propiedad específica junto con sus inmuebles asociados.

### 3. Módulo de Inmuebles (Habitaciones)
* **Creación:** Registro de un inmueble dentro de una propiedad con nombre, piso, precio base, estado y descripción.
* **Edición:** Permite modificar los datos del inmueble.
* **Gestión de Estado:** Control de disponibilidad mediante un tipo de dato `ENUM` (`disponible` o `ocupado`).
* **Asignación Actual:** Muestra qué inquilino está asignado actualmente al inmueble.
* **Historial:** Muestra el registro histórico de inquilinos anteriores del inmueble (aquellos con estado = retirado).

### 4. Módulo de Inquilinos
* **Registro:** Permite registrar un inquilino con nombre, DNI, teléfono, email, fecha de nacimiento y estado.
* **Asignación:** El sistema vincula al inquilino con el ID del inmueble asignado (`Inmuebles_id_inmueble`).
* **Estados:** Permite cambiar el estado del inquilino entre `activo` o `retirado`.
* **Historial:** Consulta completa de todos los inquilinos (tanto activos como retirados).
* **Relaciones:** Permite ver los contratos y cuentas asociadas de forma directa a cada inquilino.

### 5. Módulo de Contratos
* **Creación:** Registro de contrato con fecha de inicio, fecha de fin, monto de alquiler, garantía, condiciones y estado.
* **Vinculación:** El sistema asocia automáticamente el contrato al administrador y al inquilino correspondiente.
* **Gestión de Estado:** Control de vigencia mediante un tipo de dato `ENUM` (`activo`, `finalizado` o `cancelado`).
* **Historial:** Consulta del registro histórico completo de contratos vinculados a un inquilino.
* **Auditoría:** Registro automático de la fecha exacta de creación del contrato.

### 6. Módulo de Cuentas
* **Estructura:** Registro de transacciones con tipo (`ENUM`), importe, concepto, fecha de emisión y estado.
* **Definición del ENUM:** Determina la dirección del flujo de dinero:
    * *Admin debe a Inquilino:* Ejemplo: Devolución de garantía.
    * *Inquilino debe a Admin:* Ejemplo: Mensualidad de renta.
* **Generación:** Creación manual de cuentas o automática al momento de generar nuevos contratos.
* **Estados de Cuenta:** Modificación de estados entre `pendiente`, `pagada` o `cancelada`.
* **Resumen:** Visualización del saldo pendiente desglosado por inquilino.

### 7. Módulo de Balance Mensual
* **Estructura:** Generación de balances financieros organizados por mes y año.
* **Datos del Balance:** Almacena total de ingresos, total de egresos, utilidad y fecha de generación.
* **Ingresos:** Registro de importe, concepto y fecha vinculados al balance del mes actual.
* **Egresos:** Registro de importe, concepto y fecha vinculados al balance del mes actual.
* **Cálculo Automático:** El sistema computa la utilidad mediante la fórmula básica:
    $$\text{utilidad} = \text{total\_ingresos} - \text{total\_egresos}$$
* **Historial:** Consulta en modo lectura de balances mensuales de períodos anteriores.

---

## SECCIÓN 4 — Flujos de Usuario

### Flujo 1 — Autenticación del Administrador
* **Happy Path:**
    1. El administrador accede a la URL del sistema.
    2. El sistema despliega el formulario de login (email + contraseña).
    3. El administrador ingresa sus credenciales y hace clic en 'Ingresar'.
    4. El sistema valida los datos y lo redirige al Dashboard principal.
* **Flujo de Error:**
    * Si las credenciales son incorrectas, el sistema muestra un mensaje genérico de error sin especificar cuál de los campos es el incorrecto (por seguridad).

### Flujo 2 — Registrar un Nuevo Inquilino y Asignarlo a un Inmueble
* **Happy Path:**
    1. El administrador navega a 'Inquilinos' y presiona 'Nuevo inquilino'.
    2. Completa los campos: nombre, DNI, teléfono, email y fecha de nacimiento.
    3. Selecciona el inmueble (habitación) de destino.
    4. El sistema guarda al inquilino con estado `activo` y cambia automáticamente el estado del inmueble a `ocupado`.
* **Flujo de Error:**
    * Si el inmueble seleccionado ya cuenta con un inquilino activo, el sistema bloquea la asignación y lanza un aviso de advertencia.

### Flujo 3 — Crear un Contrato entre Administrador e Inquilino
* **Happy Path:**
    1. El administrador navega a 'Contratos' y presiona 'Nuevo contrato'.
    2. Selecciona un inquilino de la lista (el sistema solo filtra y muestra inquilinos `activos`).
    3. Completa los datos: fecha de inicio, fecha de fin, monto de alquiler, garantía y condiciones.
    4. El sistema almacena el contrato con estado `activo` y estampa la fecha de registro actual.
    5. De manera automatizada, el sistema genera una cuenta de tipo "garantía a devolver" a favor del inquilino.
* **Flujo de Error:**
    * Si se omiten campos obligatorios, el sistema resalta visualmente los inputs vacíos y bloquea la acción de guardado.

### Flujo 4 — Registrar Retiro de un Inquilino
* **Happy Path:**
    1. El administrador ingresa al perfil del inquilino y presiona 'Retirar inquilino'.
    2. El sistema despliega un resumen con el estado de las cuentas pendientes del usuario.
    3. El administrador confirma el retiro.
    4. El sistema cambia el estado del inquilino a `retirado`, libera el inmueble (vuelve a estado `disponible`) y marca los contratos vigentes de dicho inquilino como `finalizados`.
* **Flujo de Error / Advertencia:**
    * Si el inquilino presenta deudas o cuentas sin saldar, el sistema muestra una advertencia informativa, pero **no bloquea** el proceso de retiro.

### Flujo 5 — Gestión del Balance Mensual
* **Happy Path:**
    1. El administrador accede al módulo 'Balance Mensual' y filtra por mes y año.
    2. El sistema despliega el balance existente o habilita la creación de uno nuevo para el período.
    3. El administrador añade flujos (ingresos/egresos) ingresando concepto, importe y fecha.
    4. El sistema recalcula en tiempo real el `total_ingresos`, `total_egresos` y la `utilidad`.
    5. Los meses anteriores quedan bloqueados en modo lectura para auditoría.
* **Flujo de Error:**
    * Si se intenta guardar un ingreso o egreso carente de concepto o importe, el sistema deniega el registro y bloquea el guardado.
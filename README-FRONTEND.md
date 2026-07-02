# DepHub - Frontend

Sistema de Gestión de Alquileres - Aplicación Frontend desarrollada con Next.js 16, TypeScript y shadcn/ui.

## 🔥 Última Actualización (v1.0.3)

### Mejoras en Inquilinos
✨ **Nuevo**: Se muestra el departamento que ocupa cada inquilino en su tarjeta  
✨ **Nuevo**: Email es opcional al crear/editar inquilinos  
✨ **Nuevo**: Al retirar inquilino, se desasocia automáticamente del inmueble  
✅ **Mejorado**: Mensaje de error más claro al intentar eliminar inmueble con inquilinos  

### Versiones anteriores
✨ **v1.0.2**: Mensajes de error descriptivos y contextuales  
✅ **v1.0.1**: Operaciones DELETE funcionan correctamente  

Ver [CHANGELOG.md](CHANGELOG.md) para más detalles y [EJEMPLOS-ERRORES.md](EJEMPLOS-ERRORES.md) para ver todos los mensajes de error.

## 🚀 Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI
- **React 19** - Biblioteca UI

## 📦 Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Ejecutar en producción
pnpm start
```

## 🏗️ Estructura del Proyecto

```
depahub-frontend/
├── app/                          # Páginas de la aplicación
│   ├── dashboard/                # Dashboard protegido
│   │   ├── propiedades/          # Módulo de propiedades
│   │   ├── inquilinos/           # Módulo de inquilinos
│   │   ├── contratos/            # Módulo de contratos
│   │   ├── cuentas/              # Módulo de cuentas
│   │   └── balances/             # Módulo de balances mensuales
│   ├── login/                    # Página de login
│   ├── register/                 # Página de registro
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página de inicio
├── components/                   # Componentes reutilizables
│   ├── ui/                       # Componentes de shadcn/ui
│   └── dashboard/                # Componentes del dashboard
├── contexts/                     # Contextos de React
│   └── auth-context.tsx          # Contexto de autenticación
├── hooks/                        # Hooks personalizados
│   └── use-toast.ts              # Hook para notificaciones
├── lib/                          # Utilidades y configuración
│   ├── api.ts                    # Cliente API
│   ├── types.ts                  # Tipos TypeScript
│   └── utils.ts                  # Funciones utilitarias
└── public/                       # Archivos estáticos
```

## 🔐 Autenticación

El sistema usa autenticación simple basada en email y contraseña:

1. **Registro**: Crea una cuenta de administrador con datos personales
2. **Login**: Inicia sesión con email y contraseña
3. **Persistencia**: Los datos del usuario se guardan en localStorage
4. **Protección de rutas**: El dashboard requiere autenticación

## 📋 Módulos Principales

### 1. Dashboard
- Vista general con estadísticas
- Total de propiedades, inmuebles, inquilinos activos y contratos
- Utilidad total acumulada

### 2. Propiedades
- Listar propiedades del administrador
- Crear nuevas propiedades con ubicación y descripción
- Editar y eliminar propiedades existentes

### 3. Inquilinos
- Gestionar inquilinos (activos y retirados)
- Asignar inquilinos a inmuebles disponibles
- Marcar inquilinos como retirados
- Ver historial de inquilinos

### 4. Contratos
- Crear contratos entre administrador e inquilinos
- Definir fechas, montos y condiciones
- Ver contratos activos, finalizados y cancelados

### 5. Cuentas
- Registrar cuentas por cobrar y por pagar
- Ver saldo pendiente total
- Marcar cuentas como saldadas
- Filtrar por tipo y estado

### 6. Balances Mensuales
- Crear balances por mes y año
- Registrar ingresos y egresos
- Cálculo automático de utilidad
- Vista detallada por período

## 🔌 API

La aplicación consume la API REST en `http://localhost:8080/api`

Endpoints principales:
- `/auth/register` - Registro de administrador
- `/auth/login` - Inicio de sesión
- `/propiedades` - CRUD de propiedades
- `/inmuebles` - CRUD de inmuebles
- `/inquilinos` - CRUD de inquilinos
- `/contratos` - CRUD de contratos
- `/cuentas` - CRUD de cuentas
- `/balances-mensuales` - CRUD de balances
- `/ingresos` - CRUD de ingresos
- `/egresos` - CRUD de egresos

## 🎨 Componentes UI

Todos los componentes UI están basados en **shadcn/ui**:
- Button
- Card
- Dialog
- Input
- Label
- Select
- Badge
- Textarea
- Toast (notificaciones)

## 📱 Responsive

La aplicación es completamente responsive y se adapta a:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🛠️ Desarrollo

### Agregar nuevo componente UI

```bash
# Ejemplo: agregar componente de tabla
npx shadcn@latest add table
```

### Estructura de una página

```typescript
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
// ... otros imports

export default function MiPagina() {
  const { admin } = useAuth();
  // ... lógica del componente
  
  return (
    <div className="space-y-6">
      {/* contenido */}
    </div>
  );
}
```

### Hacer llamadas a la API

```typescript
import { propiedadesApi } from "@/lib/api";

// Obtener todas las propiedades
const propiedades = await propiedadesApi.getAll(adminId);

// Crear propiedad
const nuevaPropiedad = await propiedadesApi.create({
  nombre: "Mi Propiedad",
  direccion: "Calle 123",
  distrito: "Miraflores",
  descripcion: "Descripción",
  administrador: { id: adminId }
});
```

## ⚠️ Importante

- Asegúrate de que la API esté corriendo en `localhost:8080`
- Los datos se guardan en localStorage (no es producción)
- Para producción, implementar autenticación con JWT
- Agregar validación de formularios más robusta

## 🚀 Deploy

Para preparar para producción:

1. Configurar variables de entorno
2. Actualizar `BASE_URL` en `lib/api.ts`
3. Implementar autenticación segura
4. Agregar variables de entorno

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.depahub.com
```

## 📄 Licencia

Este proyecto es privado y confidencial.

# 🏁 COMIENZA AQUÍ - DepHub Frontend

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Asegúrate de que el backend esté corriendo

```bash
# El backend debe estar en http://localhost:8080
# Prueba con:
curl http://localhost:8080/api/administradores
```

### 2️⃣ Instala las dependencias (si no lo has hecho)

```bash
pnpm install
```

### 3️⃣ Inicia el servidor de desarrollo

```bash
pnpm dev
```

**¡Listo!** Abre tu navegador en `http://localhost:3000`

---

## 🎯 ¿Qué hacer primero?

1. **Regístrate** como administrador en `/register`
2. **Inicia sesión** en `/login`
3. **Explora el Dashboard** - verás estadísticas en cero
4. **Crea tu primera propiedad** en "Propiedades"
5. **Agrega inmuebles** haciendo clic en el ícono de ojo
6. **Registra inquilinos** y ¡empieza a gestionar!

---

## 📚 Documentación Disponible

| Archivo | Descripción |
|---------|-------------|
| `QUICKSTART.md` | 🚀 Guía paso a paso para usar la app |
| `README-FRONTEND.md` | 📖 Documentación técnica completa |
| `PROJECT-SUMMARY.md` | 📊 Resumen del proyecto y características |
| `AGENTS.md` | 📋 Especificaciones del sistema |
| `DOCU-API.md` | 🔌 Documentación de la API |

---

## 🛠️ Comandos Principales

```bash
# Desarrollo
pnpm dev              # Inicia servidor en http://localhost:3000

# Producción
pnpm build            # Compila para producción
pnpm start            # Ejecuta build de producción

# Calidad
pnpm lint             # Revisa el código
```

---

## 🎨 Estructura del Proyecto

```
depahub-frontend/
├── app/                    📄 Páginas de la aplicación
│   ├── dashboard/          🏠 Dashboard y módulos
│   │   ├── propiedades/    🏢 Gestión de propiedades
│   │   ├── inquilinos/     👥 Gestión de inquilinos
│   │   ├── contratos/      📝 Gestión de contratos
│   │   ├── cuentas/        💰 Gestión de cuentas
│   │   └── balances/       📊 Balances mensuales
│   ├── login/              🔐 Inicio de sesión
│   └── register/           📝 Registro
├── components/             🧩 Componentes reutilizables
│   ├── ui/                 🎨 Componentes de shadcn/ui
│   └── dashboard/          📱 Componentes específicos
├── contexts/               🌐 Context API (Auth)
├── hooks/                  🪝 Custom hooks
└── lib/                    🔧 Utilidades
    ├── api.ts             🔌 Cliente API completo
    ├── types.ts           📘 Interfaces TypeScript
    └── utils.ts           🛠️ Funciones helper
```

---

## 🎓 Módulos Disponibles

### 1. Dashboard 📊
Vista general con estadísticas de todo el sistema

### 2. Propiedades 🏢
Gestiona tus edificios y propiedades
- Ver inmuebles por propiedad

### 3. Inquilinos 👥
Gestiona inquilinos activos y retirados
- Asignar a inmuebles
- Cambiar estados

### 4. Contratos 📝
Crea y gestiona contratos de alquiler
- Asociar a inquilinos
- Definir términos y condiciones

### 5. Cuentas 💰
Registra cuentas por cobrar y por pagar
- Marcar como saldadas
- Ver resumen financiero

### 6. Balances 📈
Balance mensual con ingresos y egresos
- Cálculo automático de utilidad
- Historial por períodos

---

## 🔥 Tips de Desarrollo

### Hot Reload Activado
Los cambios se reflejan automáticamente en el navegador

### TypeScript
Todo el código tiene tipado estático completo

### Componentes Modernos
Usa shadcn/ui - componentes copiables y personalizables

### API Integrada
Todo conectado con el backend en localhost:8080

---

## ⚠️ Prerequisitos

- ✅ Node.js 20+
- ✅ pnpm (o npm/yarn)
- ✅ Backend corriendo en puerto 8080
- ✅ Navegador moderno (Chrome, Firefox, Edge, Safari)

---

## 🐛 Troubleshooting Común

### Error: "Cannot connect to API"
✅ Verifica que el backend esté corriendo en `http://localhost:8080`

### Pantalla en blanco
✅ Revisa la consola del navegador (F12)
✅ Asegúrate de haber ejecutado `pnpm install`

### Datos no aparecen
✅ Verifica que hayas iniciado sesión
✅ Comprueba que la API devuelva datos

### Error de compilación
✅ Borra `.next` y ejecuta `pnpm dev` nuevamente

```bash
# Windows
rmdir /s /q .next
pnpm dev

# Linux/Mac
rm -rf .next
pnpm dev
```

---

## 🎯 Flujo Recomendado Primera Vez

```
1. Registrarse como admin
   ↓
2. Crear una propiedad
   ↓
3. Agregar inmuebles a la propiedad
   ↓
4. Registrar inquilinos y asignarlos
   ↓
5. Crear contratos para inquilinos
   ↓
6. Registrar cuentas mensuales
   ↓
7. Crear balance mensual con ingresos/egresos
   ↓
8. ¡Ver utilidad calculada! 💰
```

---

## 📞 Recursos Útiles

- **shadcn/ui docs**: https://ui.shadcn.com
- **Next.js docs**: https://nextjs.org/docs
- **Tailwind docs**: https://tailwindcss.com/docs
- **TypeScript docs**: https://www.typescriptlang.org/docs

---

## ✨ Características Destacadas

- ✅ **Autenticación completa** (register/login/logout)
- ✅ **8 módulos funcionales** (dashboard + 6 gestión + auth)
- ✅ **UI moderna y responsive** (mobile, tablet, desktop)
- ✅ **TypeScript completo** (tipado fuerte)
- ✅ **Notificaciones toast** (feedback visual)
- ✅ **Validaciones en formularios**
- ✅ **Estados con badges de colores**
- ✅ **Confirmaciones para acciones destructivas**

---

## 🚀 ¿Todo listo?

Ejecuta:

```bash
pnpm dev
```

Y abre: **http://localhost:3000**

---

**¡Disfruta gestionando tus propiedades con DepHub! 🏠✨**

---

💡 **Tip Final**: Lee el `QUICKSTART.md` para ver ejemplos detallados de cada módulo.

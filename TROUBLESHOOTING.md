# 🔧 Troubleshooting - DepHub Frontend

## Problemas Comunes y Soluciones

---

## ✅ RESUELTO: Error al eliminar propiedades

### Síntoma
Al eliminar una propiedad, el backend la elimina correctamente de la base de datos, pero el frontend muestra un mensaje de error.

### Causa
El backend devuelve una respuesta vacía o sin JSON en operaciones DELETE exitosas, y el frontend intentaba parsear siempre como JSON.

### Solución
✅ **Ya está corregido en v1.0.1**

La función `fetchApi` en `lib/api.ts` ahora maneja correctamente:
- Respuestas 204 No Content
- Respuestas vacías (content-length: 0)
- Respuestas sin content-type JSON

### Si aún tienes el problema
```bash
# Asegúrate de tener la última versión
git pull
pnpm install
pnpm dev
```

---

## 🔌 Error: "Cannot connect to API"

### Síntoma
La aplicación no puede conectarse al backend.

### Posibles causas y soluciones

#### 1. Backend no está corriendo
```bash
# Verificar si el backend está activo
curl http://localhost:8080/api/administradores

# Si falla, iniciar el backend
cd path/to/backend
# [comando para iniciar tu backend]
```

#### 2. Puerto incorrecto
Verifica en `lib/api.ts` que la URL base sea correcta:
```typescript
const BASE_URL = 'http://localhost:8080/api';
```

#### 3. Problema de CORS
Si ves errores de CORS en la consola del navegador:

**Solución en el Backend (Spring Boot):**
```java
@CrossOrigin(origins = "http://localhost:3000")
```

O configurar globalmente:
```java
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:3000")
                        .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}
```

---

## 🚫 Error: "Propiedad no se puede eliminar"

### Síntoma
Al intentar eliminar una propiedad, aparece un error.

### Causa
El backend tiene una restricción de integridad referencial: **no se puede eliminar una propiedad si tiene inmuebles asociados**.

### Solución
1. Ve a la propiedad (clic en el ícono de ojo 👁️)
2. Elimina todos los inmuebles de esa propiedad
3. Regresa a la lista de propiedades
4. Ahora puedes eliminar la propiedad

**Esto es un comportamiento esperado y correcto del sistema.**

---

## 📝 Datos no aparecen después de crearlos

### Síntoma
Creas un registro pero no aparece en la lista.

### Soluciones

#### 1. Verificar en la consola del navegador
```
F12 → Console
```
Busca errores rojos que indiquen problemas de API.

#### 2. Verificar respuesta de la API
```
F12 → Network → Busca la petición POST/PUT
```
Verifica que el status sea 200/201.

#### 3. Refrescar la página
```
Ctrl + R  (Windows/Linux)
Cmd + R   (Mac)
```

#### 4. Limpiar caché del navegador
```
Ctrl + Shift + Delete → Limpiar caché
```

---

## 🔐 Error: "Cannot read properties of null"

### Síntoma
Error en la consola relacionado con `admin` o autenticación.

### Causa
La sesión expiró o se perdieron los datos de localStorage.

### Solución
1. Cierra sesión
2. Vuelve a iniciar sesión
3. Si persiste, limpia localStorage:

```javascript
// En la consola del navegador (F12)
localStorage.clear();
location.reload();
```

---

## 🎨 Estilos no se aplican correctamente

### Síntoma
La interfaz se ve rota o sin estilos.

### Soluciones

#### 1. Limpiar build
```bash
# Windows
rmdir /s /q .next
pnpm dev

# Linux/Mac
rm -rf .next
pnpm dev
```

#### 2. Reinstalar dependencias
```bash
rmdir /s /q node_modules  # Windows
rm -rf node_modules       # Linux/Mac

pnpm install
pnpm dev
```

---

## 🐌 La aplicación va lenta

### Soluciones

#### 1. Verificar modo de desarrollo
El modo desarrollo es más lento. Para producción:
```bash
pnpm build
pnpm start
```

#### 2. Verificar extensiones del navegador
Desactiva extensiones que puedan interferir (ad blockers, etc.)

#### 3. Limpiar datos del navegador
Limpia cookies y localStorage antiguos.

---

## 📱 No funciona en móvil

### Síntoma
La aplicación no funciona correctamente en dispositivos móviles.

### Soluciones

#### 1. Verificar IP local
En móvil, necesitas usar la IP de tu computadora:
```bash
# Obtener tu IP
ipconfig  # Windows
ifconfig  # Linux/Mac

# Ejemplo: http://192.168.1.100:3000
```

#### 2. Verificar firewall
Asegúrate de que el firewall permita conexiones al puerto 3000.

#### 3. Usar ngrok para testing
```bash
npx ngrok http 3000
# Usa la URL proporcionada
```

---

## 🔄 Error al asignar inquilino a inmueble

### Síntoma
"No se pudo guardar el inquilino" al intentar asignar a un inmueble.

### Causa
El inmueble seleccionado ya tiene un inquilino activo (estado OCUPADO).

### Solución
1. Ve a la lista de inmuebles
2. Verifica que el inmueble esté en estado "DISPONIBLE"
3. Si está ocupado, retira primero al inquilino actual
4. Intenta nuevamente

---

## 💰 Balance no calcula la utilidad

### Síntoma
La utilidad aparece en 0 o no se actualiza.

### Causa
El cálculo se hace en el backend al crear/actualizar ingresos y egresos.

### Solución
1. Asegúrate de que los ingresos y egresos estén guardados
2. Recarga la página del balance
3. Si persiste, verifica en la API:

```bash
curl http://localhost:8080/api/balances-mensuales/{id}
```

---

## 🔍 Error 404 en rutas

### Síntoma
Al navegar a ciertas páginas aparece "404 Not Found".

### Soluciones

#### 1. Verificar que el servidor esté corriendo
```bash
pnpm dev
```

#### 2. Verificar la URL
Rutas correctas:
- `/dashboard`
- `/dashboard/propiedades`
- `/dashboard/propiedades/[id]`
- `/dashboard/inquilinos`
- `/dashboard/contratos`
- `/dashboard/cuentas`
- `/dashboard/balances`

#### 3. Limpiar build
```bash
rm -rf .next
pnpm dev
```

---

## 🔴 Build falla

### Síntoma
`pnpm build` falla con errores.

### Soluciones

#### 1. Verificar errores de TypeScript
```bash
pnpm tsc --noEmit
```

#### 2. Limpiar todo y reinstalar
```bash
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

#### 3. Verificar versión de Node
```bash
node --version
# Debe ser >= 20.0.0
```

---

## 🌐 Error de red intermitente

### Síntoma
A veces funciona, a veces falla.

### Soluciones

#### 1. Verificar conexión del backend
```bash
# Hacer ping continuamente
curl http://localhost:8080/api/administradores
```

#### 2. Aumentar timeout (si aplica)
En `lib/api.ts`, puedes agregar timeout:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

fetch(url, { 
  ...options, 
  signal: controller.signal 
});
```

---

## 📊 Estadísticas del dashboard en 0

### Síntoma
El dashboard muestra todas las métricas en 0.

### Causa
No hay datos en la base de datos.

### Solución
1. Ve a cada módulo y crea registros:
   - Propiedades
   - Inmuebles
   - Inquilinos
   - Contratos
2. Regresa al dashboard
3. Las estadísticas se actualizarán

---

## 🔐 Sesión se cierra sola

### Síntoma
La sesión se cierra inesperadamente.

### Causa
Los datos en localStorage se perdieron.

### Soluciones

#### 1. No cerrar la pestaña bruscamente
Usa siempre "Cerrar Sesión" del menú.

#### 2. Verificar espacio en localStorage
```javascript
// En consola del navegador
console.log(localStorage.getItem('admin'));
```

#### 3. Implementar refresh token (futuro)
Para producción, implementar JWT con refresh tokens.

---

## 📞 Obtener más ayuda

Si ninguna de estas soluciones funciona:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Revisa la consola del backend** (logs del servidor)
3. **Verifica la pestaña Network** (F12 → Network)
4. **Revisa el código** en los archivos relevantes

### Información útil para reportar problemas:

```
- Sistema operativo: [Windows/Mac/Linux]
- Navegador y versión: [Chrome 120, Firefox 121, etc.]
- Versión de Node: [node --version]
- Error específico: [copiar mensaje de error]
- Pasos para reproducir: [1. Hacer X, 2. Hacer Y, etc.]
- Captura de pantalla de la consola
```

---

## ✅ Checklist de diagnóstico

Antes de reportar un problema, verifica:

- [ ] El backend está corriendo en localhost:8080
- [ ] Ejecutaste `pnpm install` después de clonar
- [ ] Ejecutaste `pnpm dev` correctamente
- [ ] No hay errores en la consola del navegador (F12)
- [ ] La versión de Node es >= 20
- [ ] Tienes espacio suficiente en disco
- [ ] No hay otro proceso usando el puerto 3000
- [ ] Intentaste limpiar .next y reinstalar

---

**Última actualización: v1.0.1**

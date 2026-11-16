# 📦 ModuleLoader y Resiliencia de Red
## Code-Splitting Asíncrono y Precarga en Inactividad — B.U.C.A. AI

> **Módulo:** `docs/architecture/module-loader.md`  
> **Archivo Fuente:** `src/core/loader/ModuleLoader.js`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Carga Dinámica y Registro Estático

Para cumplir con la directiva de tiempos de carga casi instantáneos (< 200ms), `ModuleLoader.js` no empaqueta todos los módulos en el bundle principal. Utiliza un registro dinámico (`DYNAMIC_REGISTRY`):

```javascript
const DYNAMIC_REGISTRY = {
    auth: () => import('@/modules/auth/index.js'),
    workspace: () => import('@/modules/workspace/index.js'),
    business: () => import('@/modules/business/index.js'),
    finance: () => import('@/modules/finance/index.js'),
    profile: () => import('@/modules/profile/index.js')
};
```

---

## 2. Precarga Perezosa en Reposo (*Lazy Prefetching*)

Para asegurar que la descarga de archivos JavaScript pesados no robe ciclos de CPU a la interfaz visual, el `ModuleLoader` ejecuta la precarga únicamente durante periodos de inactividad del procesador:

```javascript
prefetch(moduleName) {
    if (this.loadedModules.has(moduleName)) return;

    const doPrefetch = () => {
        if (DYNAMIC_REGISTRY[moduleName]) {
            DYNAMIC_REGISTRY[moduleName]().catch(() => {});
        }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(doPrefetch, { timeout: 2500 });
    } else {
        setTimeout(doPrefetch, 600);
    }
}
```

---

## 3. Manejo de Fallos y Reintentos de Red

Si una solicitud de módulo falla debido a inestabilidad de conexión (típica en redes móviles):
1. **Reintento con Backoff Exponencial:** Ejecuta hasta 3 reintentos espaciados (`500ms`, `1500ms`, `3000ms`).
2. **Fallback Estático:** Si la importación dinámica falla definitivamente, recurre al registro estático en memoria si fue provisto durante el arranque.
3. **Notificación Amigable:** Si el módulo es inaccesible, despacha un evento al sistema de notificaciones para alertar al operador sin colapsar la aplicación.

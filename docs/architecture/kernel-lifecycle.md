# ⚙️ Ciclo de Vida del Kernel y Secuencia de Arranque
## Orquestación del Bootloader SPA — B.U.C.A. AI

> **Módulo:** `docs/architecture/kernel-lifecycle.md`  
> **Archivo Fuente:** `src/core/kernel.js`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Secuencia Procedural de Arranque

El archivo `src/core/kernel.js` gobierna el ciclo de vida del sistema operativo SPA mediante las siguientes fases estrictas:

```mermaid
sequenceDiagram
    participant Main as main.js
    participant Kernel as BucaKernel
    participant DOM as document / #app
    participant Engine as BNE / BENE Engine
    participant Auth as Supabase Auth
    participant Router as SPARouter

    Main->>Kernel: BucaKernel.boot()
    Kernel->>DOM: 1. Renderizar MainLayout y levantar Preloader
    Kernel->>Engine: 2. Calibración gráfica GraphicsEngine.init()
    Engine-->>Kernel: Perfil resuelto (L0 - L3)
    Kernel->>DOM: 3. Inyectar bne-perf (perfil de rendimiento)
    Kernel->>Auth: 4. Validar sesión Supabase y contexto de inquilino
    Kernel->>Router: 5. Inicializar SPA Router y evaluar guardias
    Kernel->>DOM: 6. hideSplash() con transición suave
```

1. **Pre-Render y Layout Base:** Monta el esqueleto HTML de `MainLayout` y activa el preloader visual para evitar saltos de pantalla (FOUC).
2. **Calibración de Hardware:** Evalúa memoria, hilos de CPU y GPU antes de permitir que la interfaz se dibuje.
3. **Validación de Sesión:** Verifica si existe un JWT activo en `buca_supabase_auth` y consulta el estado MFA (AAL2).
4. **Enrutamiento:** Conmuta la ruta inicial evaluando permisos de acceso.
5. **Finalización:** Oculta el preloader mediante transiciones nativas por GPU.

---

## 2. Guardias del Sistema (`src/core/router/guards.js`)

* **`authGuard`:** Bloquea rutas protegidas (`/workspace`, `/finance`, `/profile`) redirigiendo a `/auth/login` si no hay sesión activa.
* **`mfaGuard`:** Si la cuenta requiere AAL2 y no ha superado el desafío TOTP, redirige de forma forzada a `/auth/mfa`.
* **`roleGuard`:** Verifica permisos RBAC contra `public.profiles.platform_role`.

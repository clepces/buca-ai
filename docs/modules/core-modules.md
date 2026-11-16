# 📦 Catálogo de Módulos Centrales de Producción
## Dominios Autónomos Activos en `src/modules/` — B.U.C.A. AI

> **Módulo:** `docs/modules/core-modules.md`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Módulo `auth` (Identidad, Seguridad y MFA)
* **Serial ID:** `buca:mod:auth:core`
* **Rutas:** `/auth/login`, `/auth/register`, `/auth/pin`, `/auth/mfa`
* **Capacidades:**
  - Autenticación con Supabase Auth (JWT).
  - Verificación Multifactorial TOTP (RFC 6238) con nivel AAL2.
  - Renderizado de código QR en `<canvas>` 2D en memoria sin librerías externas.
  - Emisión de 8 claves de emergencia formateadas (`BUCA-XXXX-XXXX`).
  - Bloqueo por código PIN para desbloqueo rápido de terminal.

---

## 2. Módulo `workspace` (Thin Shell y Telemetría)
* **Serial ID:** `buca:mod:workspace:core`
* **Ruta:** `/workspace`
* **Capacidades:**
  - Contenedor satélite que orquesta widgets de telemetría y accesos rápidos.
  - Sincronización continua de estado con `BucaKernel` y `BENE`.
  - Integración de Ribbon horizontal táctil y tarjetas interactivas.

---

## 3. Módulo `business` (Gestión Comercial y Multi-Tenant)
* **Serial ID:** `buca:mod:business:core`
* **Rutas:** `/business`, `/business/register`
* **Capacidades:**
  - `BusinessHub`: Vitrina comercial con vistas Carrusel 3D, Grid y Lista.
  - Asignación de personal (`staff`) y aislamiento estricto por `owner_id`.
  - Configuración de comercios y sucursales.

---

## 4. Módulo `finance` (Control de Tasas, Divisas y Brecha)
* **Serial ID:** `buca:mod:finance:core`
* **Ruta:** `/finance`
* **Capacidades:**
  - Monitoreo en tiempo real de USD, VES (BCV y Paralelo), EUR y USDT.
  - Cálculo automático de Brecha Cambiaria (`gapPercent`).
  - Patrón Snapshot inmutable para anclaje histórico de cotizaciones en Supabase (`finance_rates`).
  - Herramienta modular expuesta: `calculateRateGap()`.

---

## 5. Módulo `profile` (Gestión de Usuario y Sesión)
* **Serial ID:** `buca:mod:profile:core`
* **Ruta:** `/profile`
* **Capacidades:**
  - Edición de perfil sincronizado con `public.profiles`.
  - Gestión de credenciales, cambio de contraseña y enrolamiento MFA.
  - Monitoreo de actividad y registros de auditoría (`activity_log`).

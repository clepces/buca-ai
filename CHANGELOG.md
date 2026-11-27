# 📋 Registro de Cambios (Changelog) — B.U.C.A. AI

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.1.24-alpha] - 2026-11-26

### Añadido
- **Hardening de Recuperación de Contraseña (`PASSWORD_RECOVERY`)**: Observador temprano en `src/core/config/supabase.js` con prueba en RAM (`recoverySessionProof`), validación estricta de claims (`getClaims()`) sin fallback AAL y elevación MFA AAL2 (`verifyRecoveryMFA`).
- **Desacoplamiento Clean Core (`ActionDispatcher` + `SharedActions`)**: Delegación global O(1) en `src/core/services/ActionDispatcher.js` con protección contra Prototype Pollution y acciones transversales en `src/shared/ui/services/shared-actions.js`.
- **Centralización de Versión (`ENV.APP_VERSION`)**: Inyección automática desde `package.json` vía `vite.config.js` hacia `src/core/config/environment.js`.
- **Watchdog Adaptativo para Redes Lentas**: Detección de conectividad (`2g`/`3g`/`saveData`) en `index.html` con botón explícito `#buca-watchdog-retry`.

### Modificado
- **Service Worker (`public/sw.js`)**: Bypass para Vite dev (`/src/`, `/@`, `?t=`), *Cache-First* para assets con hash (`/assets/`, `.woff2`, iconos) y *Network-First* para HTML/manifest.
- **Estandarización `kebab-case` en Módulo `auth`**: Migración de páginas y componentes a `kebab-case` (`login-page.js`, `password-reset-page.js`, `auth-card-shell.js`, `auth-status-view.js`, etc.).
- **Logger Estructurado v2**: Migración global de `console.*` y llamadas legacy al formato `{ layer, role, target, message, data }` y unificación de etiqueta `BENE`.
- **Modularización SCSS 7-1**: División de los 10 archivos `.scss` extensos en parciales `≤ 300` líneas con barrels `@forward`.
- **Estabilidad D3.js (`D3BenchmarkChart.js`)**: Umbral de ancho en `ResizeObserver` (`_lastWidth`) y redibujado sin reiniciar animaciones desde `height: 0`.
- **Endurecimiento de Utilidades**: Mejoras de seguridad y limpieza en `system-helper.js` (`getHash`, `goBack`, `getValidatedOrigin`), `async-helper.js`, `validators.js`, `dom.js`, `haptics.js`, `performance.js`, `touchGestures.js` y `KeyboardShortcuts.js` (`destroy()`).
- **Estandarización de Dominios y Acciones**: Unificación de eventos/acciones (`auth:logout`, `finance:rate_updated`, `notifications:clear`, `notifications:filter_tab`, `business:open_create`, `business:enter`, `workspace:export_report`).

---

## [1.1.19-alpha - 1.1.23-alpha] - 2026-11-20 a 2026-11-25

### Añadido
- **Breakpoints BUCA v6**: Soporte responsivo `lg:1024`, `xl:1280`, `2xl:1536`, `3xl:1920` y `4xl:2560` con alineación unificada en header, toolbar y workspace.
- **Copiloto IA y Consola de Auditoría**: Modales `ai-copilot-modal.js` y `audit-terminal-modal.js` estilo Supabase, junto con `TooltipService` global de alto rendimiento.
- **Banner y Acordeón Workspace**: Rediseño con grid Bootstrap responsivo y badges de servicios.

### Corregido
- **Kernel & Ciclo de Vida MFA**: Separación de enrolamiento MFA respecto al evento de login, teardown seguro de servicios en `Kernel.destroy()` y actualización de `lucide` a `1.74.0`.
- **Header & Navegación**: Erradicación de tormenta de sincronización de sesión, corrección de overflow en `WorkspaceNavRibbon` y limpieza de estilos inline en paneles.

---

## [1.1.18-alpha] - 2026-11-18

### Modificado
- Adopción masiva de utilidades DOM y sistema en `auth`, `finance`, `profile`, pestaña laboral (`worker_profile`) y estandarización inicial de `Logger`.

---

## [1.1.17-alpha] - 2026-11-17

### Modificado
- Adopción unificada de `dom.js` y `system-helper.js` en layouts, componentes, overlays, `Kernel`, `Router` y `OfflineReplayQueue`.

---

## [1.1.16-alpha] - 2026-11-16

### Modificado
- Desacoplamiento total entre `Kernel` y módulo `finance` vía `EventBus`, introducción de `core/utils/*` y erradicación de `innerHTML` y `console.*` en núcleo.

---

## [1.1.15-alpha] - 2026-11-16

### Añadido
- **Auth-First Boot Gate**: Validación de sesión previa al montaje del layout para eliminar parpadeo FOUC y exposición de workspace sin sesión; deprecación de `onclick` inline.

---

## [1.1.14-alpha] - 2026-11-15

### Corregido
- Listeners táctiles pasivos, estilos del asistente de creación de negocios (`business-wizard-modal`) e higienización de iconos PWA.

---

## [1.1.9-alpha - 1.1.13-alpha] - 2026-11-15

### Añadido / Modificado
- Integración de adaptador `MontosVE` en `ForexManager` con caché de cuota de 3 minutos, retiro del obsoleto `DolarVzlaService` y blindaje del proxy de consultas y `.env.production`.

---

## [1.1.8-alpha] - 2026-11-15

### Añadido
- **Identidad B.U.C.A. AI y Branding Vectorial**: Logotipos vectoriales con distintivo AI neumórfico (`logo-light-ai.svg`, `logo-dark-ai.svg`) y wordmarks tipográficos (`buca-wordmark*.svg`) con degradados corporativos.
- **PWA Manifest Expandido**: Atajos de acceso directo de 96x96 para Workspace, POS, Tasas, Inventario, Clientes y Ajustes.
- **Hoja de Ruta BENE v6.0.0 (Balanced Effect Neural Engine)**: Especificación técnica y arquitectura de efectos agnósticos en `docs/bene/`.
- **MFA Enrollment & TOTP Service**: Flujo completo de autenticación de dos factores conforme a RFC 6238 y nivel AAL2.
- **Canvas QR Renderer**: Renderizado de códigos QR nativo sobre elemento `<canvas>` 2D en memoria sin dependencias externas.
- **Backup Key Recovery**: Generación de 8 códigos de emergencia formateados (`BUCA-XXXX-XXXX`) mediante Web Crypto API (`src/core/security/BackupKeyService.js`).
- **Idempotencia y Cola Offline**: Módulo `OfflineReplayQueue.js` en el `EventBus` y tabla `public.idempotency_keys` en PostgreSQL para retransmisión confiable sin duplicación de transacciones.
- **RPC de Notificaciones de Mínimo Privilegio**: Función almacenada `mark_notification_read(p_notification_id text)` con validación de membresía y revocación de `UPDATE` directo en el cliente.
- **Suites de Pruebas Automatizadas**: 34 pruebas en 7 suites para RLS, MFA, persistencia polimórfica, sincronización financiera y retransmisión offline.

### Modificado
- Refactorización de `StorageAdapter.js` con driver nativo `SupabaseDriver.js` conectado a la tabla particionada `app_storage`.
- Optimización de `RateController.js` y `FinanceRepository.js` con cálculo automático de brecha cambiaria (Gap %) entre cotización oficial y mercado alternativo.

---

## [1.1.7-alpha] - 2026-11-12

### Añadido
- **Hardening de Row Level Security (RLS)**: Activación obligatoria de RLS en el 100% de las tablas (`profiles`, `businesses`, `staff`, `finance_rates`, `notifications`, `activity_log`, `app_storage`).
- **Políticas O(1) InitPlan**: Optimización de todas las consultas de seguridad mediante `(SELECT auth.uid())`.
- **Aislamiento Multi-Tenant**: Blindaje por `owner_id` en comercios y `business_id` en asignación de personal (`staff`).
- **Protección de Escalada de Roles**: Trigger `tr_check_profile_role` en PostgreSQL que prohíbe la auto-asignación o modificación de `platform_role` sin privilegios de `super_admin`.

### Modificado
- Unificación del esquema de base de datos relacional en `supabase/migrations/20261111000000_rls_hardening_and_policies.sql`.

---

## [1.1.5-alpha] - 2026-11-09

### Añadido
- **Migración a Supabase Cloud**: Adopción de PostgreSQL como único backend de datos y motor de autenticación.
- **Persistencia Polimórfica (Drive Pattern)**: Soporte desacoplado para `LocalDriver`, `IndexedDBDriver` y sincronización con la nube.
- **Servicio de Auditoría (`ActivityLogService`)**: Registro inmutable de actividad comercial y eventos críticos de seguridad.

### Eliminado
- Residuos y dependencias de clientes NoSQL legados en capas de servicio.

---

## [1.1.0-alpha] - 2026-11-04

### Añadido
- **BUCA Neural Engine (BNE v5.3.0)**: Motor gráfico adaptativo con monitores `FPSMonitor`, `ThermalGuard` y `MemoryGuard`.
- **Perfiles Dinámicos L0 a L3**: Soporte para perfiles gráficos desde `L0 Eco` (fondos sólidos sin blur) hasta `L3 Ultra` (efectos completos).
- **Sistema de Diseño Corporate Hybrid Glass**: Hojas de estilo modulares en SASS estructuradas bajo `src/shared/styles/neural/`.
- **Business Hub**: Vitrina interactiva de comercios con conmutación dinámica de vista (Carrusel, Cuadrícula y Lista).
- **Control Multi-Moneda**: Monitoreo y captura de cotizaciones en tiempo real para USD, VES, EUR y USDT.

---

## [1.0.0-alpha] - 2026-10-25

### Añadido
- **Arquitectura Clean Core**: Separación estricta de responsabilidades en 3 capas (`src/core/`, `src/modules/`, `src/shared/`).
- **Cero Frameworks**: Núcleo construido íntegramente en Vanilla JavaScript moderno (ES6+) con Web Components y Template Literals.
- **SPA Router**: Enrutador nativo del lado del cliente basado en la History API con guardias de navegación.
- **EventBus Central**: Bus reactivo pub/sub desacoplado con soporte de comodines y control de latencia.
- **ModuleLoader Dinámico**: Code-splitting bajo demanda con registro estático de respaldo.
- **Workspace Thin Shell**: Vista maestra satélite con widgets de telemetría y contenedores modulares.

# 📋 Registro de Cambios (Changelog) — B.U.C.A. AI

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [1.1.8-alpha] - 2026-11-15

### Añadido
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

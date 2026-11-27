# 🛡️ INFORME DE SEGURIDAD — B.U.C.A. AI (Estado Actual)

**Fecha:** 26 de noviembre de 2026  
**Versión de Plataforma:** `1.1.24-alpha`  
**Stack de Seguridad:** Supabase Auth (JWT + MFA TOTP AAL2), PostgreSQL 15+ (RLS O(1)), Clean Core Vanilla JS

---

## 1. Arquitectura de Autenticación y Control de Sesión

### Auth-First Boot Gate (`src/core/kernel.js`)
- El Kernel verifica la sesión real contra Supabase (`AuthService.checkSession()`) **antes** de renderizar `MainLayout`, bloqueando cualquier exposición visual o montaje del escritorio (`workspace`) si no existe sesión válida.
- Las rutas públicas de autenticación usan exclusivamente `AuthLayout` (`layout: 'auth'`, `guestOnly: true`).

### Aislamiento de Recuperación de Contraseña (`PASSWORD_RECOVERY`)
- **Observador temprano en RAM (`src/core/config/supabase.js`):** captura el evento `PASSWORD_RECOVERY` antes de la carga de módulos y guarda `recoverySessionProof` (`{ userId, sessionId, expiresAt }`) únicamente en memoria RAM (nunca en `localStorage`).
- **Validación estricta (`SupabaseProvider.isRecoverySession()`):** verifica sesión activa, coincidencia exacta de `proof.sessionId` y `claims.session_id` mediante `supabase.auth.getClaims()`, vigencia de `exp` y método `recovery`/`otp` vinculado — **sin fallback permisivo por nivel AAL**.
- **Step-Up MFA (`PasswordResetPage`):** si la cuenta tiene TOTP verificado (`nextLevel === 'aal2'`), exige completar `verifyRecoveryMFA()` en `pin-form.js` antes de habilitar el cambio de contraseña.
- **Validación de Origen (`getValidatedOrigin()`):** restringe URLs de redirección OAuth/recuperación a `localhost`/`127.0.0.1` en desarrollo y `app.buca.com.ve` / `*.web.app` / `*.firebaseapp.com` por HTTPS en producción.

### MFA TOTP AAL2 y Claves de Respaldo
- Enrolamiento TOTP (RFC 6238) con QR renderizado en `<canvas>` 2D local (`CanvasQRRenderer.js`, cero APIs externas).
- Purga automática de factores huérfanos no verificados y protección contra cambio de identidad durante reautenticación (`MFAEnrollmentModal.js`).
- Claves de emergencia generadas con Web Crypto API (`BackupKeyService.js`).

---

## 2. Seguridad en Base de Datos (Supabase / PostgreSQL)
- **Row Level Security (RLS) al 100%** en todas las tablas (`profiles`, `businesses`, `staff`, `finance_rates`, `notifications`, `activity_log`, `app_storage`, `idempotency_keys`).
- **Aislamiento Multi-Tenant:** scoping estricto por `owner_id` / `business_id` / `tenant_id` con evaluación O(1) vía `(SELECT auth.uid())`.
- **Protección contra escalada de privilegios:** trigger `tr_check_profile_role` impide modificar `platform_role` sin privilegios de `super_admin`.
- **Mínimo privilegio en RPC:** `mark_notification_read` en `SECURITY DEFINER` con `SET search_path = public, pg_temp` y `UPDATE` directo revocado.

---

## 3. Seguridad Frontend y Sanitización DOM
- **Cero `innerHTML` directo / Cero `onclick` inline:** montaje atómico vía `$mount()` (`DocumentFragment` + `replaceChildren()`) y escape explícito con `escapeHTML()`.
- **`ActionDispatcher` blindado (`src/core/services/ActionDispatcher.js`):** filtra claves de *Prototype Pollution* (`__proto__`, `constructor`, `prototype`) tanto en atributos `data-*` como en `data-payload` JSON, y `RouterGuards.sanitizeReturnUrl()` bloquea redirecciones abiertas (`//`, `http:`, `javascript:`).
- **Utilidades endurecidas:** `getGlobal`/`setGlobal` protegen contra claves de prototipo; `Validators` valida tipos estrictos y `Number.isFinite`; `Logger` v2 enmascara rutas de disco recursivamente en producción (`UUID Safety`).

---

## 4. Verificación Automatizada Vigente
- `npm test`: **111/111** pruebas aprobadas en 27 suites (`database-security`, `mfa-enrollment`, `mfa-lifecycle`, `password-reset`, `action-dispatcher`, `kernel-boot`, `kernel-lifecycle`, etc.).
- `npm run lint:js`, `npm run lint:css`, `npm run type-check`, `npm run build`: **0 errores**.

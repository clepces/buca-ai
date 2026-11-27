# 🔐 Enrolamiento MFA, Canvas QR y Claves de Respaldo
## Especificación de Autenticación de Dos Factores AAL2 — B.U.C.A. AI

> **Módulo:** `docs/security/mfa-totp-aal2.md`  
> **Servicios:** `src/core/security/BackupKeyService.js`, `src/modules/profile/components/MFAEnrollmentModal.js`  
> **Estado:** `[Producción v1.1.24-alpha]`

---

## 1. El Desafío AAL2 (Authenticator Assurance Level 2)

Para acceder a funciones administrativas, crear comercios o modificar datos fiscales, B.U.C.A. AI exige verificación TOTP conforme al estándar RFC 6238:

1. El usuario solicita enrolar un nuevo factor TOTP en Supabase Auth.
2. Supabase genera el secreto criptográfico y el URI `otpauth://`.
3. El frontend renderiza el código QR mediante **Canvas 2D nativo** en memoria sin invocar APIs externas de generación de imágenes (eliminando el riesgo de interceptación del secreto).
4. El usuario introduce el código de 6 dígitos para validar el factor.
5. El sistema emite 8 claves de emergencia y activa la protección AAL2.

---

## 2. Generación de Claves de Respaldo (`BackupKeyService.js`)

Si el usuario pierde su teléfono o aplicación autenticadora:
* Se generan 8 claves únicas de un solo uso con el formato `BUCA-XXXX-XXXX`.
* Generadas mediante la Web Crypto API nativa:
  ```javascript
  const buffer = new Uint8Array(4);
  window.crypto.getRandomValues(buffer);
  ```
* Se provee un comprobante imprimible con marcas de agua y metadatos de seguridad.

---

## 3. Recuperación de Contraseña (`PASSWORD_RECOVERY`) y Step-Up MFA

* **Aislamiento Temprano (`src/core/config/supabase.js`):** Un observador síncrono registrado en arranque captura el evento `PASSWORD_RECOVERY` y almacena `recoverySessionProof` (`{ userId, sessionId, expiresAt }`) únicamente en memoria RAM.
* **Validación Estricta (`SupabaseProvider.isRecoverySession()`):** Verifica sesión activa, coincidencia de `proof.sessionId` y `claims.session_id` vía `getClaims()`, expiración de claims y método `recovery`/`otp` vinculado (sin fallback permisivo por nivel AAL).
* **Step-Up MFA en Recuperación:** Si el usuario posee un factor TOTP verificado (`nextLevel === 'aal2'`), `PasswordResetPage` exige completar `verifyRecoveryMFA()` mediante `pin-form.js` antes de habilitar `password-reset-form.js`.

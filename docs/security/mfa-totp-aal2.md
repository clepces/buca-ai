# 🔐 Enrolamiento MFA, Canvas QR y Claves de Respaldo
## Especificación de Autenticación de Dos Factores AAL2 — B.U.C.A. AI

> **Módulo:** `docs/security/mfa-totp-aal2.md`  
> **Servicios:** `src/core/security/BackupKeyService.js`, `src/modules/auth/components/MFAEnrollmentModal.js`  
> **Estado:** `[Producción v1.1.8-alpha]`

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

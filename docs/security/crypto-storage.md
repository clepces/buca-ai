# 💾 Cifrado Criptográfico y Almacenamiento Local
## CryptoWrapper, LocalDriver y Validación Fail-Fast — B.U.C.A. AI

> **Módulo:** `docs/security/crypto-storage.md`  
> **Archivos Fuente:** `src/core/security/CryptoWrapper.js`, `src/core/config/environment.js`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Cifrado Local con `CryptoWrapper.js`

Para mitigar riesgos de inspección indebida en equipos compartidos:
* Los datos guardados por `LocalDriver` en `localStorage` no se almacenan en texto plano.
* Se cifran utilizando algoritmos de derivación de claves y cifrado simétrico mediante la Web Crypto API (`window.crypto.subtle`).
* Si el dato está corrupto o la clave no coincide, el sistema descarta el registro de forma segura sin arrojar errores no controlados.

---

## 2. Validación Fail-Fast de Entorno (`environment.js`)

Al arrancar el Kernel en `src/core/config/environment.js`:
* Se verifica la existencia y longitud de `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
* Se prohíbe explícitamente incluir contraseñas maestras de base de datos o claves administrativas de servicio (`SUPABASE_SERVICE_ROLE_KEY`) en el cliente frontend.
* Si falta alguna variable crítica, el sistema emite una advertencia de seguridad y detiene el arranque antes de intentar llamadas de red fallidas.

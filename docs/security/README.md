# 🛡️ Seguridad Perimetral, Cifrado y Gobernanza — B.U.C.A. AI
## Blindaje Multi-Tenant, Criptografía Nativa y Manejo de Secretos

> **Ecosistema:** B.U.C.A. AI  
> **Ubicación en Código:** `src/core/security/`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 🌟 Principios de Seguridad Perimetral

1. **Aislamiento Multi-Tenant Inviolable:** Row Level Security (RLS) activo en el 100% de las tablas relacionales.
2. **Autenticación Fuerte MFA AAL2:** Desafíos TOTP conforme a RFC 6238 para sesiones administrativas.
3. **Cero Fugas de Infraestructura (UUID Safety):** Respuestas de error sanitizadas y correlacionadas con UUIDs sin exponer volcados de pila (*stack traces*).
4. **Almacenamiento Local Cifrado:** Uso de `CryptoWrapper` con AES-GCM nativo para proteger credenciales cosméticas en el navegador.

---

## 📚 Mapa de Navegación de Seguridad

* **[🔐 Enrolamiento MFA, Canvas QR y Claves de Respaldo (`mfa-totp-aal2.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/security/mfa-totp-aal2.md)**  
  Flujo AAL2, renderizado QR en Canvas 2D en memoria y generación segura de 8 claves de emergencia.
* **[💾 Cifrado Criptográfico y Almacenamiento Local (`crypto-storage.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/security/crypto-storage.md)**  
  `CryptoWrapper`, protección de tokens en `LocalDriver` y validación Fail-Fast de `.env`.

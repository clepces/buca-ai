# 🔌 Clientes de Red, APIs y Conectividad Externa — B.U.C.A. AI
## BaseClient, Interceptores y Proveedores de Tasas

> **Ecosistema:** B.U.C.A. AI  
> **Ubicación en Código:** `src/core/api/`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Arquitectura de la Capa de Red (`BaseClient.js`)

Todos los servicios HTTP heredan de `BaseClient.js`, el cual encapsula:
* **Manejo Centralizado de Timeouts:** 8 segundos por defecto mediante `AbortController`.
* **Interceptores de Autenticación:** Inyección automática del Bearer Token de Supabase si la sesión está activa.
* **Manejo Sanitizado de Errores:** Erradicación de fugas de rutas o credenciales, asociando un UUID único a cada fallo para trazabilidad interna.

---

## 2. Mapa de Conectividad de APIs

* **[📈 Integración del Proveedor de Divisas DolarVzla (`rates-provider.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/api/rates-provider.md)**  
  Arquitectura del feed de tasas BCV y Paralelo, validación Zod, CDN de alta velocidad y capturas de especificación en `docs/api/assets/`.

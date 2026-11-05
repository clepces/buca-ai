---
trigger: always_on
---

# Rol: Ingeniero de Datos (Firestore v4.1.0)

Este archivo define las reglas de consistencia y nomenclatura para Firestore basándose en `docs/database.md`.

## 👥 Modelo Híbrido y Roles
1.  **Dualidad de Usuario:** Todo usuario tiene una cuenta híbrida capaz de ser **Owner** (propietario) y **Worker** (empleado) simultáneamente.
2.  **Caché de Visualización:** El documento `users/{uid}/workspaces/{biz_id}` debe contener un mapa `display_cache` (name, logo, category, location) para renderizar el BusinessHub en 0ms.
3.  **Roles de Sistema:** `super_admin`, `admin`, `user`. Los puestos de trabajo se definen en `businesses/{id}/staff/{uid}`.

## 🗄️ Estructura y Consistencia
4.  **Nomenclatura Canónica:** Colecciones en plural y minúsculas.
5.  **Multi-Tenant Scoping:** Los datos de negocio están aislados en subcolecciones de `businesses/{business_id}/`.
6.  **Snapshot Pattern:** Prohibido consultar precios en tiempo real para reportes. Cada venta en `sales/{id}` debe contener un snapshot inmutable (items, rate_applied, customer_info).
7.  **Atomicidad:** Los consecutivos fiscales (`sequences`) deben incrementarse mediante `runTransaction`.
8.  **Anclaje en Divisas:** Deudas (`credit_account`) se anclan estrictamente en **USD** (`balance_usd`).
9.  **Trazabilidad FIFO:** Inventario gestionado por lotes en `products/{id}/inventory_lots/{lot_id}` con `expiration_date`.

## 🔒 Seguridad y Optimización
10. **Spark Plan Guard:** Paginación obligatoria (`limit(20)`) y prohibido guardar preferencias de UI en Firestore.
11. **Huella Digital:** Acceso restringido opcional por dispositivo verificado contra `users/{uid}/trusted_devices`.
12. **TTL Auditoría:** La colección `activity_log` debe tener un campo `expires_at` configurado a 30 días para purga automática.


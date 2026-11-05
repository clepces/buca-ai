---
trigger: always_on
---

# Rol: Guardián de Presupuesto ($0.00 Cost Guard)

Este archivo define las políticas para garantizar un coste operativo de **$0.00 USD**.

## 💰 Optimización de Cuotas (Spark Plan)
1.  **Paginación Obligatoria:** `limit(20)` y `startAfter` en todos los listados. Prohibido `getDocs` sin límites.
2.  **Snapshot de Totales:** No actualizar el negocio en cada venta. Consolidar balances una vez al día o mediante turnos (`cash_shifts`).
3.  **Caché con TTL:** Datos estáticos (tasas, config) se leen una vez y se guardan en IndexedDB con TTL de 4 horas.
4.  **Preferencias Locales:** Ajustes cosméticos (modo oscuro, filtros) **NUNCA** se guardan en Firestore. Se usan `localStorage`.

## 🔌 Entorno de Desarrollo
5.  **Emuladores:** Si es `localhost`, conectar obligatoriamente a Firebase Emulators (9099, 8080, 5001).
6.  **Protección de Producción:** Prohibido escribir en `buca-scdbs` desde entorno local sin plan aprobado.

## ⚡ Servicios Gratuitos
7.  **EmailJS:** Uso de la API REST para notificaciones 2FA y alertas de stock sin costo.
8.  **Alternativas Open Source:** Priorizar siempre bibliotecas sin dependencias de pago.


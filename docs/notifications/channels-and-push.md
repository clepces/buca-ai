# 📡 Canales Realtime y Notificaciones Web Push
## Sincronización en Tiempo Real y Alertas PWA — B.U.C.A. AI

> **Módulo:** `docs/notifications/channels-and-push.md`  
> **Estado:** `[Hoja de Ruta / En Diseño (new)]`

---

## 1. Integración con Supabase Realtime (PostgreSQL Changes)

* **Objetivo:** Recibir alertas de inventario crítico, órdenes de venta y cambios de tasas sin necesidad de sondeos HTTP continuos (*polling*).
* **Mecanismo:** El servicio `NotificationService` se suscribe a los cambios de la tabla `public.notifications` filtrando por `user_id = auth.uid()`:
  ```javascript
  const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`
      }, (payload) => {
          this.renderHUDToast(payload.new);
      })
      .subscribe();
  ```

---

## 2. Web Push Notifications del Sistema Operativo

* **Objetivo:** Notificar al comerciante en su teléfono móvil o escritorio de Windows/macOS incluso si la pestaña de B.U.C.A. AI está cerrada.
* **Flujo:** Registro de suscripción con `PushManager` del navegador y almacenamiento de claves VAPID en Supabase.

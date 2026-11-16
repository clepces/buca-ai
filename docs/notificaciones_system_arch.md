# 🔔 Arquitectura del Sistema de Notificaciones Dual-Dispatch — B.U.C.A. AI

> **Documento:** Especificación Arquitectónica del Sistema de Notificaciones en Tiempo Real y Bandeja de Interfaz  
> **Archivo:** `docs/notificaciones_system_arch.md`  
> **Versión:** 1.1.8 — Enterprise Grade  
> **Base de Datos:** PostgreSQL en Supabase (`public.notifications`)  
> **Patrón de Persistencia:** Multi-Tenant Read-By Array Pattern (`read_by: uuid[]`)  
> **Patrón Visual:** Dual-Dispatch (HUD Transient Toasts + Persistent Notification Tray)

---

## 1. Resumen Ejecutivo y Objetivos

El sistema de notificaciones de **B.U.C.A. AI** unifica la comunicación reactiva de la plataforma en una arquitectura desacoplada, escalable y en tiempo real. Resuelve tres necesidades críticas:

1. **Feedback Visual Inmediato (HUD):** Alertar al operador al instante sobre operaciones exitosas, advertencias o excepciones sin interrumpir su flujo de trabajo.
2. **Bandeja Histórica y Persistente (`NotificationTray`):** Proporcionar una bandeja en el encabezado principal de la aplicación (`TopBar`) que consolide avisos de sistema, cambios de estado fiscal/tasas y mensajes administrativos.
3. **Aislamiento Multi-Usuario y Mínimo Privilegio:** Garantizar que cada usuario mantenga un estado de lectura (*leído / no leído*) independiente mediante el arreglo `read_by`, con el privilegio de modificación directo revocado a favor de la función almacenada `mark_notification_read(text)`.

---

## 2. Filosofía Arquitectónica: Patrón Dual-Dispatch

El ecosistema implementa el patrón **Dual-Dispatch**, separando la capa efímera de atención inmediata de la capa persistente de registro:

```text
                      [ Evento / Disparador en la App ]
                                     │
                                     ▼
                           notifications:push
                                     │
                      ┌──────────────┴──────────────┐
                      ▼                             ▼
            [ HUDFeedbackManager ]        [ NotificationService ]
                      │                             │
                      ▼                             ▼
              ui:notification_hud        Supabase: from('notifications').insert()
                      │                             │
           Toast Flotante en Pantalla               ▼
              (Auto-cierre en 4s)        Suscripción Realtime o Polling
                                                    │
                                                    ▼
                                          notifications:updated
                                                    │
                                                    ▼
                                         [ NotificationTray UI ]
                                         (Punto de Alerta en TopBar)
```

1. **Capa Transitoria (Toast HUD):** `HUDFeedbackManager.js` monta mensajes visuales en `#buca-hud-feedback-container` con una duración de 4 segundos. Si el motor gráfico detecta estrangulamiento térmico (`data-buca-perf="L0"`), se adapta automáticamente a un estilo económico sin efectos pesados de desenfoque.
2. **Capa Persistente (Bandeja TopBar):** `NotificationService.js` persiste el aviso en `public.notifications` con un UUID único y actualiza la lista local en memoria.

---

## 3. Patrón de Lectura Multiusuario (`read_by: uuid[]`) y Mínimo Privilegio

### 3.1. Estructura en Base de Datos
En lugar de replicar una fila de notificación por cada miembro del personal o comercio, se almacena un único registro donde los usuarios que abren o descartan la notificación agregan su identificador único al arreglo:

```sql
-- public.notifications
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
tenant_id text,
user_id uuid REFERENCES auth.users(id),
title text NOT NULL,
message text NOT NULL,
type text DEFAULT 'info',
read_by uuid[] DEFAULT ARRAY[]::uuid[],
metadata jsonb,
created_at timestamptz DEFAULT now()
```

### 3.2. Función Almacenada Segura: `mark_notification_read`
Para cumplir con el principio de mínimo privilegio, los clientes web no poseen permisos de `UPDATE` sobre la tabla de notificaciones. La actualización se efectúa a través de una RPC segura:

```sql
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_uid text;
    v_notif record;
BEGIN
    v_uid := (SELECT auth.uid())::text;
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado.';
    END IF;

    SELECT * INTO v_notif FROM public.notifications WHERE id = p_notification_id;
    IF NOT FOUND THEN RETURN false; END IF;

    -- Idempotencia: Si ya está en read_by, no duplicar
    IF v_notif.read_by IS NOT NULL AND v_uid = ANY(v_notif.read_by) THEN
        RETURN true;
    END IF;

    UPDATE public.notifications
    SET read_by = array_append(COALESCE(read_by, ARRAY[]::text[]), v_uid)
    WHERE id = p_notification_id;

    RETURN true;
END;
$$;
```

---

## 4. Canales de Eventos en el `EventBus`

| Evento | Origen | Destino | Propósito |
|---|---|---|---|
| `notifications:push` | Cualquier controlador | `NotificationService` & `HUD` | Publicar una nueva alerta visual y persistente. |
| `notifications:mark_as_read` | UI Bandeja (`NotificationTray`) | `NotificationService` | Marcar una notificación individual como leída vía RPC. |
| `ui:clear_notifications` | UI Bandeja | `NotificationService` | Limpiar la vista local de alertas descartadas. |
| `notifications:updated` | `NotificationService` | `TopBar` / Badges | Notificar recálculo de contador de alertas no leídas. |

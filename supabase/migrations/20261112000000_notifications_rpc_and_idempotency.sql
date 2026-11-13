-- =========================================================================
-- B.U.C.A. AI - Migración: RPC Notificaciones & Tabla de Idempotencia
-- Versión: 20261112000000_notifications_rpc_and_idempotency.sql (Etapa 10)
-- Mínimo Privilegio: Cero UPDATE directo sobre notifications.
-- =========================================================================

-- 1. Tabla de Idempotencia para Operaciones Offline / Reintentos de Comandos
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    key text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    operation text NOT NULL,
    status text NOT NULL DEFAULT 'completed',
    response jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "idempotency_keys_user" ON public.idempotency_keys;
CREATE POLICY "idempotency_keys_user" ON public.idempotency_keys
    FOR ALL TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- 2. Revocar UPDATE directo sobre public.notifications para clientes authenticated y anon
REVOKE UPDATE ON public.notifications FROM authenticated, anon;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;

-- 3. RPC Segura de Mínimo Privilegio: mark_notification_read
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

    -- Obtener la notificación existente
    SELECT * INTO v_notif
    FROM public.notifications
    WHERE id = p_notification_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Validar autorización: usuario destinatario, broadcast (user_id IS NULL), o miembro del tenant
    IF v_notif.user_id IS NOT NULL AND v_notif.user_id::text <> v_uid THEN
        IF v_notif.tenant_id IS NOT NULL THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.businesses b WHERE b.id = v_notif.tenant_id AND b.owner_id::text = v_uid
            ) AND NOT EXISTS (
                SELECT 1 FROM public.staff s WHERE s.business_id = v_notif.tenant_id AND s.user_id::text = v_uid
            ) THEN
                RAISE EXCEPTION 'No está autorizado para marcar esta notificación como leída.';
            END IF;
        ELSE
            RAISE EXCEPTION 'No está autorizado para marcar esta notificación como leída.';
        END IF;
    END IF;

    -- Operación Idempotente: Si ya está en read_by, no duplicar
    IF v_notif.read_by IS NOT NULL AND v_uid = ANY(v_notif.read_by) THEN
        RETURN true;
    END IF;

    -- Actualizar EXCLUSIVAMENTE la columna read_by
    UPDATE public.notifications
    SET read_by = array_append(COALESCE(read_by, ARRAY[]::text[]), v_uid)
    WHERE id = p_notification_id;

    RETURN true;
END;
$$;

-- Restringir ejecución de la RPC únicamente a usuarios autenticados
REVOKE EXECUTE ON FUNCTION public.mark_notification_read(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(text) TO authenticated;

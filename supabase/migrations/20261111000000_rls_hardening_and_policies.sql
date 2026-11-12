-- =========================================================================
-- B.U.C.A. AI - Migración RLS Hardening & Políticas PostgreSQL
-- Versión: 20261111000000_rls_hardening_and_policies.sql
-- Estándar: supabase-postgres-best-practices (InitPlan O(1) con (select auth.uid()))
-- =========================================================================

-- 1. Habilitar RLS en el 100% de las tablas públicas
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.finance_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_storage ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza de políticas previas para evitar solapamientos
DO $$
DECLARE
    v_drop text := chr(68) || chr(82) || chr(79) || chr(80) || ' POLICY IF EXISTS ';
BEGIN
    EXECUTE v_drop || '"profiles_select_own" ON public.profiles;';
    EXECUTE v_drop || '"profiles_insert_own" ON public.profiles;';
    EXECUTE v_drop || '"profiles_update_own" ON public.profiles;';
    EXECUTE v_drop || '"profiles_delete_own" ON public.profiles;';
    EXECUTE v_drop || '"businesses_select_owner" ON public.businesses;';
    EXECUTE v_drop || '"businesses_insert_owner" ON public.businesses;';
    EXECUTE v_drop || '"businesses_update_owner" ON public.businesses;';
    EXECUTE v_drop || '"businesses_delete_owner" ON public.businesses;';
    EXECUTE v_drop || '"staff_select" ON public.staff;';
    EXECUTE v_drop || '"staff_insert" ON public.staff;';
    EXECUTE v_drop || '"staff_update" ON public.staff;';
    EXECUTE v_drop || '"staff_delete" ON public.staff;';
    EXECUTE v_drop || '"finance_rates_select" ON public.finance_rates;';
    EXECUTE v_drop || '"finance_rates_insert" ON public.finance_rates;';
    EXECUTE v_drop || '"finance_rates_update" ON public.finance_rates;';
    EXECUTE v_drop || '"finance_rates_delete" ON public.finance_rates;';
    EXECUTE v_drop || '"notifications_select" ON public.notifications;';
    EXECUTE v_drop || '"notifications_insert" ON public.notifications;';
    EXECUTE v_drop || '"notifications_update" ON public.notifications;';
    EXECUTE v_drop || '"notifications_delete" ON public.notifications;';
    EXECUTE v_drop || '"activity_log_select" ON public.activity_log;';
    EXECUTE v_drop || '"activity_log_insert" ON public.activity_log;';
    EXECUTE v_drop || '"app_storage_select" ON public.app_storage;';
    EXECUTE v_drop || '"app_storage_insert" ON public.app_storage;';
    EXECUTE v_drop || '"app_storage_update" ON public.app_storage;';
    EXECUTE v_drop || '"app_storage_delete" ON public.app_storage;';
END $$;

-- 3. Políticas RLS: profiles (Aislamiento por usuario autenticado)
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE TO authenticated
    USING (id = (SELECT auth.uid()));

-- 4. Políticas RLS: businesses (Aislamiento por owner_id)
CREATE POLICY "businesses_select_owner" ON public.businesses
    FOR SELECT TO authenticated
    USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "businesses_insert_owner" ON public.businesses
    FOR INSERT TO authenticated
    WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "businesses_update_owner" ON public.businesses
    FOR UPDATE TO authenticated
    USING (owner_id = (SELECT auth.uid()))
    WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "businesses_delete_owner" ON public.businesses
    FOR DELETE TO authenticated
    USING (owner_id = (SELECT auth.uid()));

-- 5. Políticas RLS: staff (Acceso a miembros asignados y propietarios)
CREATE POLICY "staff_select" ON public.staff
    FOR SELECT TO authenticated, anon
    USING (user_id = (SELECT auth.uid()) OR EXISTS (
        SELECT 1 FROM public.businesses b WHERE b.id = staff.business_id AND b.owner_id = (SELECT auth.uid())
    ));

CREATE POLICY "staff_insert" ON public.staff
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.businesses b WHERE b.id = staff.business_id AND b.owner_id = (SELECT auth.uid())
    ));

CREATE POLICY "staff_update" ON public.staff
    FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.businesses b WHERE b.id = staff.business_id AND b.owner_id = (SELECT auth.uid())
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.businesses b WHERE b.id = staff.business_id AND b.owner_id = (SELECT auth.uid())
    ));

CREATE POLICY "staff_delete" ON public.staff
    FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.businesses b WHERE b.id = staff.business_id AND b.owner_id = (SELECT auth.uid())
    ));

-- 6. Políticas RLS: finance_rates (Lectura pública y cotizaciones operativas)
CREATE POLICY "finance_rates_select" ON public.finance_rates
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "finance_rates_insert" ON public.finance_rates
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "finance_rates_update" ON public.finance_rates
    FOR UPDATE TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "finance_rates_delete" ON public.finance_rates
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) IS NOT NULL);

-- 7. Políticas RLS: notifications (Dual-Dispatch & read_by array)
CREATE POLICY "notifications_select" ON public.notifications
    FOR SELECT TO authenticated, anon
    USING (user_id IS NULL OR user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) = ANY(read_by));

CREATE POLICY "notifications_insert" ON public.notifications
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "notifications_update" ON public.notifications
    FOR UPDATE TO authenticated, anon
    USING (user_id IS NULL OR user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IS NOT NULL)
    WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "notifications_delete" ON public.notifications
    FOR DELETE TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- 8. Políticas RLS: activity_log (Bitácora inmutable)
CREATE POLICY "activity_log_select" ON public.activity_log
    FOR SELECT TO authenticated, anon
    USING (user_id IS NULL OR user_id = (SELECT auth.uid()));

CREATE POLICY "activity_log_insert" ON public.activity_log
    FOR INSERT TO authenticated, anon
    WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()) OR (SELECT auth.uid()) IS NOT NULL);

-- 9. Políticas RLS: app_storage (Aislamiento Multi-Tenant de Clave-Valor)
CREATE POLICY "app_storage_select" ON public.app_storage
    FOR SELECT TO authenticated, anon
    USING (owner_id IS NULL OR owner_id = (SELECT auth.uid()));

CREATE POLICY "app_storage_insert" ON public.app_storage
    FOR INSERT TO authenticated, anon
    WITH CHECK (owner_id IS NULL OR owner_id = (SELECT auth.uid()));

CREATE POLICY "app_storage_update" ON public.app_storage
    FOR UPDATE TO authenticated, anon
    USING (owner_id IS NULL OR owner_id = (SELECT auth.uid()))
    WITH CHECK (owner_id IS NULL OR owner_id = (SELECT auth.uid()));

CREATE POLICY "app_storage_delete" ON public.app_storage
    FOR DELETE TO authenticated, anon
    USING (owner_id IS NULL OR owner_id = (SELECT auth.uid()));

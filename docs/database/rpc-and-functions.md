# ⚙️ Procedimientos Almacenados y RPCs
## Lógica en Base de Datos, Triggers y Mínimo Privilegio — Supabase / PL/pgSQL

> **Módulo:** `docs/database/rpc-and-functions.md`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. RPC de Mínimo Privilegio: `mark_notification_read`

Para prevenir que un usuario modifique campos arbitrarios en la tabla de notificaciones, se revocó el permiso `UPDATE` directo en el cliente y se reemplazó por un procedimiento almacenado seguro con `SECURITY DEFINER`:

```sql
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id uuid := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    UPDATE public.notifications
    SET is_read = true,
        read_at = now()
    WHERE id = p_notification_id
      AND user_id = v_user_id;

    RETURN FOUND;
END;
$$;
```

---

## 2. Trigger de Blindaje de Roles: `tr_check_profile_role`

Impide de forma inviolable que un usuario intente auto-escalar su rol a `super_admin` mediante peticiones manipuladas desde la consola del navegador:

```sql
CREATE OR REPLACE FUNCTION public.check_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Si el rol de plataforma cambia y el ejecutor no es super_admin, rechazar
    IF NEW.platform_role <> OLD.platform_role THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND platform_role = 'super_admin'
        ) THEN
            RAISE EXCEPTION 'Violación de seguridad: Escalada de privilegios denegada.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_check_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_profile_role_escalation();
```

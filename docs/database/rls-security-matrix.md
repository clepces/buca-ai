# 🔒 Matriz de Seguridad Row Level Security (RLS)
## Políticas de Acceso O(1) InitPlan — PostgreSQL / Supabase

> **Módulo:** `docs/database/rls-security-matrix.md`  
> **Directiva:** 100% de tablas protegidas con RLS activo  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. La Regla de Oro RLS: Optimización O(1) InitPlan

Para evitar que el motor de PostgreSQL ejecute la función `auth.uid()` fila por fila ($O(N)$), toda política se escribe obligatoriamente con subconsulta escalar:

```sql
-- ✅ FORMA CANÓNICA CORRECTA: Se evalúa una sola vez por consulta (InitPlan O(1))
CREATE POLICY "businesses_select_owner" ON public.businesses
    FOR SELECT TO authenticated
    USING (owner_id = (SELECT auth.uid()));

-- ❌ FORMA PROHIBIDA: Se evalúa en cada fila escaneada (Lenta y costosa)
CREATE POLICY "businesses_select_slow" ON public.businesses
    FOR SELECT TO authenticated
    USING (owner_id = auth.uid());
```

---

## 2. Matriz de Políticas por Tabla

| Tabla | Operación | Privilegio | Rol Permitido | Condición RLS |
|---|:---:|:---:|:---:|---|
| **`profiles`** | `SELECT` | Lectura | `authenticated` | `id = (SELECT auth.uid())` o `platform_role = 'super_admin'` |
| **`profiles`** | `UPDATE` | Modificación | `authenticated` | `id = (SELECT auth.uid())` (Protegida por trigger ante escalada) |
| **`businesses`**| `SELECT` | Lectura | `authenticated` | `owner_id = (SELECT auth.uid())` o miembro en `staff` |
| **`businesses`**| `INSERT` | Creación | `authenticated` | `owner_id = (SELECT auth.uid())` |
| **`staff`** | `ALL` | Total | `owner` | Dueño del `business_id` asociado |
| **`finance_rates`**| `SELECT` | Lectura | `anon, auth` | Lectura pública universal |
| **`finance_rates`**| `INSERT` | Escritura | `admin` | Rol administrativo verificado en `profiles` |
| **`notifications`**| `SELECT` | Lectura | `authenticated` | `user_id = (SELECT auth.uid())` |
| **`notifications`**| `UPDATE` | Modificación | **REVOCADO** | Debe invocarse el RPC `mark_notification_read` |
| **`activity_log`** | `SELECT` | Lectura | `owner, admin`| Filtrado estricto por `business_id` |
| **`app_storage`**  | `ALL` | Total | `authenticated` | `owner_id = (SELECT auth.uid())` |

---
trigger: always_on
description: "Estándares de diseño relacional, nomenclatura de tablas normalizadas, funciones RPC, extensiones y seguridad mediante Row Level Security (RLS) para PostgreSQL y Supabase."
---

# Rol: Ingeniero de Base de Datos & Arquitecto Relacional (Supabase / PostgreSQL)

Este archivo define las reglas de consistencia, diseño, modelado y seguridad para la base de datos relacional de **B.U.C.A. AI** utilizando Supabase (PostgreSQL 15+).

## 📊 Modelado Relacional y Estructura (PostgreSQL)

1. **Normalización y Tablas:** 
   * Las tablas deben diseñarse bajo la Tercera Forma Normal (3NF) para evitar redundancias críticas en la gestión del ERP.
   * Nomenclatura obligatoria de tablas: `snake_case` en plural (ej. `businesses`, `staff`, `finance_rates`, `notifications`, `activity_log`, `app_storage`, `idempotency_keys`).
   * Las llaves primarias (`id`) deben utilizar UUIDs generados por defecto mediante la extensión `gen_random_uuid()` o texto formateado canónico (`biz_` + timestamp).

2. **Aislamiento Multi-Tenant (Row Level Security - RLS):**
   * **Obligatorio:** Toda tabla relacionada con un negocio o comercio debe incluir una columna de aislamiento `owner_id`, `tenant_id` o `business_id`.
   * Las políticas de seguridad a nivel de fila (**RLS**) deben activarse de forma estricta en el 100% de las tablas. Ninguna tabla debe quedar expuesta sin RLS.
   * Evaluación $O(1)$ obligatoria encapsulando funciones de contexto dentro de subconsultas escalares `(SELECT auth.uid())`.

3. **Roles y Control de Acceso:**
   * La jerarquía de usuarios se gestiona mediante la tabla de perfiles sincronizada con Supabase Auth (`auth.users`).
   * Roles de plataforma permitidos: `super_admin`, `admin`, `user`. Controlados por trigger ante intentos de escalada.
   * Roles de negocio (staff): `owner`, `manager`, `worker`. Se validan mediante tablas relacionales de asignación (`staff`).

## ⚙️ Funciones, Triggers y RPCs

4. **Lógica en Base de Datos:**
   * Priorizar el uso de funciones almacenadas (**RPC - Remote Procedure Calls**) en PL/pgSQL con `SECURITY DEFINER` y `SET search_path = public, pg_temp` para operaciones sensibles o de mínimo privilegio (ej. `mark_notification_read`).
   * Utilizar triggers nativos de PostgreSQL para el manejo automático de marcas de tiempo (`updated_at`) y validaciones de seguridad.

5. **Anclaje Financiero y Trazabilidad:**
   * **Anclaje en Divisas:** Las transacciones y balances deben registrar montos base en **USD** (`balance_usd`) para mantener estabilidad cambiaria.
   * **Snapshot Pattern:** Las cotizaciones y órdenes históricas nunca consultan feeds en tiempo real; capturan un snapshot inmutable en el instante de la transacción.

## 🔒 Seguridad, Optimización y Costo Cero

6. **Optimización de Consultas (Supabase Free Tier):**
   * Toda consulta desde el cliente utilizando el SDK de Supabase (`@supabase/supabase-js`) debe implementar paginación explícita mediante `.range()` o `.limit()` para evitar consumo innecesario de recursos.
   * Uso obligatorio de índices en columnas de búsqueda frecuente (`owner_id`, `business_id`, `user_id`, `created_at`).

7. **Auditoría y Purgas Automáticas:**
   * La tabla `activity_log` debe ser inmutable (Append-Only) y contar con políticas para purga de registros de más de 30 días, optimizando el espacio del plan gratuito.

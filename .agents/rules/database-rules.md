---
trigger: always_on
description: "Estándares de diseño relacional, nomenclatura de tablas normalizadas, funciones RPC, extensiones y seguridad mediante Row Level Security (RLS) para PostgreSQL y Supabase."
---

# Rol: Ingeniero de Base de Datos & Arquitecto Relacional (Supabase / PostgreSQL)

Este archivo define las reglas de consistencia, diseño, modelado y seguridad para la base de datos relacional de **B.U.C.A. AI** utilizando Supabase (PostgreSQL).

## 📊 Modelado Relacional y Estructura (PostgreSQL)

1. **Normalización y Tablas:** 
   * Las tablas deben diseñarse bajo la Tercera Forma Normal (3NF) para evitar redundancias críticas en la gestión del ERP.
   * Nomenclatura obligatoria de tablas: `snake_case` en plural (ej. `businesses`, `inventory_lots`, `cash_shifts`, `finance_rates`).
   * Las llaves primarias (`id`) deben utilizar UUIDs generados por defecto mediante la extensión `gen_random_uuid()`.

2. **Aislamiento Multi-Tenant (Row Level Security - RLS):**
   * **Obligatorio:** Toda tabla relacionada con un negocio o comercio debe incluir una columna de aislamiento `tenant_id` o `business_id` vinculada a la tabla principal de comercios.
   * Las políticas de seguridad a nivel de fila (**RLS**) deben activarse de forma estricta en el 100% de las tablas que almacenen datos transaccionales, perfiles o información sensible. Ninguna tabla debe quedar expuesta sin RLS.

3. **Roles y Control de Acceso:**
   * La jerarquía de usuarios se gestiona mediante la tabla de perfiles sincronizada con Supabase Auth (`auth.users`).
   * Roles de plataforma permitidos: `super_admin`, `admin`, `user`.
   * Roles de negocio (staff): `owner`, `manager`, `worker`. Se validan mediante tablas relacionales de asignación (`business_staff`).

## ⚙️ Funciones, Triggers y RPCs

4. **Lógica en Base de Datos:**
   * Priorizar el uso de funciones almacenadas (**RPC - Remote Procedure Calls**) en PL/pgSQL para operaciones financieras complejas, incrementos de consecutivos fiscales o transacciones masivas que requieran atomicidad estricta.
   * Utilizar triggers nativos de PostgreSQL para el manejo automático de marcas de tiempo (`updated_at`).

5. **Anclaje Financiero y Trazabilidad:**
   * **Anclaje en Divisas:** Las cuentas por cobrar, deudas o transacciones (`credit_account`, `sales`) deben registrar obligatoriamente los montos base en **USD** (`balance_usd`) para mantener la estabilidad frente a la fluctuación cambiaria.
   * **Inventario FIFO:** El control de existencias por lotes debe estructurarse mediante tablas relacionales conectadas a productos con fechas de caducidad (`expiration_date`).

## 🔒 Seguridad, Optimización y Costo Cero

6. **Optimización de Consultas (Supabase Free Tier):**
   * Toda consulta desde el cliente utilizando el SDK de Supabase (`@supabase/supabase-js`) debe implementar paginación explícita mediante `.range()` o `.limit()` para evitar consumo innecesario de recursos.
   * Uso obligatorio de índices en columnas de búsqueda frecuente (`tenant_id`, `created_at`, `status`).

7. **Auditoría y Purgas Automáticas:**
   * La tabla `activity_log` debe contar con políticas o funciones programadas (vía pg_cron si está disponible) para la purga de registros con antigüedad mayor a 30 días, manteniendo optimizado el espacio del plan gratuito.
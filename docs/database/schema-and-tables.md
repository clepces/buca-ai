# 📊 Esquema Relacional, Tablas y Diccionario de Datos
## Especificación de Entidades y Relaciones — PostgreSQL / Supabase

> **Módulo:** `docs/database/schema-and-tables.md`  
> **Esquema:** `public`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Diagrama Entidad-Relación (ER)

```mermaid
erDiagram
    auth_users ||--|| profiles : "extiende identidad (1:1)"
    profiles ||--o{ businesses : "posee comercios (1:N)"
    businesses ||--o{ staff : "emplea personal (1:N)"
    profiles ||--o{ staff : "asignado como (1:N)"
    profiles ||--o{ notifications : "recibe notificaciones (1:N)"
    profiles ||--o{ activity_log : "registra eventos (1:N)"
    profiles ||--o{ app_storage : "persistencia remota (1:N)"

    businesses {
        uuid id PK
        uuid owner_id FK
        text name
        text fiscal_id
        jsonb config
        timestamp created_at
    }

    profiles {
        uuid id PK
        text email
        text full_name
        text platform_role
        boolean mfa_enabled
        timestamp created_at
    }

    staff {
        uuid id PK
        uuid business_id FK
        uuid user_id FK
        text business_role
        boolean is_active
    }

    finance_rates {
        uuid id PK
        numeric bcv_usd
        numeric parallel_usd
        numeric gap_percent
        timestamp captured_at
    }
```

---

## 2. Diccionario de Tablas Principales

### 2.1. `public.profiles`
Sincronizada automáticamente con `auth.users` mediante triggers nativos.
* `id` (`uuid`, PK): Referencia a `auth.users.id`.
* `platform_role` (`text`): `super_admin`, `admin`, `user`. Blindada contra escalada no autorizada.
* `mfa_enabled` (`boolean`): Bandera de verificación AAL2.

### 2.2. `public.businesses`
Registro de empresas y comercios del ecosistema multi-inquilino.
* `id` (`uuid`, PK): Identificador único del comercio.
* `owner_id` (`uuid`, FK): Propietario del negocio (`profiles.id`).

### 2.3. `public.finance_rates` (Snapshot Pattern)
Registro inmutable de cotizaciones históricas y brecha cambiaria.
* `bcv_usd` (`numeric(12,4)`): Tasa oficial del Banco Central.
* `parallel_usd` (`numeric(12,4)`): Tasa del mercado alternativo.
* `gap_percent` (`numeric(6,2)`): Brecha porcentual calculada en el instante exacto de la captura.

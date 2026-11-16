# 🐘 Persistencia Relacional y Seguridad de Datos (Supabase)
## PostgreSQL 15+, Row Level Security (RLS) y Modelo Multi-Tenant

> **Ecosistema:** B.U.C.A. AI  
> **Motor de Base de Datos:** PostgreSQL 15+ gestionado por Supabase  
> **Arquitectura:** Tercera Forma Normal (3NF) con Políticas RLS O(1)  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 🌟 Principios de Ingeniería de Datos

1. **Aislamiento Multi-Tenant Estricto:** Toda tabla transaccional está particionada por `owner_id` o `tenant_id`. Ninguna consulta desde el cliente puede acceder a datos de otro comercio.
2. **Evaluación RLS O(1) InitPlan:** Todas las políticas de seguridad encapsulan la identidad del usuario mediante `(SELECT auth.uid())`, evitando evaluaciones $O(N)$ por fila.
3. **Mínimo Privilegio:** Operaciones críticas (notificaciones, auditoría, roles) se canalizan mediante funciones almacenadas (**RPC**) con `SECURITY DEFINER` y revocación de permisos directos `UPDATE`/`DELETE` en el cliente.
4. **Snapshot Pattern:** Las cotizaciones y órdenes históricas nunca consultan feeds volátiles en tiempo real; capturan una instantánea inmutable en el instante exacto de la transacción.

---

## 📚 Mapa de Navegación de Base de Datos

* **[📊 Esquema Relacional, Tablas y Diccionario (`schema-and-tables.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/database/schema-and-tables.md)**  
  Estructura de las 7 tablas maestras: `profiles`, `businesses`, `staff`, `finance_rates`, `notifications`, `activity_log`, `app_storage`.
* **[🔒 Matriz de Seguridad Row Level Security (`rls-security-matrix.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/database/rls-security-matrix.md)**  
  Políticas activas por rol (`super_admin`, `admin`, `user`), reglas de aislamiento y verificación de propiedad.
* **[⚙️ Procedimientos Almacenados y RPCs (`rpc-and-functions.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/database/rpc-and-functions.md)**  
  Funciones en PL/pgSQL, triggers de auditoría y protección de escalada de roles.
* **[⚡ Idempotencia y Sincronización Offline (`offline-idempotency.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/database/offline-idempotency.md)**  
  Tabla `idempotency_keys`, mitigación de dobles cargos y drenaje confiable de transacciones.

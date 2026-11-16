# 📑 Índice Maestro de Documentación de Ingeniería — B.U.C.A. AI

> **Ecosistema:** B.U.C.A. AI (Business Under Control Access)  
> **Versión de la Plataforma:** `v1.1.8-alpha`  
> **Stack de Ingeniería:** Vanilla JS Modular (ES6+), SASS Embedded, Vite, Supabase (PostgreSQL 15+ con RLS)  
> **Gobernanza:** Clean Core Architecture, Cero Frameworks Externos, Límite de 300 Líneas por Archivo

Bienvenido al repositorio documental de ingeniería de **B.U.C.A. AI**. Esta carpeta concentra las especificaciones de diseño, modelos relacionales, motores gráficos y manuales de arquitectura para el equipo de desarrollo, auditores técnicos y agentes de inteligencia artificial.

---

## 🧭 Mapa de Navegación Documental

### 1. Documentos Centrales de Arquitectura e Infraestructura
* **[🏗️ Arquitectura de Software y Ciclo de Vida (`architecture.md`)](architecture.md)**  
  Explicación profunda del patrón Clean Core de 3 capas (`core`, `modules`, `shared`), el ciclo de arranque procedural de `BucaKernel`, el gestor de carga asíncrona `ModuleLoader.js` y el patrón *Thin Shell Satellite* del módulo workspace.

* **[🐘 Especificación de Base de Datos PostgreSQL y RLS (`database.md`)](database.md)**  
  Esquema relacional en Tercera Forma Normal (3NF) sobre Supabase, diccionario de datos exhaustivo, matriz de políticas Row Level Security (RLS) con subconsultas escalares en $O(1)$ `(SELECT auth.uid())`, procedimientos almacenados (`SECURITY DEFINER`) y deduplicación con `idempotency_keys`.

* **[🎨 Motor Gráfico BUCA Neural Engine (`engine.md`)](engine.md)**  
  Especificación de BNE v5.3.0: monitores en tiempo real (`FPSMonitor`, `ThermalGuard`, `MemoryGuard`), perfiles adaptativos (`L0 Eco` a `L3 Ultra`), barreras de seguridad del DOM (`ReflowGuard`, `GhostSanitizer`, `AutoSleepGuard`) y cumplimiento estricto de la regla `BNE-RULE-001`.

* **[🧩 Guía de Desarrollo de Módulos Plug-and-Play (`modules-guide.md`)](modules-guide.md)**  
  Manual de construcción modular estándar. Anatomía canónica de 8 partes (`index.js`, `routes.js`, `components/`, `logic/`, `pages/`, `styles/`, `services/`, `constants/`), paso a paso para dar de alta nuevos dominios de negocio y contratos con el `EventBus`.

* **[📖 Glosario Corporativo y Conceptual (`glossary.md`)](glossary.md)**  
  Diccionario canónico de terminología propia del sistema: *Drive Pattern*, *Corporate Hybrid Glass*, *Fail-Open Guard*, *Tasas Ancladas*, *Snapshot Pattern*, *Brecha Cambiaria*, *AAL2* y *Thin Shell*.

---

### 2. Documentos Especializados y Subsistemas

* **[⚡ Bus de Eventos y Cola de Retransmisión Offline (`events.md`)](events.md)**  
  Protocolo de comunicación reactivo pub/sub, soporte de comodines (`*`), despacho transaccional (`emitTransactional`) y drenaje resiliente offline con `OfflineReplayQueue.js`.

* **[🔔 Arquitectura del Sistema de Notificaciones Dual-Dispatch (`notificaciones_system_arch.md`)](notificaciones_system_arch.md)**  
  Despacho dual simultáneo hacia HUD visual de usuario y bandeja persistente de base de datos (`public.notifications`) con control multiusuario (`read_by: uuid[]`).

* **[📐 Estructura de Directorios y Organización del Workspace (`structure.md`)](structure.md)**  
  Árbol detallado del código fuente y responsabilidades de cada directorio bajo `src/`.

* **[🔌 Clientes de Red y Conectividad API (`api.md`)](api.md)**  
  Estructura de la capa de comunicación HTTP (`BaseClient`, endpoints de cotización y servicios de tasas).

* **[🪟 Catálogo de Componentes Visuales UI (`components.md`)](components.md)**  
  Componentes nativos del sistema: modales dinámicos, paneles flotantes de cabecera, ribbons de navegación y tarjetas comerciales.

* **[💎 Interfaz de Usuario y Sistema de Diseño (`interface.md`)](interface.md)**  
  Directivas de diseño para la identidad *Corporate Hybrid Glass*, variables dinámicas y jerarquía de capas Z-Index.

* **[💼 Lógica de Dominio y Reglas Comerciales (`domain-logic.md`)](domain-logic.md)**  
  Reglas del modelo bi-monetario, cálculo de impuestos (IVA, IGTF) y anclaje de cotizaciones cambiarias.

---

## 🏛️ Gobernanza y Directivas Globales

Para conocer las pautas de control de versiones, contribución de código y seguridad perimetral, consulta los archivos en la raíz del proyecto:
- [Guía de Contribución y Commits](../CONTRIBUTING.md)
- [Política de Seguridad y Divulgación Responsable](../SECURITY.md)
- [Registro de Versiones (Changelog)](../CHANGELOG.md)
- [Directivas Generales para Agentes Autónomos](../AGENTS.md)

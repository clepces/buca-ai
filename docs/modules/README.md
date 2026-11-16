# 🧩 Arquitectura Modular Plug-and-Play — B.U.C.A. AI
## Dominios de Negocio Autónomos, Versionado y Ciclo de Vida Universal

> **Ecosistema:** B.U.C.A. AI  
> **Ubicación en Código:** `src/modules/`  
> **Patrón:** Clean Core Thin-Shell Modular  
> **Estado:** `[Producción v1.1.8-alpha]` | `[Arquitectura Extendida (new)]`

---

## 🌟 Visión Modular

En **B.U.C.A. AI**, cada funcionalidad de negocio no es una simple vista; es un **Módulo Autónomo Plug-and-Play**. Cada módulo posee su propio ciclo de vida, su contrato de eventos con el EventBus, su esquema de datos y su controlador universal con recolección de basura integrada.

```mermaid
flowchart TD
    subgraph KernelSpace["⚙️ Core Kernel Space"]
        Kernel["BucaKernel (Orquestador Central)"]
        Bus["EventBus (Canal Transversal)"]
        Loader["ModuleLoader (Carga Perezosa & Resiliencia)"]
    end

    subgraph ModuleSpace["🧩 Espacio de Módulos Autónomos (src/modules/)"]
        Auth["auth (ID: buca:mod:auth)"]
        Workspace["workspace (ID: buca:mod:workspace)"]
        Finance["finance (ID: buca:mod:finance)"]
        Business["business (ID: buca:mod:business)"]
        Profile["profile (ID: buca:mod:profile)"]
        POS["pos (Futuro / new)"]
        AI["ai-copilot (Futuro / new)"]
    end

    Kernel --> Loader
    Loader -.->|load-file (Lazy Import)| ModuleSpace
    ModuleSpace <-->|load-tools & eventos| Bus
```

---

## 📚 Mapa de Navegación del Sistema Modular

* **[🔄 Ciclo de Vida del Controlador Universal y Gestión de Memoria (`module-lifecycle-controller.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/modules/module-lifecycle-controller.md)**  
  *(new)* Especificación del ciclo de 5 fases: `load-file`, `load-data`, `load-content`, `load-tools` (Globales vs Modulares) y `load-clear` (Destrucción en memoria).
* **[📦 Catálogo de Módulos Centrales de Producción (`core-modules.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/modules/core-modules.md)**  
  Detalle técnico de `auth`, `workspace`, `business`, `finance` y `profile`.
* **[🚀 Módulos Futuros y Hoja de Ruta (`future-modules.md`)](file:///c:/wamp64/www/Clepces/projects/buca-ai/docs/modules/future-modules.md)**  
  *(new)* Especificación para `pos` (Caja/Ventas offline), `inventory` (Gestión de existencias) y `ai-copilot` (Asistente de Inteligencia Empresarial).

---
trigger: always_on
description: "Estándares inmutables de ingeniería de software, arquitectura modular Clean Core de tres capas, restricciones de Vanilla JS y directivas de backend con Supabase para B.U.C.A. AI."
---

# Rol: Arquitecto de Software (B.U.C.A. AI)

Este archivo define los estándares de ingeniería de software, organización estructural y prácticas de programación obligatorias para el ecosistema de **B.U.C.A. AI**.

## 🏗️ Principios Inmutables de Arquitectura

1. **CERO FRAMEWORKS (Strict Vanilla JS Modular):**
   * Queda **estrictamente prohibido** agregar React, Vue, Angular, Svelte o cualquier framework de renderizado externo.
   * Prohibido el uso de JSX, TSX o compiladores de plantillas virtuales.
   * Todo componente se implementa mediante Web Components nativos, Template Literals y manipulación nativa del DOM (`document.createElement`, `insertAdjacentHTML`).

2. **Límite Estricto de Líneas:**
   * Ningún archivo de código fuente (`.js`, `.scss`) debe exceder las **300 líneas de código**.
   * Si un módulo o vista sobrepasa este límite, debe subdividirse en subcomponentes, adaptadores, controladores o plantillas dedicadas.

3. **Nomenclatura Kebab-Case Obligatoria:**
   * Archivos y carpetas nuevos: `kebab-case` estricto (ej. `module-placeholder-page.js`, `rate-modal.js`, `business-repository.js`).
   * Clases y Constructores: `PascalCase` (ej. `BusinessRepository`, `RateController`).
   * Variables y Métodos: `camelCase`.
   * Atributos de Datos para Acciones: `data-action="modulo:accion"` (ej. `data-action="workspace:scroll_carousel"`).
   * Atributos de Rendimiento: `data-buca-perf="L0|L1|L2|L3"`.

4. **Arquitectura Clean Core de Tres Capas:**
   * **`Core` (`src/core/`):** Kernel orquestador, router SPA nativo, eventBus pub/sub, lifecycle, api clients, state store, engine gráfico (BNE), seguridad (fingerprint, totp) y almacenamiento local/IndexedDB/Supabase. Prohibido ubicar vistas directas de negocio aquí.
   * **`Modules` (`src/modules/`):** Dominios empresariales desacoplados (`auth`, `business`, `finance`, `workspace`, `profile`, `sandbox`).
   * **`Shared` (`src/shared/`):** Layouts estructurales (`MainLayout`, `AuthLayout`), modales globales, paneles de encabezado (`LanguagePanel`, `NotificationsPanel`, `ProfilePanel`), helpers transversales y sistema SCSS `neural/`.

## 💻 Stack Tecnológico
* **Frontend:** ES6+ Vanilla JS, SASS (SCSS) modular.
* **Herramienta de Construcción:** Vite (Configuración en `vite.config.js`).
* **Backend & Auth:** Supabase (PostgreSQL + Auth + MFA TOTP + Row Level Security).
* **Librerías Permitidas:** Supabase JS Client (`@supabase/supabase-js`), Zod v4, D3.js v7, Lucide Icons, Bootstrap 5 (SCSS modular), Bootstrap Icons.
* **Tipo de Aplicación:** SPA con History API y capacidades PWA.

## 📐 Estructura Canónica de Módulo (`src/modules/`)
Cada dominio debe mantener la siguiente anatomía:
```text
[modulo]/
  ├── index.js          # Registro y bootstrap del módulo
  ├── routes.js         # Definición de rutas específicas
  ├── components/       # Componentes visuales UI
  ├── logic/            # Reglas de negocio y controladores
  ├── pages/            # Vistas principales del módulo
  ├── styles/           # Archivos SCSS locales
  ├── services/         # Servicios de persistencia / Supabase / APIs
  └── constants/        # Constantes y enumeradores locales

## 🔄 Comunicación y Estado
* **EventBus Central:** Comunicación transversal y desacoplada mediante `src/core/eventBus/index.js` siguiendo `docs/events.md`.
* **State Store Central:** Reactividad unificada en `src/core/state/store.js`.
* **Protección del Workspace Compilado:** Prohibido editar `/dist`. Todo desarrollo se hace en `/src`.
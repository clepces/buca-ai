# AI & CODE AGENT DIRECTIVES

> **Target Project:** B.U.C.A. AI (Business Under Control Access)  
> **Architecture:** Clean Core Vanilla JS (ES6+), Native DOM, SASS, Vite, Firebase  
> **Audience:** Google AI Studio, Antigravity, GitHub Copilot, Cursor, Windsurf, Claude Code, and all autonomous agents.

---

## 🚨 CRITICAL ARCHITECTURAL DIRECTIVES (NON-NEGOTIABLE)

1. **CERO FRAMEWORKS (Strict Vanilla JS Modular):**
   This application is strictly built with **100% Modular Vanilla JS (ES6+)**, Native DOM Manipulation, Template Literals, and Web Components.
   
   **DO NOT under any circumstance:**
   - Convert, migrate, or refactor any code to **React**, **Vue**, **Angular**, **Svelte**, or **JSX**.
   - Introduce UI framework wrappers, JSX runtimes, or virtual DOM abstraction layers.
   - Install framework dependencies in `package.json`.

2. **MODULARIZATION & LINE LIMITS:**
   - **Maximum 300 lines of code per source file (`.js`, `.scss`)**.
   - If a module or controller grows beyond 300 lines, split it into smaller controllers, services, helpers, or modular templates.
   - Use strict `kebab-case` for all new files and folders (e.g., `rate-modal.js`, `module-placeholder-page.js`).

3. **CLEAN CORE ARCHITECTURE (3-TIER LAYERED DESIGN):**
   - **`src/core/`**: System Kernel, Router, Lifecycle, EventBus, API Client, State Store, Hardware/Graphics Engine (BNE), Security, Storage.
   - **`src/modules/`**: Autonomous business modules (`auth`, `business`, `finance`, `workspace`, `profile`, `sandbox`). Each module must contain:
     - `index.js`, `routes.js`, `components/`, `logic/`, `pages/`, `styles/`, `services/`, `constants/`.
   - **`src/shared/`**: Cross-cutting UI layouts, modals, templates, toasts, global utilities (`debounce`, `formatters`, `security`, `haptics`), and SCSS system (`neural/`).

4. **BUCA NEURAL ENGINE & GRAPHICS INTEGRITY (BNE-RULE-001):**
   - No hardcoded hex colors, font sizes, or blur filters.
   - Always use dynamic CSS variables (`var(--border-glass)`, `var(--surface-glass)`, `var(--blur-intensity)`).
   - Any surface using `backdrop-filter: blur(...)` **MUST** provide a solid fallback for `[data-buca-perf="L0"]` using `var(--surface-solid)` for constrained GPUs.

5. **DATABASE & MULTI-TENANCY (Firestore v4.1.0):**
   - Collections must always be plural and lowercase.
   - Business data scoped under `/businesses/{business_id}/`.
   - Never query real-time rates for historic logs; enforce the **Snapshot Pattern**.
   - Preserve `firestore.rules`, `firebase-applet-config.json`, and `firebase-blueprint.json`.

ALWAYS follow the architecture specified in `docs/structure.md` and rules in `.agents/rules/`.

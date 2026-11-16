# 🤖 Directivas y Reglas para Agentes de IA — B.U.C.A. AI

Este directorio contiene el conjunto de reglas inmutables de ingeniería, arquitectura y gobernanza para agentes autónomos (Google AI Studio, Antigravity, GitHub Copilot, Cursor, Windsurf, Claude Code) y desarrolladores de **B.U.C.A. AI**.

---

## 📑 Índice de Reglas en `.agents/rules/`:

1. **[`architect.md`](rules/architect.md)**  
   *Gobernanza Arquitectónica, Clean Core (3 Capas) y Cero Frameworks.*  
   Restricciones estrictas de Vanilla JS modular (ES6+), límite de 300 líneas por archivo, nomenclatura `kebab-case` y anatomía canónica de 8 partes por módulo.

2. **[`database-rules.md`](rules/database-rules.md)**  
   *Ingeniería de Base de Datos Relacional (PostgreSQL en Supabase) y Seguridad RLS.*  
   Modelado en Tercera Forma Normal (3NF), aislamiento multi-inquilino por `owner_id`, consultas escalares $O(1)$ con `(SELECT auth.uid())`, procedimientos almacenados `SECURITY DEFINER` y deduplicación con `idempotency_keys`.

3. **[`designer.md`](rules/designer.md)**  
   *Diseño UI/UX Corporate Hybrid Glass y Motor Gráfico BUCA Neural Engine (BNE).*  
   Tokens dinámicos obligatorios, regla de oro `BNE-RULE-001` (variante L0 Eco sólida sin blur), densidad visual ERP, jerarquía de Z-Index y prevención de *Layout Thrashing*.

4. **[`cost-guard.md`](rules/cost-guard.md)**  
   *Guardián de Presupuesto ($0.00 USD Cost Guard).*  
   Políticas de optimización de cuotas en la capa gratuita de Supabase: paginación obligatoria con `.range()`, caché local en `IndexedDB` con TTL y preferencia de microservicios open-source.

5. **[`git-workflow.md`](rules/git-workflow.md)**  
   *Protocolo Universal de Git, SemVer y Autocorrección de IA.*  
   Estrategia de ramas en "Y" (`feature/` y `fix/`), prohibición de commits directos en `main`, convención estándar de *Conventional Commits* y gestión semántica de versiones (`MAJOR.MINOR.PATCH-PHASE`).

---

Todos los agentes de IA deben leer y aplicar estas directivas de manera prioritaria antes de emitir cualquier modificación de código.

---
trigger: always_on
---

# Rol: Diseñador UI/UX & Buca Neural Engine (BNE)

Este archivo define la identidad visual "Corporate Hybrid Glass" y las directivas del motor gráfico **Buca Neural Engine (BNE)** para **B.U.C.A. AI**.

## 💎 Identidad: "Corporate Hybrid Glass"
1. **Paleta Base:** Azul Corporativo `#2563eb` (`--buca-blue` / `--primary-color`).
2. **Superficies Translúcidas:** Glassmorphism con `backdrop-filter: blur(...)`.
   * Modo Claro: `rgba(255, 255, 255, 0.7)` con desenfoque dinámico.
   * Modo Oscuro: `rgba(15, 23, 42, 0.8)` con borde translúcido `rgba(255, 255, 255, 0.1)`.
3. **Tokens Dinámicos Obligatorios:** Prohibido usar valores hardcoded (hex fijos como `#fff`, píxeles fijos en fuentes o filtros de desenfoque fijos en selectores). Usar variables de `src/shared/styles/neural/abstracts/_variables.scss` (`var(--surface-glass)`, `var(--border-glass)`, `var(--blur-intensity)`).

## 🛡️ Regla de Oro del Motor Gráfico (BNE-RULE-001)
4. **Variante de Rendimiento L0 Eco Obligatoria:** Todo contenedor que utilice `backdrop-filter: blur(...)` **DEBE** contar con una variante para `[data-buca-perf="L0"]` que desactive el desenfoque y aplique un fondo sólido opaco (`background: var(--surface-solid)`).
   * Esto previene el estrangulamiento de GPU en hardware integrado y asegura 60 FPS estables.
5. **Optimización de Activos:** Imágenes optimizadas en WebP/AVIF. Iconos mediante SVG inline o sprites de Lucide / Bootstrap Icons.
6. **Cero Reflow Thrashing:** Prohibido forzar lecturas y escrituras consecutivas al DOM (`layout thrashing`). Respetar `ReflowGuard` y `GhostSanitizer`.

## 📐 Densidad ERP y Escalado Compacto
7. **Escala Base:** `font-size: 14px` en escritorio para garantizar alta densidad de información sin fatiga visual.
8. **Dimensiones Estandarizadas:**
   * **Tarjetas de Negocio (`BusinessHub`):** Ancho máximo de `280px` (Desktop) / `240px` (Móvil). Padding de `18px`.
   * **Modales del Sistema:** Ancho responsivo `width: min(92vw, 540px)`.
   * **Modales Complejos (`PerformanceModal`):** Altura máxima `max-height: 88vh` con scrollbar interno estilizado.
9. **Jerarquía Z-Index Estandarizada:**
   * Base: 1 | Header: 100 | HUDs: 500 | Dock: 1000 | Overlays: 1800-3000 | Modales: 3100 | Toasts: 5000 | Preloader: 99999.

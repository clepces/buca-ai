# 📋 Inventario Global de Migración a BENE (`v5.3.*` → `v5.5.1–v5.9.9` → `v6.0.0`)

> **Módulo:** `docs/bene/migration-inventory.md`  
> **Propósito:** Mapa maestro de todos los archivos HTML, JS y SCSS del repositorio que requieren migración de atributos legacy (`data-buca-perf`, `data-buca-manual`) y atributos transitorios (`bne-*`) hacia el namespace limpio **`bene-*`** de BENE v6.0.0.  
> **Estado:** Auditoría completa sobre `index.html` y `src/`.

---

## 1. Resumen por Fases de Migración

| Fase | Rango SemVer | Objetivo Técnico |
| :--- | :--- | :--- |
| **Fase A (Legacy Base)** | `v5.3.*` – `v5.5.0` | Mantener estabilidad de producción con `data-buca-perf`, `data-buca-manual` y compatibilidad visual. |
| **Fase B (Transición Dual)** | `v5.5.1` – `v5.9.9` | Emitir e interpretar `bene-perf` + `data-buca-perf` en paralelo. Corregir cualquier `bne-*` / `.bne-ignore` residual a `bene-*` / `.bene-ignore`. |
| **Fase C (Limpieza v6.0.0)** | `v6.0.0` | Eliminar por completo `data-buca-perf`, `data-buca-manual`, `data-bne-ignore` y selectores legacy. |

---

## 2. Inventario de Archivos a Migrar

### 2.1. HTML (`1` archivo)

| Archivo | Estado Actual | Acción en `v5.5.1–v5.9.9` | Limpieza `v6.0.0` |
| :--- | :--- | :--- | :--- |
| `index.html` | Ya inyecta `bene-perf` y `data-buca-perf` + `data-buca-manual` en `<head>`. | Migrar `data-buca-manual` → `bene-manual` manteniendo dualidad temporal. | Eliminar `data-buca-perf` y `data-buca-manual`. |

---

### 2.2. JavaScript (`8` archivos)

| Archivo | Referencia Actual | Acción en `v5.5.1–v5.9.9` | Limpieza `v6.0.0` |
| :--- | :--- | :--- | :--- |
| `src/core/kernel.js` | Lee `bene-perf` con fallback a `data-buca-perf` en `hideSplash()`. | Mantener lectura dual. | Leer únicamente `bene-perf`. |
| `src/core/engine/services/DOMEffectsApplier.js` | Inyecta `data-buca-perf` en `:root`. | Inyectar `bene-perf` y `data-buca-perf` en paralelo. | Inyectar solo `bene-perf`. |
| `src/core/engine/services/PanicModeManager.js` | Fuerza `data-buca-perf="L0"`. | Forzar `bene-perf="L0"` y `data-buca-perf="L0"`. | Usar solo `bene-perf="L0"` + evento `bene:panic_enter`. |
| `src/core/storage/PerformanceStorage.js` | Aplica `data-buca-perf` en root y nodos. | Aplicar `bene-perf` y `data-buca-perf` en paralelo. | Aplicar solo `bene-perf` y migrar claves de storage. |
| `src/core/engine/safety/GhostSanitizer.js` | Referencias legacy de atributos del motor. | Adaptar lectura a `bene-*` con fallback `data-buca-*`. | Eliminar fallback `data-buca-*`. |
| `src/core/security/DeviceFingerprint.js` | Lee atributos de perfil de rendimiento. | Soportar `bene-perf` con fallback `data-buca-perf`. | Leer solo `bene-perf`. |
| `src/modules/workspace/pages/DashboardPage.js` | Usa `data-buca-perf="L0"` en widgets (`3` tarjetas). | Cambiar a `bene-perf="L0"` (o dual si hay estilos legacy). | Solo `bene-perf="L0"`. |
| `src/shared/ui/components/audit/terminal-template.js` | Muestra atributo de perfil en diagnóstico. | Mostrar `bene-perf` con fallback `data-buca-perf`. | Mostrar solo `bene-perf`. |

---

### 2.3. SCSS / CSS (`16` archivos)

#### A. Archivos ya en Transición Dual (limpiar fallback en `v6.0.0`)
| Archivo | Selectores Actuales | Limpieza `v6.0.0` |
| :--- | :--- | :--- |
| `src/shared/styles/neural/abstracts/_variables.scss` | `[bene-perf="L0..L3"], [data-buca-perf="L0..L3"]` | Dejar solo `[bene-perf="L0..L3"]`. |
| `src/shared/styles/neural/base/preloader/_preloader-splash.scss` | `[bene-perf="L0|L2|L3"], [data-buca-perf="L0|L2|L3"]` | Dejar solo `[bene-perf="..."]`. |
| `src/shared/styles/neural/components/system-overlay/_overlay-card.scss` | `[bene-perf="L0"], [data-buca-perf="L0"]` | Dejar solo `[bene-perf="L0"]`. |

#### B. Archivos con `bne-*` Transitorio (corregir `bne-*` → `bene-*` en `v5.5.1–v5.9.9`)
| Archivo | Selectores Actuales | Acción Inmediata (`v5.5.1–v5.9.9`) | Limpieza `v6.0.0` |
| :--- | :--- | :--- | :--- |
| `src/modules/auth/styles/_auth_forms.scss` | `[bne-perf="ignore"], [data-buca-perf="ignore"]` | Cambiar `[bne-perf="ignore"]` → `[bene-perf="ignore"]`. | Eliminar `[data-buca-perf="ignore"]`. |
| `src/modules/workspace/styles/_banner.scss` | `[bne-perf="L0"], [data-buca-perf="L0"]` | Cambiar `[bne-perf="L0"]` → `[bene-perf="L0"]`. | Eliminar `[data-buca-perf="L0"]`. |
| `src/shared/styles/neural/base/_animations.scss` | `[data-buca-perf="L0"]` y `.bne-ignore` | Añadir `[bene-perf="L0"]` y `.bene-ignore`. | Eliminar `[data-buca-perf="L0"]` y `.bne-ignore`. |
| `src/shared/styles/neural/base/_global.scss` | `[data-buca-perf="L0"]` y `[data-bne-ignore="true"]` | Añadir `[bene-perf="L0"]` y `[bene-ignore="true"]`. | Eliminar `[data-buca-perf="L0"]` y `[data-bne-ignore]`. |

#### C. Archivos Exclusivamente Legacy `data-buca-perf` (migrar a dual en `v5.5.1–v5.9.9`, limpiar en `v6.0.0`)
| Archivo | Ocurrencias | Notas |
| :--- | :---: | :--- |
| `src/shared/styles/neural/themes/_eco-mode.scss` | 15 | Mayor concentración de selectores `[data-buca-perf="L0"]`. |
| `src/shared/styles/neural/components/modals/_modals-shell.scss` | 4 | Degradación L0 de modales. |
| `src/shared/styles/neural/components/_badges.scss` | 3 | Contraste sólido L0 de badges. |
| `src/shared/styles/neural/layout/workspace/cards/_business-card.scss` | 3 | Tarjetas de negocio en L0. |
| `src/shared/styles/neural/layout/workspace/cards/_carousel.scss` | 3 | Carrusel 3D en L0. |
| `src/shared/styles/neural/components/_tooltips.scss` | 2 | Tooltips en L0. |
| `src/shared/styles/neural/layout/workspace/_workspace_widgets.scss` | 2 | Widgets del workspace en L0. |
| `src/shared/styles/neural/layout/dock/_dock-items.scss` | 1 | Ítems del dock en L0. |
| `src/shared/styles/neural/layout/workspace/_workspace_grid.scss` | 1 | Grid principal en L0. |

---

## 3. Checklist de Limpieza Final (Pre-Release `v6.0.0`)

1. **Zero `data-buca-*` en el codebase:** Verificar con búsqueda global que `data-buca-perf` y `data-buca-manual` devuelvan `0` coincidencias en `index.html` y `src/`.
2. **Zero `bne-*` / `data-bne-*`:** Verificar que toda referencia residual de la etapa `v5` (`bne-perf`, `data-bne-ignore`, `.bne-ignore`) haya sido reemplazada por `bene-*` / `.bene-ignore`.
3. **Limpieza de Storage:** Migrar o purgar claves legacy en `localStorage` (`buca_performance_config`) hacia el esquema definido por BENE v6.0.0 (`bene-profile`, `bene-manual`, `bene-theme`).
4. **Cero Estilos Inline:** Confirmar cumplimiento de `BENE-RULE-002` en todos los servicios de `src/core/engine/`.

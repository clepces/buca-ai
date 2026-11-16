# 🪟 Catálogo Maestro de Componentes Visuales UI
## Anatomía de Controles, Modales y Navegación — B.U.C.A. AI

> **Módulo:** `docs/ui/components-catalog.md`  
> **Ubicación en Código:** `src/shared/components/`, `src/shared/layout/`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Modales del Sistema (`ModalService.js`)

Todos los modales se montan en el contenedor `#modal-base` gestionados por `src/shared/services/ModalService.js`:

* **Dimensiones Estandarizadas:** `width: min(92vw, 540px)` en modales estándar (RateModal, LanguagePanel).
* **Modales Complejos (`PerformanceModal.js`):** Altura máxima de `88vh` con scrollbar interno estilizado y pestañas de telemetría D3.
* **Manejo de Enfoque y Accesibilidad:** Atrapamiento de foco accesible (*focus trap*) y cierre nativo mediante tecla `Escape`.

---

## 2. Barra de Navegación y Cabecera (`AppHeader.js` y `WorkspaceNavRibbon.js`)

* **`AppHeader.js`:** Cabecera fijada (`position: sticky; top: 0; z-index: 100`) que aloja:
  - Selector de Negocio Activo.
  - Telemetría en vivo del motor (indicador FPS / L0-L3).
  - Paneles flotantes de idioma, notificaciones y perfil de usuario.
* **`WorkspaceNavRibbon.js`:** Barra de accesos directos con scroll horizontal suave (`data-action="workspace:scroll_carousel"`), adaptada para interacción táctil en tabletas y móviles.

---

## 3. Tarjetas Comerciales (`BusinessHub`)

* **Ancho Máximo:** `280px` en escritorio, `240px` en móvil con padding interno de `18px`.
* **Vistas Conmutables:** Carrusel cinético 3D, Cuadrícula flexible (*Grid*) y Lista compacta.

---

## 4. Dock Inferior Flotante (`Dock.js`)

Barra de navegación tipo dock con efecto de elevación neumórfica para móviles y pantallas táctiles (`z-index: 1000`). Proporciona accesos rápidos a:
- Área de Trabajo (`/workspace`)
- Punto de Venta (`/pos`)
- Tasas de Cambio (`/finance`)
- Ajustes del Sistema (`/workspace/settings`)

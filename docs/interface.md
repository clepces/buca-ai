# Especificación de Interfaz, Sistema de Diseño y Arquitectura SASS (B.U.C.A. AI)

> **Documento:** Sistema Visual "Corporate Hybrid Glass", Diagnóstico de Escalado y Arquitectura SASS  
> **Versión:** 1.0.0  
> **Normativa de Integridad:** BNE-RULE-001 (Regla de Oro del Motor Gráfico)

---

## 1. Identidad Visual: "Corporate Hybrid Glass"

El sistema visual de **B.U.C.A. AI** fusiona la solidez y confiabilidad del azul corporativo tradicional con la profundidad, ligereza y modernidad del efecto cristal (**Glassmorphism**).

### 1.1. Paleta de Colores y Fuente de Verdad Centralizada
* **Azul Primario Corporativo:** `#2563eb` (`--buca-blue` / `--primary-color`).
* **Superficies Translúcidas:**
  * Modo Claro: `rgba(255, 255, 255, 0.7)` con desenfoque de fondo dinámico.
  * Modo Oscuro: `rgba(15, 23, 42, 0.8)` con borde sutil translúcido `rgba(255, 255, 255, 0.1)`.
* **Bordes y Sombras:** Uso obligatorio de `--border-glass` y sombras difusas multinivel en lugar de líneas negras duras.

### 1.2. Regla de Integridad del Motor Gráfico (BNE-RULE-001)
1. **Prohibición de Valores "Hardcoded":** Queda estrictamente prohibido colocar códigos hexadecimales fijos (`#FFF`), tamaños de fuente en píxeles fijos (`18px`) o valores de desenfoque fijos (`blur(20px)`) en archivos `.scss` o `.css`.
2. **Tokens Dinámicos:** Todo valor visual debe invocar variables CSS centralizadas (`var(--border-glass)`, `var(--surface-glass)`, `var(--blur-intensity)`).
3. **Variante L0 Eco Obligatoria:** Todo contenedor con `backdrop-filter: blur(...)` debe contar con su variante simplificada condicionada al atributo `[data-buca-perf="L0"]`, la cual desactiva el filtro pesado y aplica un fondo sólido opaco (`var(--surface-solid)`). Esto garantiza 60 FPS estables incluso en hardware restringido o GPUs antiguas (ej. Intel HD Graphics, ATI HD 4650).

---

## 2. Diagnóstico y Plan de Corrección: Escalado y Dimensionamiento de la UI

Durante las pruebas de ejecución se detectaron discrepancias de escala visual donde ciertos elementos de la interfaz se perciben **desproporcionadamente grandes** respecto a una experiencia ERP estándar:

```
    ┌───────────────────────────────────────────────────────────────┐
    │           ANOMALÍAS DE ESCALA DETECTADAS EN LA INTERFAZ       │
    ├─────────────────────────────────┬─────────────────────────────┤
    │ Elemento Afectado               │ Problema Visual             │
    ├─────────────────────────────────┼─────────────────────────────┤
    │ Tarjetas de Negocio (.b-card)   │ Ancho excesivo (340px) y    │
    │                                 │ padding de 28px desborda    │
    │                                 │ en laptops estándar (1366px)│
    ├─────────────────────────────────┼─────────────────────────────┤
    │ Franja de Telemetría            │ Iconos gigantes y valores   │
    │                                 │ en 2rem ocupan 35% del fold │
    ├─────────────────────────────────┼─────────────────────────────┤
    │ Modales (.glass-modal)          │ Ancho mínimo de 650px crea  │
    │                                 │ scroll horizontal en tablets│
    ├─────────────────────────────────┼─────────────────────────────┤
    │ Dock de Navegación              │ Botones con padding de 16px │
    │                                 │ se superponen en <= 576px   │
    └─────────────────────────────────┴─────────────────────────────┘
```

### 2.1. Directrices de Normalización de Escala (Densidad ERP)
Para corregir estos problemas y lograr una visualización compacta y profesional:
1. **Escala Tipográfica Proporcional:**
   * Establecer la base del documento en `font-size: 14px` en lugar de `16px` para entornos de escritorio ERP de alta densidad.
   * Encabezados de tarjetas: Reducir de `1.5rem` a `1.15rem` (`16px`).
   * Cifras de métricas y balances: Establecer un tope máximo de `1.4rem` (`19.6px`) con peso tipográfico `600`.
2. **Dimensionamiento del Carrusel de Negocios (`BusinessHub`):**
   * Reducir el ancho de tarjeta de `340px` a **`280px` en escritorio** y **`240px` en pantallas móviles/tablets**.
   * Disminuir el padding interno de las tarjetas de `28px` a `18px`, compactando la barra de progreso y los botones de acción.
3. **Ajuste de Modales y Diálogos:**
   * Ancho máximo responsivo: `width: min(92vw, 540px)` para modales estándar (`modal-md`).
   * Para modales extra-grandes (`PerformanceModal`), fijar `max-height: 88vh` con scrollbar interno estilizado para que los botones de acción del footer nunca queden fuera de la pantalla.

---

## 3. Arquitectura SASS (Patrón Modular 7-1 BNE)

La estructura de hojas de estilo en `src/shared/styles/` se organiza bajo un modelo modular desacoplado:

```text
src/shared/styles/
├── main.scss                      # Punto de entrada global SASS
├── vendor/                        # Integración con frameworks de estilos externos
│   └── _bootstrap.scss            # Sobrescrituras y mapeo con Bootstrap 5
└── neural/                        # Motor de estilos Buca Neural Engine
    ├── abstracts/                 # Cimientos matemáticos y variables
    │   ├── _variables.scss        # Tokens de color, radio de borde, blur y z-index
    │   ├── _mixins.scss           # Mixins de cristal, flexbox y responsive
    │   └── _functions.scss        # Cálculos de contraste WCAG y opacidad
    ├── base/                      # Reglas globales y reseteo
    │   ├── _reset.scss            # Normalización y box-sizing
    │   ├── _global.scss           # Configuración tipográfica y de cuerpo
    │   ├── _preloader.scss        # Pantalla de carga inicial
    │   └── _responsive.scss       # Breakpoints globales
    ├── components/                # Componentes atómicos de interfaz
    │   ├── _avatar.scss           # Identidad visual de usuarios y locales
    │   ├── _badges.scss           # Etiquetas y pastillas de estado
    │   ├── _buttons.scss          # Botones primarios, ghost y pills de acción
    │   ├── _dock-premium.scss     # Estilos y corte curvo del dock flotante
    │   ├── _dropdowns.scss        # Paneles flotantes de cabecera
    │   ├── _huds.scss             # Indicadores de rendimiento y FPS
    │   ├── _modals.scss           # Overlays, diálogos y efectos de entrada
    │   ├── _panels.scss           # Paneles laterales y tarjetas modulares
    │   ├── _skeletons.scss        # Placeholders de alta fidelidad
    │   ├── _system-overlay.scss   # Capa de desenfoque y telón de fondo
    │   └── _widgets.scss          # Tarjetas de telemetría y métricas
    ├── layout/                    # Maquetación y grillas responsivas
    │   ├── _dock.scss             # Geometría y posicionamiento del dock
    │   ├── _footer.scss           # Pie de página contextual
    │   ├── _header.scss           # TopBar y barra superior
    │   ├── _huds.scss             # Capa visual de telemetría de GPU
    │   ├── _workspace.scss        # Shell del ERP y contenedor dinámico
    │   └── _workspace_premium.scss# Carrusel de negocios y franjas de telemetría
    └── themes/                    # Temas de renderizado
        ├── _index.scss            # Conmutación de temas claro y oscuro
        └── _eco-mode.scss         # Reglas de rendimiento L0 (sin blur, fondo sólido)
```
    ├── components/                # Componentes atómicos de interfaz
    │   ├── _buttons.scss          # Botones primarios, ghost y pills de acción
    │   ├── _cards.scss            # Tarjetas de cristal y contenedores premium
    │   ├── _dock.scss             # Curva negativa y animaciones del Dock
    │   ├── _header.scss           # TopBar, buscador neural y dropdowns
    │   ├── _huds.scss             # Indicadores flotantes de rendimiento y FPS
    │   └── _modals.scss           # Overlays, diálogos y efectos de entrada
    │
    └── layout/                    # Maquetación y grillas responsivas
        ├── _grid.scss             # Sistema de grilla fluida
        ├── _workspace.scss        # Shell del ERP y contenedor dinámico
        └── _workspace_premium.scss# Carrusel de negocios y franjas de telemetría
```

---

## 4. Escala Estandarizada de Capas (`z-index`)

Para evitar colisiones entre modales, dropdowns y barras de navegación, se aplica la siguiente escala estricta definida en `_variables.scss`:

```scss
$z-layers: (
  'base': 1,
  'header': 100,
  'huds': 500,
  'dock': 1000,
  'panel-overlay': 1800,
  'panel': 2100,
  'modal-overlay': 3000,
  'modal': 3100,
  'toast': 5000,
  'preloader': 99999
);
```

---

## 5. Accesibilidad y Contraste bajo Glassmorphism (WCAG AA)

1. **Ratio de Contraste Mínimo (4.5:1):** Todo texto sobre paneles de cristal debe garantizar un ratio de contraste de al menos 4.5:1. En modo claro se utiliza texto `#0f172a` (Slate 900) y en modo oscuro `#f8fafc` (Slate 50).
2. **Aislamiento de Texto:** Se implementa un sutil `text-shadow` de soporte (`0 1px 2px rgba(0,0,0,0.15)`) para que los textos continúen siendo perfectamente legibles aun cuando elementos dinámicos pasen por detrás del contenedor de cristal.
3. **Navegación Accesible por Teclado:** Todo botón o enlace interactivo debe contar con un indicador de foco visible (`outline: 2px solid var(--buca-blue); outline-offset: 2px;`) sin depender exclusivamente del color.

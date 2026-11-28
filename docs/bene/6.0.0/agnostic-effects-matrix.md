# 🎨 Matriz Maestra del Ecosistema de Atributos Agnósticos `bene-*`
## Especificación de Banderas Semánticas y Efectos Modulares — BENE v6.0.0

> **Módulo:** `docs/bene/6.0.0/agnostic-effects-matrix.md`  
> **Área:** Lenguajes Visuales Agnósticos, Aislamiento DOM y Adaptación Ambiental  
> **Estado:** Especificación Técnica de Alta Fidelidad

---

## 1. La Matriz Semántica Universal de Atributos `bene-*`

El DOM de **B.U.C.A. AI** se gobierna bajo 12 banderas semánticas universales:

| Atributo | Valores Permitidos | Operación en el ERP | Impacto de Hardware y Mitigación |
|---|---|---|---|
| **`bene-theme`** | `dark`, `light`, `oled` | Paletas cromáticas globales. | **Modo OLED:** Fuerza negros puros (`#000000`) apagando píxeles emisores para reducir el consumo energético hasta un 40%. |
| **`bene-effect`** | `glassmorphic`, `neumorphic`, `cyberpunk`, `flat`, `claymorphic` *(new)*, `bento-grid` *(new)* | Máscara estética abstracta del componente. | **Aislamiento Total:** El JavaScript del motor jamás toca una propiedad CSS de diseño; solo conmuta el tipo de efecto solicitado. |
| **`bene-perf`** | `L0`, `L1`, `L2`, `L3` | Nivel dinámico de estrés gráfico dictado por los monitores. | **Mitigación Crítica:** `L0` apaga los filtros más costosos (`backdrop-filter`). `L3` habilita la máxima fidelidad y shaders multicapa. |
| **`bene-motion`** | `fluid`, `eco`, `static` | Curvas de interpolación y animaciones cinéticas. | **Control de Refresco:** Previene el *Screen Tearing* eliminando animaciones complejas ante caídas en la tasa de fotogramas. |
| **`bene-contain`** | `strict`, `content`, `none` | Encapsulamiento del ciclo de vida del layout en el navegador. | **Aislamiento de Reflow:** Forzado nativo mediante `contain: strict;` para evitar repintados masivos del dashboard. |
| **`bene-layer`** | `base`, `overlay`, `nested` | Jerarquía tridimensional de capas visuales apiladas. | **Control de Overdraw:** Impide el cálculo simultáneo de múltiples efectos de desenfoque anidados verticalmente en la GPU. |
| **`bene-asset-status`** | `loading`, `ready` | Control de transición asíncrona de texturas e imágenes. | **Suavizado de Carga:** Aplica transiciones suaves y bloquea clics accidentales durante la carga (`pointer-events: none`). |
| **`bene-fps-mode`** | `normal`, `half` | Programador de saltos de fotogramas. | **Alivio de CPU:** En entornos saturados, reduce la frecuencia de actualización de observadores a la mitad. |
| **`bene-viewport-zone`** | `active`, `buffer`, `inactive` | Segmentación de elementos según proximidad al viewport. | **Optimización de Scroll:** Desactiva filtros pesados en la zona de amortiguación antes de que el usuario haga scroll. |
| **`bene-gpu-raster`** | `forced`, `normal` | Creación de capa de composición independiente en GPU. | **Aceleración Focalizada:** Aplica `will-change: transform` exclusivamente a widgets críticos con alta densidad de datos. |
| **`bene-ambience`** | `solar`, `circadian`, `standard` *(new)* | Adaptación lumínica ambiental con el entorno físico. | **Salud Visual:** Modifica contrastes bajo luz solar intensa y despliega temperaturas cálidas durante turnos nocturnos. |
| **`bene-net-profile`** | `standard`, `eco` *(new)* | Perfil de conectividad predictivo. | **Ahorro de Datos:** Desactiva gradientes animados de malla si `navigator.connection` reporta modo de ahorro de datos. |

---

## 2. Catálogo de Efectos Agnósticos Soportados (`bene-effect`)

### 2.1. `glassmorphic` (Corporate Hybrid Glass)
- **Concepto:** Translúcido aeroespacial con reflejos especulares a 45°, sombras internas sutiles y desenfoque dinámico atenuado por `--bene-fps-factor`.
- **Uso Recomendado:** Paneles de navegación, dashboards financieros y modales ejecutivos.

### 2.2. `neumorphic` (Soft Elevated Elements) `(new)`
- **Concepto:** Relieve suave con sombras dobles contrapuestas (luz superior izquierda, sombra inferior derecha) modelando componentes extruidos del propio fondo.
- **Uso Recomendado:** Botones de acción primaria, tarjetas numéricas de caja y conmutadores.

### 2.3. `claymorphism` (Clay 3D Touch) `(new)`
- **Concepto:** Formas redondeadas suaves con sombras difusas pronunciadas y bordes redondeados profundos tipo arcilla plástica.
- **Uso Recomendado:** Widgets interactivos de telemetría, contadores de existencias y avatares.

### 2.4. `bento-grid` (Modular Content Blocks) `(new)`
- **Concepto:** Distribución asimétrica de tarjetas modulares de alta densidad con bordes delgados de 1px y fondos sólidos o semi-translúcidos de contraste óptimo.
- **Uso Recomendado:** Vista consolidada de comercios (`BusinessHub`) y métricas de rendimiento.

### 2.5. `flat` (Pure Performance)
- **Concepto:** Cero desenfoques, cero sombras complejas. Fondos planos con bordes contrastados de 1px.
- **Uso Recomendado:** Modo de supervivencia forzada `L0 Eco` o terminales POS de baja gama.

---

## 3. Adaptación Ambiental y Accesibilidad Dinámica `(new)`

### Evaluación Algorítmica de Luminancia Relativa (WCAG AAA)
BENE v6.0.0 incorpora una rutina de cálculo de luminancia relativa sobre elementos con fondos translúcidos:

$$L = 0.2126 \times R + 0.7152 \times G + 0.0722 \times B$$

Si el contraste calculado entre el fondo dinámico del contenedor y el texto cae por debajo de la relación `7:1`, el motor inyecta automáticamente una máscara de corrección de opacidad o invierte el color tipográfico (`#ffffff` / `#0f172a`), asegurando legibilidad sin fatiga visual en todo momento.

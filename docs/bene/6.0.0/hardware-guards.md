# 🛡️ Guardianes de Hardware y Mitigación Crítica de Recursos
## Especificación de Monitoreo Activo — BENE v6.0.0

> **Módulo:** `docs/bene/6.0.0/hardware-guards.md`  
> **Componentes en Código:** `src/core/engine/monitors/` (`FPSMonitor.js`, `ThermalGuard.js`, `MemoryGuard.js`)  
> **Estado:** Especificación Técnica de Alta Fidelidad

---

## 1. `FPSMonitor`: Análisis Cinemático y Ventanas de Desescalada

El `FPSMonitor` intercepta el bucle de composición del navegador para calcular la fluidez visual en tiempo real mediante `requestAnimationFrame`, sincronizándose con la tasa de refresco nativa de la GPU.

### Algoritmo de Muestreo de Alta Frecuencia

1. **Captura de Delta-Time ($\Delta t$):** En cada fotograma, calcula el tiempo transcurrido en milisegundos desde el fotograma anterior mediante `performance.now()`.
2. **Promedio Móvil Lineal (Ventana Circular):** Almacena los últimos 60 registros instantáneos ($1000 / \Delta t$) en un vector circular (`frameWeights`), filtrando falsas alarmas provocadas por picos transitorios de CPU (como la descarga inicial de scripts).
3. **Cálculo de Latencia de Composición:** Mantiene las últimas 30 muestras de $\Delta t$ para estabilizar la métrica de latencia (`engine.latency`) mediante media cuadrática ponderada.

### Lógica del Disparador Crítico (Trigger)

Si el promedio de FPS decae por debajo de **30 FPS** de forma sostenida y la ventana de 60 muestras está completa:
- Invoca automáticamente `engine.degrade()`.
- Emite el evento global `buca:perf_critical`.
- Vacía por completo el vector de muestras para abrir una nueva ventana limpia de estabilización, previniendo degradaciones en cascada infinita.

> [!TIP]
> `(new)` **Soporte de Pantallas de Alta Frecuencia (90Hz / 120Hz / 144Hz):** Si la pantalla soporta más de 60Hz, el límite de FPS se adapta dinámicamente (`CONFIG.fpsLimit = detectedHz`), y el umbral de degradación crítica escala proporcionalmente al 50% de la frecuencia base del monitor.

---

## 2. `ThermalGuard`: Escudo contra Estrangulamiento Térmico

El `ThermalGuard` intercepta el sobrecalentamiento del silicio antes de que el sistema operativo reduzca drásticamente las frecuencias de reloj (*Thermal Throttling*).

### Integración con `ComputePressureObserver`

Inicializa un observador dedicado con `{ cpu: true }` y clasifica el estrés térmico en cuatro estados:

| Estado CPU | Acción del Motor BENE | Impacto en el DOM |
|---|---|---|
| **`nominal`** | Preservar perfil asignado. | `bene-perf` sin cambios. |
| **`fair`** | Monitoreo estándar latente. | `bene-perf` sin cambios. |
| **`serious`** | Ejecutar `engine.degrade()`. | Descenso atómico de un Tier (`L2` → `L1`). |
| **`critical`** | Activar Modo Pánico L0 Preventivo. | Forzado inmediato de `bene-perf="L0"`. |

### Protocolo de Mitigación de Emergencia (Estado `critical`)

1. Inyecta la clase global `.buca-thermal-throttle` en `document.documentElement`.
2. Invoca `engine.applyTier('eco')`, forzando transversalmente **`bene-perf="L0"`**.
3. Despacha el evento `buca:perf_critical_network_pause` para que la capa de red congele el tráfico secundario de fondo.

> [!NOTE]
> `(new)` **Fallback Térmico por Batería:** En navegadores sin soporte para `ComputePressureObserver`, el guardián recurre a la `Battery Status API` (`navigator.getBattery`). Si el dispositivo entra en modo de ahorro de energía o la batería cae por debajo del 20%, conmuta automáticamente al perfil `L0 Eco`.

---

## 3. `MemoryGuard`: Supervisor de Búferes y Fugas de RAM

Administra el uso de memoria física asignado al proceso del ERP para prevenir cierres imprevistos (*Out of Memory - OOM*).

### Ciclo de Sondeo Inteligente y Despertares en Reposo

- **Intervalo Prolongado de 30 Segundos:** Reduce los despertares lógicos de CPU en un 83% frente a implementaciones tradicionales de 5 segundos.
- **Verificación Reactiva por Evento `modal:closed`:** Rompe el letargo de forma proactiva al cerrarse modales masivos o tablas extensas, forzando una inspección inmediata para verificar que el recolector de basura nativo libere texturas.

### Umbral de Saturación del Montón (*JS Heap Size*)

$$\text{Uso de Heap } (\%) = \left( \frac{\text{performance.memory.usedJSHeapSize}}{\text{performance.memory.jsHeapSizeLimit}} \right) \times 100$$

* **Zona Crítica (> 80%):** Asume riesgo inminente de OOM. Fuerza el perfil `'eco'` (`bene-perf="L0"`), dispara purgas forzadas en `GhostSanitizer` y libera cachés en memoria.
* **Zona Nominal (< 50%):** Remueve los bloqueos de memoria y autoriza la re-escalada hacia perfiles superiores si los FPS lo respaldan.

---

## 4. Matriz Unificada de Perfiles BENE (`L0` a `L3`)

| Parámetro | L0: Eco (Supervivencia) | L1: Balanced (Estándar ERP) | L2: Pro (Fidelidad Completa) | L3: Ultra (Post-Procesado) |
|---|:---:|:---:|:---:|:---:|
| **Atributo DOM** | `bene-perf="L0"` | `bene-perf="L1"` | `bene-perf="L2"` | `bene-perf="L3"` |
| **Motion** | `bene-motion="static"` | `bene-motion="eco"` | `bene-motion="fluid"` | `bene-motion="fluid"` |
| **FPS Mode** | `bene-fps-mode="half"` | `bene-fps-mode="normal"` | `bene-fps-mode="normal"` | `bene-fps-mode="normal"` |
| **`backdrop-filter`** | **0px (Desactivado)** | 6px - 8px | 12px - 16px | 20px+ Multicapa |
| **Fondo** | `var(--surface-solid)` | `var(--surface-glass)` | `var(--surface-glass)` | `var(--surface-glass-ultra)` |
| **Sombras** | Desactivadas | Reducidas (1 nivel) | Dinámicas suaves | Oclusión ambiental 3D |
| **Partículas / Bloom** | Desactivado | Desactivado | Bloom moderado (0.8) | Bloom completo (1.2) |

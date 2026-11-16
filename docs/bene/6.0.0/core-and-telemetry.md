# ⚙️ Núcleo Central y Sistemas de Telemetría Continua
## Especificación de Ingeniería y Abstracción Paramétrica — BENE v6.0.0

> **Módulo:** `docs/bene/6.0.0/core-and-telemetry.md`  
> **Componente en Código:** `src/core/engine/graphics.js`  
> **Estado:** Especificación Técnica de Nueva Generación

---

## 1. El Núcleo Reestructurado (`graphics.js`)

El núcleo de **BENE v6.0.0** evoluciona de un motor gráfico directo a un **orquestador de estado asíncrono y paramétrico**. Mantiene el patrón de diseño *Singleton* para asegurar que una única instancia controle el ciclo de vida del hardware en la aplicación, pero erradica de forma absoluta el acceso imperativo a propiedades físicas como `.style.filter` o `.style.opacity`.

### Flujo de Control en la Inicialización (`init()` y `calibrate()`)

1. **Patrón Singleton Estricto:** El constructor intercepta cualquier duplicación devolviendo `#instance`. Configura las propiedades base (`profile`, `isPaused`, `isPanicMode`) y escucha eventos globales de ventana (`resize`, `visibilitychange`).
2. **Mapeo de Persistencia Sólida (`PerformanceStorage`):** Consulta el perfil almacenado en `localStorage`. Si el flag `isPanicMode` quedó registrado en la sesión previa, activa inmediatamente el **Modo de Emergencia L0**.
3. **Calibración Sintética Predictiva (`calibrate()`):** En ausencia de registros previos, inicia un benchmark forzado de 600ms mediante `requestAnimationFrame`, contando fotogramas y cruzando los datos con `detectHardware()`.
4. **Filtro Preventivo de VRAM:** Si el benchmark sugiere perfiles altos (`ultra` o `pro`) pero la RAM reportada es `< 4GB`, degrada automáticamente la sugerencia a `balanced` (`L1`) para prevenir cuellos de botella en búferes de GPU.

---

## 2. Detección Predictiva de Hardware (`detectHardware()`)

La función de evaluación estática se refactoriza para incorporar heurística de GPU dedicada mediante un contexto WebGL en memoria:

```javascript
export const detectHardware = () => {
    const memory = navigator.deviceMemory || 4; // RAM aproximada (Chromium)
    const cores = navigator.hardwareConcurrency || 4; // Hilos lógicos
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // (new) Verificación de GPU Dedicada mediante WebGL offscreen
    let hasDedicatedGPU = false;
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                if (/NVIDIA|AMD|Radeon|GeForce|Apple M/i.test(renderer)) {
                    hasDedicatedGPU = true;
                }
            }
        }
    } catch { /* Fallback silencioso en entornos restringidos */ }

    // (new) Detección de Frecuencia Nativa de Pantalla (ProMotion / High-Refresh)
    const maxHz = window.screen?.refreshRate || (window.matchMedia('(min-resolution: 2dppx)').matches ? 120 : 60);

    let suggestion = 'balanced';
    if (memory >= 12 && cores >= 8 && !isMobile && hasDedicatedGPU) suggestion = 'ultra';
    else if (memory >= 8 && cores >= 6) suggestion = 'pro';
    else if (memory < 4 || cores <= 4 || isMobile) suggestion = 'eco';
    
    return { memory, cores, isMobile, hasDedicatedGPU, maxHz, suggestion };
};
```

> [!NOTE]
> `(new)` **Resiliencia ante Pérdida de Contexto WebGL:** Si el driver gráfico del sistema reinicia el contexto WebGL (`webglcontextlost`), BENE captura el evento, desciende temporalmente a `L0 Eco` y restaura el perfil nominal al dispararse `webglcontextrestored`.

---

## 3. El Multiplicador Continuo: `--bne-fps-factor`

La innovación matemática más relevante de **BENE v6.0.0** es la eliminación de las caídas visuales escalonadas y abruptas. En lugar de saltar súbitamente entre perfiles, el motor calcula un factor numérico continuo inyectado en el `:root` del DOM.

### Formulación y Filtro de Amortiguación Suave

El `FPSMonitor` calcula el delta de tiempo exacto entre frames ($\Delta t = performance.now() - t_{anterior}$) y calcula el factor objetivo:

$$F_{\text{target}} = \frac{\text{FPS Actuales}}{\text{FPS Objetivo (CONFIG.fpsLimit)}}$$

Para neutralizar micro-tirones aislados de la CPU, aplica un **filtro exponencial de cierre suave**:

$$F_{\text{actual}} = F_{\text{anterior}} + \alpha \times (F_{\text{target}} - F_{\text{anterior}})$$

* $\alpha = 0.15$: Coeficiente de velocidad de respuesta térmica.
* **Clamping Seguro:** El valor final se restringe estrictamente al rango `[0.00, 1.50]`.
* **Inyección Continua:** `document.documentElement.style.setProperty('--bne-fps-factor', F_actual.toFixed(2));`

```css
/* Consumo Dinámico en Hojas de Estilo */
.glass-panel {
    /* Si los FPS caen de 60 a 45, el blur se atenúa suavemente sin saltos */
    backdrop-filter: blur(calc(16px * var(--bne-fps-factor, 1)));
    -webkit-backdrop-filter: blur(calc(16px * var(--bne-fps-factor, 1)));
}
```

---

## 4. Gestión Declarativa de Assets (`processElement`)

El método universal `processElement(el)` se desvincula de cualquier mutación de estilo en línea:

1. **Mapeo Atómico:** Convierte estados internos (`eco`, `balanced`, `pro`, `ultra`) en atributos `bne-perf="L0|L1|L2|L3"` y `bne-motion="fluid|eco|static"`.
2. **Evaluación DPR Asíncrona:** Si `window.devicePixelRatio > 1.2`, prioriza fuentes optimizadas `bne-src-ultra` o `@2x`.
3. **Escudo de Texturas `bne-asset-status`:**
   - Inyecta `bne-asset-status="loading"` durante la carga.
   - Precarga la textura mediante una imagen virtual en memoria (`new Image()`).
   - Al completarse el evento `onload`, escribe el `src` definitivo en el nodo real y actualiza a `bne-asset-status="ready"`.
   - Permite que el CSS ejecute transiciones de revelado aceleradas por GPU sin bloquear el renderizado del dashboard.

---

## 5. Bucle de Sincronización Telemetría-Estado (`#initTelemetrySync`)

Cada 1000ms (`setInterval` desacoplado), el motor empaqueta las métricas de rendimiento y las sincroniza con el almacén reactivo `uiState`:

```javascript
const stats = {
    fps: this.fpsMonitor.currentFPS,
    latency: this.fpsMonitor.latencyMs,
    tier: this.currentTier,
    factor: this.fpsFactor,
    thermalState: this.thermalGuard.state,
    memoryUsageMb: this.memoryGuard.usedMb,
    isPanic: this.isPanicMode
};
uiState.set({ engineStats: stats });
```

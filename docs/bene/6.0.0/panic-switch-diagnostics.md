# 🚨 Gestión de Errores Críticos, Modos de Pánico y Telemetría de Depuración
## Especificación de Resiliencia y Diagnóstico Visual — BENE v6.0.0

> **Módulo:** `docs/bene/6.0.0/panic-switch-diagnostics.md`  
> **Componentes en Código:** `src/core/engine/PanicModeManager.js`, `src/shared/components/HUDFeedback.js`  
> **Estado:** Especificación Técnica de Alta Fidelidad

---

## 1. El Interruptor de Pánico (`togglePanicMode`)

El `PanicSwitch` es el sistema de mitigación final de BENE. No es una desescalada progresiva; es un **cortocircuito controlado** que apaga el 100% del consumo gráfico cuando la CPU del cliente colapsa o el operador solicita máxima estabilidad de datos de forma manual.

### Protocolo de Activación Dinámica (`forceState = true`)

1. **Forzado del Perfil de Supervivencia:** Establece el perfil interno a `'eco'` e inyecta la bandera **`bene-perf="L0"`** en `document.documentElement`.
2. **Inyección de Clase de Suspensión:** Agrega `.engine-suspended` de manera simultánea en `html` y `body`.
3. **Congelamiento de Monitores:** Invoca inmediatamente `.stop()` en `FPSMonitor`, `ReflowGuard` y `MemoryGuard`, deteniendo bucles basados en `requestAnimationFrame` y temporizadores de alta frecuencia.
4. **Despacho de Evento de Conmutación:** Emite `buca:panic_mode_toggled` con `{ isPanicMode: true }` para que `ResourceThrottle` congele el tráfico de red secundario.

```css
/* ==========================================================================
   CORTOCIRCUITO GRÁFICO MAESTRO: BNE PANIC SWITCH ACTIVO
   ========================================================================== */
.engine-suspended *,
[bene-perf="L0"] * {
  /* Anulación matemática instantánea */
  --bene-blur-factor: 0 !important;
  --bene-shadow-factor: 0 !important;
  --bene-glow-factor: 0 !important;
  --bene-motion-factor: 0 !important;

  /* Destrucción de hilos pesados de GPU */
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  text-shadow: none !important;
  box-shadow: none !important;
  animation: none !important;
  transition: none !important;
  will-change: auto !important;
}
```

> [!TIP]
> `(new)` **Temporizador de Auto-Recuperación:** Cuando el Modo Pánico se activa por causas térmicas o de memoria (no manuales), se inicia un temporizador de 30 segundos. Si al expirar los parámetros del sistema se han estabilizado, BENE ensaya una recuperación suave a `L1 Balanced`.

---

## 2. HUD Feedback Manager Reactivo (`HUDFeedbackManager`)

El sistema de notificaciones de la UI de B.U.C.A. AI se conecta directamente a las banderas de estrés del DOM, convirtiéndose en un monitor visual adaptativo:

```javascript
// Inspección síncrona en el renderizado del toast
const isThermal = document.documentElement.classList.contains('buca-thermal-throttle');
const isPanic = document.documentElement.classList.contains('engine-suspended');
const isEco = isThermal || isPanic || document.documentElement.getAttribute('bene-perf') === 'L0';

toast.className = `hud-toast hud-toast--${options.type || 'info'} ${isEco ? 'hud-toast--eco' : 'hud-toast--glass'}`;
```

* **Modo Nominal (`hud-toast--glass`):** Aplica la suite translúcida *Solid Physical Glass* con reflejos y desenfoque dinámico.
* **Modo Estrangulado (`hud-toast--eco`):** Desactiva desenfoques y utiliza bordes contrastados y fondos sólidos para garantizar legibilidad instantánea sin consumir ciclos de renderizado.

---

## 3. Arnés de Desarrollo: Modo Debug Visual (`bene-debug`)

Para auditar y validar que los atributos `bene-*` se están inyectando en los contenedores correctos y que la GPU está liberando nodos del árbol, el motor integra un **Modo de Inspección Visual por CSS**.

Al activar `bene-debug="true"` en `html`, el CSS resalta cromáticamente el comportamiento del hardware en vivo:

```css
/* ==========================================================================
   ARNÉS DE INSPECCIÓN VISUAL EN DESARROLLO (html[bene-debug="true"])
   ========================================================================== */
html[bene-debug="true"] [bene-viewport-zone="buffer"] {
  outline: 2px dashed #f59e0b !important; /* Ámbar: Elemento optimizado en buffer */
}

html[bene-debug="true"] [bene-viewport-zone="active"] {
  outline: 2px dashed #10b981 !important; /* Esmeralda: Elemento activo en pantalla */
}

html[bene-debug="true"] [bene-contain="strict"] {
  border: 2px solid #ef4444 !important; /* Rojo: Zona aislada por ReflowGuard */
}

html[bene-debug="true"] [bene-asset-status="loading"] {
  outline: 2px dotted #38bdf8 !important; /* Celeste: Textura precargándose */
}

html[bene-debug="true"] [bene-layer="nested"] {
  background: rgba(239, 68, 68, 0.08) !important; /* Alerta Overdraw GPU */
}
```

> [!NOTE]
> `(new)` **Consola de Telemetría Flotante:** En modo `bene-debug="true"`, se renderiza un micro-HUD de 80x24px en la esquina inferior izquierda mostrando FPS en tiempo real, latencia ($\Delta t$), tier activo y factor multiplicador (`--bene-fps-factor`).

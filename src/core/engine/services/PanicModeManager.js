/**
 * @fileoverview PanicModeManager - Gestión de Modo Pánico / Consumo 0% CPU para BNE
 * @module core/engine/services/PanicModeManager
 * @description Desactiva efectos visuales, suspende el motor gráfico y detiene monitores para hardware bajo estrés crítico.
 */
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';

export class PanicModeManager {
    /**
     * Alterna o fuerza el estado de Modo Pánico.
     * @param {Object} engine - Referencia a GraphicsEngine
     * @param {boolean} [forceState]
     * @returns {boolean} Estado final de isPanicMode
     */
    static toggle(engine, forceState) {
        engine.isPanicMode = typeof forceState === 'boolean' ? forceState : !engine.isPanicMode;

        const root = document.documentElement;
        const body = document.body;

        if (engine.isPanicMode) {
            engine.isManualMode = true;
            engine.applyTier('eco');
            root.setAttribute('data-buca-perf', 'L0');
            root.classList.add('engine-suspended');
            body.classList.add('engine-suspended');

            if (engine.fpsMonitor) engine.fpsMonitor.stop();
            if (engine.reflowGuard) engine.reflowGuard.stop();
            if (engine.memoryGuard) engine.memoryGuard.stop();

            console.warn('[PanicModeManager] 🚨 Panic Switch ACTIVADO: CPU 0%.');
        } else {
            root.classList.remove('engine-suspended');
            body.classList.remove('engine-suspended');
            engine.startMonitors();
            engine.applyTier(engine.profile || 'balanced');
            console.log('[PanicModeManager] ⚡ Panic Switch DESACTIVADO.');
        }

        PerformanceStorage.set({
            isPanicMode: engine.isPanicMode,
            profile: engine.profile,
            isManualMode: engine.isManualMode
        });

        window.dispatchEvent(new CustomEvent('buca:panic_mode_toggled', {
            detail: { isPanicMode: engine.isPanicMode }
        }));

        return engine.isPanicMode;
    }
}

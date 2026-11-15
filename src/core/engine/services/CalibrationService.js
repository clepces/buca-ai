/**
 * @fileoverview CalibrationService - Calibración y Benchmarking de Hardware de BNE
 * @module core/engine/services/CalibrationService
 * @description Mide cuadros renderizados en 600ms para sugerir el perfil óptimo (Eco, Balanced, Pro, Ultra).
 */
import { detectHardware } from '@/core/engine/utils/hardwareDetector.js';

export class CalibrationService {
    /**
     * Ejecuta una calibración en vivo renderizando frames para determinar el perfil óptimo.
     * @param {Object} engine - Referencia a GraphicsEngine
     * @returns {Promise<string>} Perfil sugerido ('eco', 'balanced', 'pro', 'ultra')
     */
    static async calibrate(engine) {
        if (!engine || engine.isCalibrating) return engine?.profile || 'balanced';
        engine.isCalibrating = true;

        console.log('%c 🧪 Calibrating hardware performance... ', 'color: #8b5cf6;');
        engine.applyTier('balanced');

        return new Promise((resolve) => {
            let frames = 0;
            const start = performance.now();
            let isDone = false;

            const finish = (suggestion = 'balanced') => {
                if (isDone) return;
                isDone = true;
                engine.isCalibrating = false;
                if (!engine.isManualMode) {
                    engine.applyTier(suggestion);
                }
                resolve(suggestion);
            };

            const fallbackTimer = setTimeout(() => {
                finish('balanced');
            }, 1000);

            const bench = () => {
                if (isDone) return;
                frames++;
                if (performance.now() - start < 600) {
                    requestAnimationFrame(bench);
                } else {
                    clearTimeout(fallbackTimer);
                    const hw = detectHardware();
                    let suggestion = hw.suggestion;

                    if (frames < 20) {
                        suggestion = 'eco';
                    }

                    if (hw.memory < 3.5 && (suggestion === 'ultra' || suggestion === 'pro')) {
                        console.warn('[CalibrationService] VRAM Guard: Memoria insuficiente. Forzando degradación.');
                        suggestion = 'balanced';
                    }

                    finish(suggestion);
                }
            };
            requestAnimationFrame(bench);
        });
    }
}

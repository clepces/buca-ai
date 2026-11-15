/**
 * @fileoverview DOMEffectsApplier - Aplicación de Atributos DOM, CSS Variables y Persistencia para BNE
 * @module core/engine/services/DOMEffectsApplier
 * @description Aplica atributos [data-buca-*] y variables CSS al elemento raíz según el perfil gráfico y post-procesado.
 */
import { CONFIG } from '@/core/config/config.js';
import { storage } from '@/core/storage/StorageAdapter.js';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';

export class DOMEffectsApplier {
    /**
     * Aplica al DOM los atributos, variables CSS y emite el evento de cambio de tier.
     * @param {Object} engine - Referencia a GraphicsEngine
     * @param {string} tier - Nombre del tier ('eco', 'balanced', 'pro', 'ultra')
     */
    static apply(engine, tier) {
        const tierData = engine.tiers[tier];
        if (!tierData) return;

        const root = document.documentElement;
        root.setAttribute('data-buca-perf', tierData.id);
        root.setAttribute('data-buca-manual', engine.isManualMode ? 'true' : 'false');
        root.style.setProperty('--buca-tier-num', tierData.num);
        root.style.setProperty('--buca-blur-factor', engine.blurFactor);

        // Core Effects
        root.setAttribute('data-buca-bloom', engine.postProcess.bloom);
        root.setAttribute('data-buca-grain', engine.postProcess.grain);
        root.setAttribute('data-buca-reflections', engine.postProcess.glassReflections);
        root.setAttribute('data-buca-shadows', engine.postProcess.shadows);
        root.setAttribute('data-buca-aa', engine.postProcess.antiAliasing);

        // Intensity & Quality Modifiers
        root.style.setProperty('--buca-bloom-intensity', engine.postProcess.bloomIntensity);
        root.style.setProperty('--buca-blur-modifier', engine.postProcess.blurIntensity);
        root.style.setProperty('--buca-grain-intensity', engine.postProcess.grainIntensity);
        root.style.setProperty('--buca-shadow-quality', engine.postProcess.shadowQuality);
        root.style.setProperty('--buca-particle-density', engine.postProcess.particleDensity);

        PerformanceStorage.set({
            profile: tier,
            isManualMode: engine.isManualMode,
            postProcess: engine.postProcess
        });
        PerformanceStorage.propagateToDOM(tier, tierData.id, engine.isManualMode);

        storage.set(engine.storageKey, {
            profile: tier,
            isManualMode: engine.isManualMode,
            postProcess: engine.postProcess,
            timestamp: Date.now()
        });

        window.dispatchEvent(new CustomEvent(CONFIG.EVENTS.GRAPHICS.TIER_CHANGED, {
            detail: {
                tier,
                id: tierData.id,
                num: tierData.num,
                isManual: engine.isManualMode,
                isLowPerf: tier === 'eco' || tier === 'balanced'
            }
        }));
    }
}

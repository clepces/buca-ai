/**
 * useBNE - Hook de Integración con el Motor Gráfico
 * =========================================================================
 * Permite a cualquier componente suscribirse a las métricas de rendimiento
 * (FPS, Tier, Thermal) del Buca Neural Engine.
 * =========================================================================
 */
import { eventBus } from '@/core/eventBus/index.js';
import { uiState } from '@/core/state/ui.js';

export const useBNE = (callback) => {
    /**
     * Suscribe el componente a cambios en el estado de la UI (Motor).
     */
    const unsubscribe = uiState.subscribe((state) => {
        if (state.graphics) {
            callback(state.graphics);
        }
    });

    /**
     * Permite forzar una recalibración desde el componente.
     */
    const recalibrate = () => {
        eventBus.emit('engine:recalibrate');
    };

    return {
        unsubscribe,
        recalibrate,
        currentTier: uiState.get().graphics?.tier || 'balanced'
    };
};

export default useBNE;

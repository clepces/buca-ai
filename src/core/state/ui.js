import { BaseState } from './BaseState.js';
import { eventBus } from '../eventBus/index.js';
import { CONFIG } from '../config/config.js';
import { PerformanceStorage } from '../storage/PerformanceStorage.js';

/**
 * UIState - Gestión de estado de la Interfaz y el Motor
 * =========================================================================
 * Centraliza el estado de modales, notificaciones y rendimiento con middleware de sincronización.
 */
class UIState extends BaseState {
    constructor() {
        const storedPerf = PerformanceStorage.get();

        super({
            activeModal: null,
            isOnline: navigator.onLine,
            isSyncing: false,
            isConnecting: true,
            isLoading: false,
            // Estado del Motor Gráfico restaurado inmediatamente
            graphics: {
                profile: storedPerf.profile,
                tier: storedPerf.tier,
                fps: 60,
                isManualMode: storedPerf.isManualMode,
                isPaused: false
            }
        });

        // Asegurar propagación de atributos al DOM en la inicialización
        PerformanceStorage.propagateToDOM(storedPerf.profile, storedPerf.tier, storedPerf.isManualMode);
    }

    /**
     * Middleware de actualización del estado del motor gráfico con persistencia automática
     * @param {object} stats 
     */
    updateGraphics(stats) {
        const current = this._state.graphics;
        const nextGraphics = { ...current, ...stats };

        this.set({ graphics: nextGraphics });

        // Middleware / Hook: sincronizar con localStorage si cambió el perfil o modo
        if (stats.profile && stats.profile !== current.profile ||
            stats.isManualMode !== undefined && stats.isManualMode !== current.isManualMode) {
            PerformanceStorage.set({
                profile: nextGraphics.profile,
                isManualMode: nextGraphics.isManualMode,
                postProcess: nextGraphics.postProcess
            });
        }

        // Emitir evento para componentes legacy
        eventBus.emit(CONFIG.EVENTS.GRAPHICS.PROFILE_UPDATE, stats);
    }
}

export const uiState = new UIState();
export default uiState;

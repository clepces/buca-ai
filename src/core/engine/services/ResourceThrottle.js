/**
 * ResourceThrottler - Deep Resource Planning (DRP) Bridge
 * 
 * Este módulo está aislado para no colisionar con el proyecto modular `NetworkService.js`.
 * Propósito: Emitir señales para que el fetch/API layer (http.js en el core) pause
 * peticiones no críticas cuando el motor visual está sobrecargado.
 */
export class ResourceThrottle {
    constructor(engine) {
        this.engine = engine;
        this.isThrottling = false;
        
        this._tierChangedHandler = (e) => {
            const { isLowPerf } = e.detail;
            if (isLowPerf && !this.isThrottling) {
                this.enableThrottling(false);
            } else if (!isLowPerf && this.isThrottling) {
                this.disableThrottling();
            }
        };

        this._perfCriticalHandler = () => {
            this.enableThrottling(true);
        };

        window.addEventListener('graphics:tier-changed', this._tierChangedHandler);
        window.addEventListener('buca:perf_critical_network_pause', this._perfCriticalHandler);
    }

    enableThrottling(isCritical = false) {
        this.isThrottling = true;
        console.debug(`[ResourceThrottler] Reducción de tráfico de red activada. Crítico: ${isCritical}`);
        // El verdadero NetworkService o http.js del core escuchará esto:
        window.dispatchEvent(new CustomEvent('buca:drp_pause_polling', { detail: { critical: isCritical } }));
    }

    disableThrottling() {
        this.isThrottling = false;
        console.debug('[ResourceThrottler] Tráfico restaurado. Levantando DRP.');
        window.dispatchEvent(new CustomEvent('buca:drp_resume_polling'));
    }

    /**
     * Remueve los escuchas de eventos globales para evitar fugas de memoria.
     */
    stop() {
        window.removeEventListener('graphics:tier-changed', this._tierChangedHandler);
        window.removeEventListener('buca:perf_critical_network_pause', this._perfCriticalHandler);
    }
}

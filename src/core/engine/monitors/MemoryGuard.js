/**
 * MemoryGuard - Prevención de fugas de memoria RAM y Monitoreo Térmico BNE
 * =========================================================================
 * Monitoreo eficiente con sondeo de 30s, verificación tras cierre de modales
 * y soporte resiliente contra plataformas sin performance.memory (Safari/Firefox).
 * =========================================================================
 */
export class MemoryGuard {
    constructor(engine) {
        this.engine = engine;
        this.checkInterval = null;
        this._modalClosedHandler = null;
    }

    start() {
        if (typeof performance === 'undefined' || !performance || !('memory' in performance) || !performance.memory) {
            console.debug('[MemoryGuard] performance.memory no soportado en este navegador (Safari/Firefox).');
            return;
        }

        const checkMemory = () => {
            try {
                if (!performance.memory) return;
                const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
                if (!jsHeapSizeLimit) return;
                const usage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

                if (usage > 80) {
                    console.warn('[MemoryGuard] RAM Crítica detectada. Purgando estados visuales...');
                    document.documentElement.classList.add('buca-thermal-throttle');
                    this.engine.applyTier('eco');
                    window.dispatchEvent(new CustomEvent('buca:perf_critical_network_pause'));
                } else if (usage < 50) {
                    document.documentElement.classList.remove('buca-thermal-throttle');
                }
            } catch (err) {
                console.debug('[MemoryGuard] Memory probe error:', err);
            }
        };

        // Verificación inicial inmediata
        checkMemory();

        // Sondeo eficiente espaciado cada 30 segundos (reducción de 83% de wakeups)
        this.checkInterval = setInterval(checkMemory, 30000);

        // Verificación adicional tras cierre de modales grandes
        this._modalClosedHandler = () => checkMemory();
        window.addEventListener('modal:closed', this._modalClosedHandler);
    }

    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this._modalClosedHandler) {
            window.removeEventListener('modal:closed', this._modalClosedHandler);
            this._modalClosedHandler = null;
        }
    }
}

export default MemoryGuard;

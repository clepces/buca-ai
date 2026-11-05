export class ThermalGuard {
    constructor(engine) {
        this.engine = engine;
        this.observer = null;
    }

    async start() {
        /* global ComputePressureObserver */
        if (typeof ComputePressureObserver !== 'undefined') {
            try {
                this.observer = new ComputePressureObserver((entries) => {
                    const latest = entries[0];
                    if (latest.state === 'critical') {
                        console.warn('[GraphicsEngine] Presión térmica CRÍTICA. Modo pánico activado.');
                        document.documentElement.classList.add('buca-thermal-throttle');
                        this.engine.applyTier('eco');
                        window.dispatchEvent(new CustomEvent('buca:perf_critical_network_pause'));
                    } else if (latest.state === 'serious') {
                        console.warn('[GraphicsEngine] Presión térmica detectada: serious');
                        this.engine.degrade();
                    }
                    window.dispatchEvent(new CustomEvent('buca:perf_pressure', { detail: { state: latest.state } }));
                }, { cpu: true });
                this.observer.observe('cpu');
            } catch (error) {
                // Destruir referencia en caso de falla de inicialización para evitar fugas pasivas
                if (this.observer) {
                    try { this.observer.disconnect(); } catch { /* ignore */ }
                    this.observer = null;
                }
                console.debug('[GraphicsEngine] ComputePressureObserver falló o no está soportado:', error.message);
            }
        }
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

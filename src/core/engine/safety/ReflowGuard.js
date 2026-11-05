/**
 * ReflowGuard - Prevención de layouts thrashing y mutaciones masivas
 * Rescatado de Legacy Engine (GraphicsManager.js)
 */
export class ReflowGuard {
    constructor(engine) {
        this.engine = engine;
        this.reflowCount = 0;
        this.lastReflowCheck = Date.now();
        this._handler = null;
    }

    start() {
        if (this._handler) return;

        // Escuchar eventos de mutación o actualizaciones sin duplicar un MutationObserver en document.body
        this._handler = () => {
            this.reflowCount++;
            const now = Date.now();
            if (now - this.lastReflowCheck > 1000) {
                if (this.reflowCount > 80) { 
                    if (!this._lastDegradeTime || now - this._lastDegradeTime > 5000) {
                        console.warn(`[ReflowGuard] Reflow excesivo detectado: ${this.reflowCount}/s. Degradando.`);
                        document.documentElement.classList.add('buca-reflow-throttle');
                        this.engine.degrade();
                        this._lastDegradeTime = now;
                    }
                } else {
                    document.documentElement.classList.remove('buca-reflow-throttle');
                }
                this.reflowCount = 0;
                this.lastReflowCheck = now;
            }
        };

        window.addEventListener('ui:scan_graphics', this._handler);
    }

    stop() {
        if (this._handler) {
            window.removeEventListener('ui:scan_graphics', this._handler);
            this._handler = null;
        }
    }
}

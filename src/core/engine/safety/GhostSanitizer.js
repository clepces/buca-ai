/**
 * GhostSanitizer - Limpieza de capas con will-change y opacity: 0
 * Rescatado de Legacy Engine (GraphicsManager.js)
 */
import { $$, $hide } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export class GhostSanitizer {
    constructor(engine) {
        this.engine = engine;
        this.interval = null;
        this._boundSanitize = null;
    }

    start() {
        this.interval = setInterval(() => {
            this.sanitize();
        }, 30000); // Chequeo cada 30 segundos
    }

    sanitize() {
        if (this.engine.isPaused || document.hidden) return;

        if ('requestIdleCallback' in window) {
            if (!this._boundSanitize) {
                this._boundSanitize = () => this.#performSanitize();
            }
            requestIdleCallback(this._boundSanitize);
        } else {
            setTimeout(() => this.#performSanitize(), 100);
        }
    }

    #performSanitize() {
        const ghosts = $$('.hidden:not([data-bne-ignore]), .is-hidden:not([data-bne-ignore])');
        let sanitizedCount = 0;
        ghosts.forEach(el => {
            $hide(el);
            sanitizedCount++;
        });
        
        if (sanitizedCount > 0) {
            Logger.debug({ layer: 'ENGINE', role: 'CLASS', target: 'GhostSanitizer', message: `Ocultadas ${sanitizedCount} capas fantasma fuera de pantalla.` });
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

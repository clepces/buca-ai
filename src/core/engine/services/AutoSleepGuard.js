/**
 * @fileoverview AutoSleepGuard - Modo Reposo Automático de BNE
 * @module core/engine/services/AutoSleepGuard
 * @description Reduce el consumo de CPU a 0% tras 5 segundos de inactividad de usuario pausando monitores de alta frecuencia.
 */

export class AutoSleepGuard {
    constructor(engine, options = {}) {
        this.engine = engine;
        this.timeoutMs = options.timeoutMs || 5000;
        this.checkIntervalMs = options.checkIntervalMs || 2000;

        this.isSleeping = false;
        this.lastActivityTime = Date.now();
        this.#sleepCheckTimer = null;
        this.#activityHandler = null;

        this.#init();
    }

    #sleepCheckTimer;
    #activityHandler;

    #init() {
        this.#activityHandler = () => {
            this.lastActivityTime = Date.now();
            if (this.isSleeping) {
                this.wakeUp();
            }
        };

        const events = ['pointermove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(evt => window.addEventListener(evt, this.#activityHandler, { passive: true }));

        this.#sleepCheckTimer = setInterval(() => {
            if (this.engine.isPanicMode || this.engine.isPaused || this.isSleeping) return;
            if (Date.now() - this.lastActivityTime > this.timeoutMs) {
                this.goToSleep();
            }
        }, this.checkIntervalMs);
    }

    /**
     * Pone al motor gráfico en modo reposo ligero (0% CPU).
     */
    goToSleep() {
        if (this.isSleeping) return;
        this.isSleeping = true;
        if (this.engine.fpsMonitor) this.engine.fpsMonitor.stop();
        if (this.engine.reflowGuard) this.engine.reflowGuard.stop();
    }

    /**
     * Reactiva los monitores cuando se detecta actividad del usuario.
     */
    wakeUp() {
        this.isSleeping = false;
        this.lastActivityTime = Date.now();
        if (!this.engine.isPanicMode && !this.engine.isPaused) {
            this.engine.startMonitors();
        }
    }

    /**
     * Limpia listeners globales y el temporizador.
     */
    destroy() {
        if (this.#activityHandler) {
            const events = ['pointermove', 'keydown', 'scroll', 'touchstart'];
            events.forEach(evt => window.removeEventListener(evt, this.#activityHandler));
            this.#activityHandler = null;
        }

        if (this.#sleepCheckTimer) {
            clearInterval(this.#sleepCheckTimer);
            this.#sleepCheckTimer = null;
        }
    }
}

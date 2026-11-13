/**
 * EventBus - Sistema de comunicación desacoplado de grado empresarial
 * =========================================================================
 * Estructura modular ES6+ con soporte O(1), comodines (*), middlewares y aislamiento de errores.
 */
import { offlineReplayQueue } from './OfflineReplayQueue.js';

class EventBus {
    constructor() {
        this.events = new Map();
        this.middlewares = new Set();
        offlineReplayQueue.registerEmitter(async (ev, ...args) => {
            await this.emitTransactional(ev, ...args);
        });
    }

    /**
     * Registra un middleware global.
     * @param {Function} middleware Función interceptora: (event, ...args) => boolean|void
     * @returns {Function} Función para remover el middleware dinámicamente.
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new TypeError('[EventBus] El middleware debe ser una función ejecutable.');
        }
        this.middlewares.add(middleware);
        return () => this.middlewares.delete(middleware);
    }

    /**
     * Suscribirse a un evento
     * @param {string} event Nombre del evento (Soporta nombres exactos o comodines con '*')
     * @param {Function} callback Función a ejecutar cuando se emita el evento
     * @returns {Function} Función de desuscripción limpia e inmediata
     */
    on(event, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('[EventBus] El callback debe ser una función.');
        }

        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);

        return () => this.off(event, callback);
    }

    /**
     * Suscribirse a un evento para que se ejecute una sola vez
     * @param {string} event Nombre del evento
     * @param {Function} callback Función a ejecutar
     * @returns {Function} Función de desuscripción
     */
    once(event, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('[EventBus] El callback debe ser una función.');
        }

        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            callback(...args);
        };

        onceWrapper.originalListener = callback;
        return this.on(event, onceWrapper);
    }

    /**
     * Desuscribirse de un evento
     * @param {string} event Nombre del evento
     * @param {Function} callback Función original o wrapper que se desea eliminar
     */
    off(event, callback) {
        const listeners = this.events.get(event);
        if (!listeners) return;

        if (listeners.delete(callback)) {
            if (listeners.size === 0) this.events.delete(event);
            return;
        }

        for (const listener of listeners) {
            if (listener.originalListener === callback) {
                listeners.delete(listener);
                break;
            }
        }

        if (listeners.size === 0) this.events.delete(event);
    }

    /**
     * Recupera de forma optimizada los suscriptores asociados, evaluando patrones comodín.
     * @private
     */
    _getListeners(event) {
        const matched = new Set();

        if (this.events.has(event)) {
            this.events.get(event).forEach(cb => matched.add(cb));
        }

        for (const [registeredEvent, listeners] of this.events.entries()) {
            if (registeredEvent.includes('*')) {
                const regexPattern = '^' + registeredEvent.replace(/\*/g, '.*') + '$';
                const regex = new RegExp(regexPattern);
                
                if (regex.test(event)) {
                    listeners.forEach(cb => matched.add(cb));
                }
            }
        }

        return [...matched];
    }

    /**
     * Ejecuta secuencialmente los middlewares registrados antes de procesar la emisión.
     * @private
     */
    _runMiddlewares(event, args) {
        for (const middleware of this.middlewares) {
            try {
                const result = middleware(event, ...args);
                if (result === false) return false;
            } catch (error) {
                console.error(`[EventBus] Error en Middleware al procesar "${event}":`, error);
            }
        }
        return true;
    }

    /**
     * Emitir un evento síncrono
     * @param {string} event Nombre del evento
     * @param {...any} args Datos ilimitados asociados al evento
     */
    emit(event, ...args) {
        if (offlineReplayQueue._isTransactional(event) && !offlineReplayQueue.isOnline()) {
            offlineReplayQueue.enqueue(event, ...args);
            return; // Prevenir duplicación de efectos de negocio offline
        }

        if (!this._runMiddlewares(event, args)) return;

        const targets = this._getListeners(event);
        
        targets.forEach(callback => {
            const start = performance.now();
            try {
                callback(...args);
            } catch (error) {
                console.error(`[EventBus] Error crítico en el suscriptor de "${event}":`, error);
            } finally {
                const duration = performance.now() - start;
                if (duration > 16) {
                    console.warn(`[EventBus][Performance Warning] El suscriptor de "${event}" tardó ${duration.toFixed(2)}ms en responder.`);
                }
            }
        });
    }

    /**
     * Emisión estricta de comandos transaccionales.
     * Propaga errores y exige la presencia de handlers.
     */
    async emitTransactional(event, ...args) {
        if (!this._runMiddlewares(event, args)) {
            throw new Error(`[EventBus] Middleware interceptó el comando "${event}".`);
        }

        const targets = this._getListeners(event);
        if (targets.length === 0) {
            throw new Error(`[EventBus] Cero handlers registrados para el comando transaccional "${event}".`);
        }

        for (const callback of targets) {
            await callback(...args);
        }
    }

    /**
     * Emisión de eventos Asíncronos paralelos concurrentes
     * @param {string} event Nombre del evento
     * @param {...any} args Datos ilimitados asociados
     */
    async emitAsync(event, ...args) {
        if (!this._runMiddlewares(event, args)) return;

        const targets = this._getListeners(event);
        
        const promises = targets.map(async (callback) => {
            try {
                await callback(...args);
            } catch (error) {
                console.error(`[EventBus] Error Asíncrono detectado en "${event}":`, error);
            }
        });

        await Promise.all(promises);
    }

    /**
     * Método de purga total
     */
    clear() {
        this.events.clear();
        this.middlewares.clear();
    }
}

export { offlineReplayQueue };
export const eventBus = new EventBus();
export default eventBus;


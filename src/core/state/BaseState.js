/**
 * BaseState - Reactive State Foundation
 * =========================================================================
 * Proporciona un patrón observador simple y eficiente para la gestión de estado.
 * Incluye batching mediante requestAnimationFrame para optimización en hardware L0.
 * 
 * @author Buca Neural Engine Team
 */
export class BaseState {
    constructor(initialState = {}) {
        this._state = initialState;
        this._listeners = new Set();
        this._notifyTimeout = null;
    }

    /**
     * Obtiene el estado actual (Copia profunda para evitar mutaciones directas)
     * @returns {Object}
     */
    get() {
        return typeof structuredClone !== 'undefined'
            ? structuredClone(this._state)
            : JSON.parse(JSON.stringify(this._state));
    }

    /**
     * Selecciona una clave específica del estado
     * @param {string} key 
     */
    select(key) {
        return this._state[key];
    }

    /**
     * Actualiza el estado (Soporta actualizaciones parciales)
     * @param {Object} partialState 
     */
    set(partialState) {
        this._state = { ...this._state, ...partialState };
        this.notify();
    }

    /**
     * Alias para set()
     * @param {Object} partialState 
     */
    update(partialState) {
        this.set(partialState);
    }

    /**
     * Se suscribe a los cambios de estado
     * @param {Function} handler 
     * @returns {Function} Función para cancelar la suscripción
     */
    subscribe(handler) {
        this._listeners.add(handler);
        // Llamada inicial con el estado actual
        handler(this.get());
        return () => this._listeners.delete(handler);
    }

    /**
     * Notifica a todos los observadores (Agrupado vía requestAnimationFrame)
     */
    notify() {
        if (this._notifyTimeout) {
            cancelAnimationFrame(this._notifyTimeout);
        }

        this._notifyTimeout = requestAnimationFrame(() => {
            const state = this.get();
            this._listeners.forEach(handler => {
                try {
                    handler(state);
                } catch (error) {
                    console.error('[BaseState] Error en suscriptor:', error);
                }
            });
            this._notifyTimeout = null;
        });
    }
}

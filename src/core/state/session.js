import { BaseState } from './BaseState.js';
import { CONFIG } from '../config/config.js';

/**
 * SessionState - Contexto de Usuario y Dispositivo
 * =========================================================================
 * Persiste en localStorage para mantener la sesión tras recargar la página.
 */
class SessionState extends BaseState {
    constructor() {
        const persisted = localStorage.getItem(CONFIG.STORAGE.SESSION);
        super(persisted ? JSON.parse(persisted) : {
            user: null,
            device: null,
            permissions: [],
            isAuthenticated: false,
            tenantId: null,
            currentRole: 'guest'
        });
    }

    /**
     * Sobrescribe set para incluir persistencia automática
     * @param {Object} partialState 
     */
    set(partialState) {
        super.set(partialState);
        localStorage.setItem(CONFIG.STORAGE.SESSION, JSON.stringify(this.get()));
    }

    /**
     * Limpia la sesión actual
     */
    clear() {
        this.set({
            user: null,
            device: null,
            permissions: [],
            isAuthenticated: false,
            tenantId: null,
            currentRole: 'guest'
        });
        localStorage.removeItem(CONFIG.STORAGE.SESSION);
    }
}

export const sessionState = new SessionState();
export default sessionState;

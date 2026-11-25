import { BaseState } from './BaseState.js';
import { CONFIG } from '../config/config.js';

const DEFAULT_SESSION_STATE = {
    user: null,
    device: null,
    permissions: [],
    isAuthenticated: false,
    mfaPending: false,
    isAAL2Verified: false,
    isPasswordRecovery: false,
    tenantId: null,
    currentRole: 'guest'
};

/**
 * SessionState - Contexto de Usuario y Dispositivo
 * =========================================================================
 * Persiste en localStorage para mantener la sesión tras recargar la página.
 */
class SessionState extends BaseState {
    constructor() {
        const persisted = typeof localStorage !== 'undefined' ? localStorage.getItem(CONFIG.STORAGE.SESSION) : null;
        super(persisted ? { ...DEFAULT_SESSION_STATE, ...JSON.parse(persisted), isPasswordRecovery: false } : { ...DEFAULT_SESSION_STATE });
    }

    /**
     * Sobrescribe set para incluir persistencia automática sin filtrar isPasswordRecovery a localStorage.
     * @param {Object} partialState 
     */
    set(partialState) {
        super.set(partialState);
        if (typeof localStorage !== 'undefined') {
            const persistedState = { ...this.get(), isPasswordRecovery: false };
            localStorage.setItem(CONFIG.STORAGE.SESSION, JSON.stringify(persistedState));
        }
    }

    /**
     * Limpia la sesión actual eliminando propiedades residuales y conservando notificaciones.
     */
    clear() {
        super.reset({ ...DEFAULT_SESSION_STATE });
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(CONFIG.STORAGE.SESSION);
        }
    }
}

export const sessionState = new SessionState();
export default sessionState;

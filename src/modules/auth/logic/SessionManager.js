/**
 * SessionManager - Gestor de Estado de Sesión
 * =========================================================================
 * Controla la persistencia del usuario y los tokens en memoria reactiva.
 * =========================================================================
 */
import { uiState } from '@/core/state/ui.js';
import StorageAdapter from '@/core/storage/StorageAdapter.js';
import { AUTH_STORAGE_KEYS } from '../constants/auth.constants.js';

export const SessionManager = {
    /**
     * Inicia una sesión en el sistema.
     * @param {Object} userData 
     * @param {string} token 
     */
    async startSession(userData, token) {
        console.log('[Session] -> Iniciando sesión para:', userData.email);
        
        // Persistir en almacenamiento físico
        await StorageAdapter.set(AUTH_STORAGE_KEYS.TOKEN, token);
        await StorageAdapter.set(AUTH_STORAGE_KEYS.USER, userData);

        // Actualizar estado global reactivo
        uiState.update({ 
            user: userData,
            isAuthenticated: true 
        });
    },

    /**
     * Limpia la sesión actual.
     */
    async clearSession() {
        await StorageAdapter.remove(AUTH_STORAGE_KEYS.TOKEN);
        await StorageAdapter.remove(AUTH_STORAGE_KEYS.USER);
        
        uiState.update({ 
            user: null,
            isAuthenticated: false 
        });
    },

    /**
     * Recupera el token de sesión.
     */
    async getToken() {
        return await StorageAdapter.get(AUTH_STORAGE_KEYS.TOKEN);
    }
};

export default SessionManager;

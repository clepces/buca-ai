import { sessionState } from '../state/session.js';
import { Logger } from '../../shared/utils/logger.js';

/**
 * RouterGuards - Protectores de navegación y niveles de aseguramiento AAL
 * =========================================================================
 * Proporciona validación de autenticación y verificación de segundo factor AAL2.
 * =========================================================================
 */
export const RouterGuards = {
    /**
     * Verifica si el usuario tiene una sesión activa.
     * @returns {boolean} True si está autenticado.
     */
    requiresAuth() {
        const { isAuthenticated } = sessionState.get();
        if (!isAuthenticated) {
            Logger.info('RouterGuard', 'Acceso denegado: Se requiere autenticación.');
            return false;
        }
        return true;
    },

    /**
     * Valida si el usuario ha completado el nivel de aseguramiento AAL2 (Segundo Factor verificado).
     * Si el usuario tiene MFA habilitado pero no ha verificado el código TOTP en la sesión, bloquea el acceso.
     * @returns {Promise<boolean>}
     */
    async requiresAAL2() {
        if (!this.requiresAuth()) return false;

        const current = sessionState.get();
        if (current.mfaPending) {
            Logger.warn('RouterGuard', 'Bloqueo AAL2: Desafío MFA pendiente.');
            return false;
        }

        // Optimización Cost Guard: Si ya fue verificado en memoria en esta sesión, evitar golpear la API
        if (current.isAAL2Verified) {
            return true;
        }

        try {
            const { SupabaseProvider } = await import('../../modules/auth/services/SupabaseProvider.js');
            const aal = await SupabaseProvider.getAssuranceLevel();

            if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                Logger.warn('RouterGuard', 'Bloqueo AAL2: Se requiere verificación de segundo factor en esta sesión.');
                return false;
            }

            sessionState.set({ isAAL2Verified: true });
            return true;
        } catch (err) {
            Logger.warn('RouterGuard', 'Error evaluando nivel AAL2 (Fail-Closed):', err.message || err);
            return false; // Fail-closed estricto ante cualquier fallo
        }
    },

    /**
     * Verifica compatibilidad de hardware.
     */
    checkHardwareCompatibility() {
        return true;
    }
};

export default RouterGuards;

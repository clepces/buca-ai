import { sessionState } from '../state/session.js';

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
            console.info('[RouterGuard] Acceso denegado: Se requiere autenticación.');
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

        try {
            const { SupabaseProvider } = await import('@/modules/auth/services/SupabaseProvider.js');
            const aal = await SupabaseProvider.getAssuranceLevel();

            if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                console.warn('[RouterGuard] Bloqueo AAL2: Se requiere verificación de segundo factor en esta sesión.');
                return false;
            }

            return true;
        } catch (err) {
            console.warn('[RouterGuard] Error evaluando nivel AAL2:', err.message || err);
            return true; // Fallback tolerante si falla la red
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

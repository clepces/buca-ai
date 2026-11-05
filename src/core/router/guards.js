import { sessionState } from '@/core/state/session.js';

/**
 * RouterGuards - Protectores de navegación
 * =========================================================================
 * Proporciona lógica de validación antes de permitir el acceso a una ruta.
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
     * Verifica si el hardware es compatible con el nivel de rendimiento actual.
     * @returns {boolean} True si es compatible.
     */
    checkHardwareCompatibility() {
        // Consultar al GraphicsEngine si el Tier actual es soportado
        // (Simulado)
        return true;
    }
};

export default RouterGuards;

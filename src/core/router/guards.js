import { sessionState } from '../state/session.js';
import { Logger } from '../../shared/utils/logger.js';
import { SupabaseProvider } from '../../modules/auth/services/SupabaseProvider.js';

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
            Logger.info({ layer: 'KERNEL', role: 'FN', target: 'RouterGuard', message: 'Acceso denegado: se requiere autenticación.' });
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
            Logger.warn({ layer: 'KERNEL', role: 'FN', target: 'RouterGuard', message: 'Bloqueo AAL2: desafío MFA pendiente.' });
            return false;
        }

        // Optimización Cost Guard: Si ya fue verificado en memoria en esta sesión, evitar golpear la API
        if (current.isAAL2Verified) {
            return true;
        }

        try {
            const aal = await SupabaseProvider.getAssuranceLevel();

            if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                Logger.warn({ layer: 'KERNEL', role: 'FN', target: 'RouterGuard', message: 'Bloqueo AAL2: se requiere verificación de segundo factor en esta sesión.' });
                return false;
            }

            sessionState.set({ isAAL2Verified: true });
            return true;
        } catch (err) {
            Logger.warn({ layer: 'KERNEL', role: 'FN', target: 'RouterGuard', message: 'Error evaluando nivel AAL2 (Fail-Closed).', data: err?.message || err });
            return false; // Fail-closed estricto ante cualquier fallo
        }
    },

    _pendingReturnUrl: null,

    /**
     * Valida que una URL de retorno sea una ruta interna segura (previene Open Redirect).
     * @param {string} url
     * @returns {string}
     */
    sanitizeReturnUrl(url) {
        if (typeof url !== 'string') return '/';
        const trimmed = url.trim();
        if (!/^\/(?!\/)/.test(trimmed) || trimmed.includes('\\')) {
            return '/';
        }
        return trimmed;
    },

    /**
     * Registra la ruta protegida a la que el usuario intentaba acceder antes de autenticar.
     * @param {string} url
     */
    setReturnUrl(url) {
        const clean = this.sanitizeReturnUrl(url);
        if (clean === '/' || clean.startsWith('/auth')) return;
        this._pendingReturnUrl = clean;
    },

    /**
     * Consume la URL de retorno pendiente o devuelve el escritorio por defecto.
     * @param {string} [defaultPath='/workspace']
     * @returns {string}
     */
    consumeReturnUrl(defaultPath = '/workspace') {
        const target = this._pendingReturnUrl;
        this._pendingReturnUrl = null;
        return target || defaultPath;
    },

    /**
     * Valida si el rol actual del usuario está autorizado para la ruta.
     * @param {string[]} [allowedRoles]
     * @returns {boolean}
     */
    requiresRole(allowedRoles) {
        if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
        const { currentRole, user } = sessionState.get();
        const role = currentRole || user?.role || 'guest';
        return allowedRoles.includes(role);
    },

    /**
     * Evalúa transiciones de estado para evitar acceso a rutas guestOnly o de estado sin respaldo.
     * @param {object|null} route
     * @returns {string|null} Ruta de redirección o null si puede continuar.
     */
    resolveStateRedirect(route) {
        const state = sessionState.get();
        const path = route?.path || '';

        if (path === '/auth/two-factor' && !state.mfaPending) {
            return state.isAuthenticated ? '/workspace' : '/auth/login';
        }
        if (state.mfaPending && path !== '/auth/two-factor' && route?.guestOnly) {
            return '/auth/two-factor';
        }
        if (state.isPasswordRecovery && path !== '/auth/recovery/reset-password' && route?.guestOnly) {
            return '/auth/recovery/reset-password';
        }
        if (route?.guestOnly && state.isAuthenticated && !state.mfaPending && !state.isPasswordRecovery) {
            return '/workspace';
        }
        return null;
    },

    /**
     * Verifica compatibilidad de hardware.
     */
    checkHardwareCompatibility() {
        return true;
    }
};

export default RouterGuards;

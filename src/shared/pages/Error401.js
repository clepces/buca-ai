/**
 * Error401 - Acceso No Autorizado
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';

export const Error401 = {
    render: () => {
        return SystemOverlay.renderPage({
            type: '401',
            code: 'Error 401',
            title: 'Sesión Requerida',
            message: 'Debes iniciar sesión con tu cuenta corporativa para acceder a este módulo protegido.',
            actions: [
                {
                    text: 'Ir al Login',
                    type: 'primary',
                    icon: 'bi bi-box-arrow-in-right',
                    href: '/auth/login'
                }
            ]
        });
    },

    init: () => {
        console.warn('[ErrorView] 401 Renderizado con SystemOverlay');
    }
};

export default Error401;

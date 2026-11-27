/**
 * Error401 - Acceso No Autorizado
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';
import { Logger } from '@/shared/utils/logger.js';

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
        Logger.warn({ layer: 'UI', role: 'CLASS', target: 'Error401', message: 'Vista 401 renderizada con SystemOverlay.' });
    }
};

export default Error401;

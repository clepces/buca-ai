/**
 * Error404 - Página de Recurso No Encontrado
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import { router } from '@/core/router/router.js';
import { goBack } from '@/core/utils/system-helper.js';
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';
import { $, $on } from '@/shared/utils/dom.js';

export const Error404 = {
    render: () => {
        return SystemOverlay.renderPage({
            type: '404',
            code: 'Error 404',
            title: 'Página no encontrada',
            message: 'El recurso o módulo solicitado no existe, ha cambiado de ubicación o se encuentra temporalmente fuera de servicio.',
            actions: [
                {
                    text: 'Volver atrás',
                    type: 'secondary',
                    icon: 'bi bi-arrow-left',
                    action: 'back'
                },
                {
                    text: 'Volver al Inicio',
                    type: 'primary',
                    icon: 'bi bi-house-door',
                    action: 'home'
                }
            ]
        });
    },

    init: () => {
        const btnBack = $('[data-overlay-action="back"]');
        const btnHome = $('[data-overlay-action="home"]');

        if (btnBack) {
            $on(btnBack, 'click', (e) => {
                e.preventDefault();
                if (!goBack()) {
                    router.navigate('/workspace');
                }
            });
        }

        if (btnHome) {
            $on(btnHome, 'click', (e) => {
                e.preventDefault();
                router.navigate('/workspace');
            });
        }
    }
};

export default Error404;

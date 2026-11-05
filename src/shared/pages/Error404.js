/**
 * Error404 - Página de Recurso No Encontrado
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import { router } from '@/core/router/router.js';
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';

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
        const btnBack = document.querySelector('[data-overlay-action="back"]');
        const btnHome = document.querySelector('[data-overlay-action="home"]');

        if (btnBack) {
            btnBack.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    router.navigate('/workspace');
                }
            });
        }

        if (btnHome) {
            btnHome.addEventListener('click', (e) => {
                e.preventDefault();
                router.navigate('/workspace');
            });
        }
    }
};

export default Error404;

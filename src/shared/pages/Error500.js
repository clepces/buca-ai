/**
 * Error500 - Error Interno del Servidor / Kernel
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import { router } from '@/core/router/router.js';
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';

export const Error500 = {
    render: () => {
        return SystemOverlay.renderPage({
            type: '500',
            code: 'Error 500',
            title: 'Error Interno de Servidor',
            message: 'Ocurrió una anomalía inesperada durante el procesamiento de la solicitud.',
            actions: [
                {
                    text: 'Reintentar Solicitud',
                    type: 'primary',
                    icon: 'bi bi-arrow-clockwise',
                    action: 'reload'
                },
                {
                    text: 'Volver al Inicio',
                    type: 'secondary',
                    icon: 'bi bi-house',
                    action: 'home'
                }
            ]
        });
    },

    init: () => {
        const btnReload = document.querySelector('[data-overlay-action="reload"]');
        const btnHome = document.querySelector('[data-overlay-action="home"]');

        if (btnReload) {
            btnReload.addEventListener('click', () => window.location.reload());
        }
        if (btnHome) {
            btnHome.addEventListener('click', (e) => {
                e.preventDefault();
                router.navigate('/workspace');
            });
        }
    }
};

export default Error500;

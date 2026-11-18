/**
 * Error500 - Error Interno del Servidor / Kernel
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import { router } from '@/core/router/router.js';
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';
import { $, $on } from '@/shared/utils/dom.js';
import { safeReload } from '@/core/utils/system-helper.js';

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
        const btnReload = $('[data-overlay-action="reload"]');
        const btnHome = $('[data-overlay-action="home"]');

        if (btnReload) {
            $on(btnReload, 'click', () => safeReload());
        }
        if (btnHome) {
            $on(btnHome, 'click', (e) => {
                e.preventDefault();
                router.navigate('/workspace');
            });
        }
    }
};

export default Error500;

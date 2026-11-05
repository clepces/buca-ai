/**
 * Error503 - Servicio No Disponible / Mantenimiento
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';

export const Error503 = {
    render: () => {
        return SystemOverlay.renderPage({
            type: '503',
            code: 'Error 503',
            title: 'Servicio Temporalmente Inaccesible',
            message: 'El sistema se encuentra en mantenimiento programado o sincronizando servicios de nube.',
            actions: [
                {
                    text: 'Recomprobar Estado',
                    type: 'primary',
                    icon: 'bi bi-arrow-repeat',
                    action: 'reload'
                }
            ]
        });
    },

    init: () => {
        const btnReload = document.querySelector('[data-overlay-action="reload"]');
        if (btnReload) {
            btnReload.addEventListener('click', () => window.location.reload());
        }
    }
};

export default Error503;

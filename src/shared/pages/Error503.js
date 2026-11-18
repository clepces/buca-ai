/**
 * Error503 - Servicio No Disponible / Mantenimiento
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';
import { $, $on } from '@/shared/utils/dom.js';
import { safeReload } from '@/core/utils/system-helper.js';

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
        const btnReload = $('[data-overlay-action="reload"]');
        if (btnReload) {
            $on(btnReload, 'click', () => safeReload());
        }
    }
};

export default Error503;

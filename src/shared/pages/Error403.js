/**
 * Error403 - Acceso Denegado (Forbidden)
 * =========================================================================
 * Utiliza el SystemOverlay unificado para mantener coherencia visual.
 */
import { router } from '@/core/router/router.js';
import SystemOverlay from '@/shared/ui/overlays/SystemOverlay.js';

export const Error403 = {
    render: () => {
        return SystemOverlay.renderPage({
            type: '403',
            code: 'Error 403',
            title: 'Acceso Denegado',
            message: 'No tienes permisos suficientes en tu rol activo para visualizar este contenido o realizar esta acción.',
            actions: [
                {
                    text: 'Volver al Dashboard',
                    type: 'primary',
                    icon: 'bi bi-grid-fill',
                    action: 'dashboard'
                }
            ]
        });
    },

    init: () => {
        const btn = document.querySelector('[data-overlay-action="dashboard"]');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                router.navigate('/workspace');
            });
        }
    }
};

export default Error403;

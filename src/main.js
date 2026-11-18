/**
 * @fileoverview Punto de Entrada Principal (Main Entry Point)
 * @description Inicializa los cimientos del ecosistema BUCA, incluyendo estilos globales,
 * registro de Service Workers (PWA) y el arranque coordinado del núcleo.
 * @version 5.3.0
 */

import 'bootstrap-icons/font/bootstrap-icons.css';
import '@/shared/styles/main.scss';

import kernel from '@/core/kernel.js';
import '@/shared/ui/utils/ui-helper.js';
import { Logger } from '@/shared/utils/logger.js';
import { $id, $mount, $addClass } from '@/shared/utils/dom.js';
import { $onWindow } from '@/core/utils/system-helper.js';

/**
 * @function bootstrap
 * @description Función autoejecutable que orquesta el encendido de la aplicación.
 * Sigue una secuencia estricta: PWA -> Kernel Boot -> Teardown seguro.
 */
(async function bootstrap() {
    if (window.__bucaBootstrapped) return;
    window.__bucaBootstrapped = true;

    try {
        // 1. Registro de Service Worker (Capacidades PWA y Offline)
        if ('serviceWorker' in navigator) {
            _setupNetworkAndPWA();
        }

        // 2. Lanzar el arranque del Núcleo (Kernel) de forma segura
        const startKernel = async () => {
            try {
                await kernel.boot();
            } catch (err) {
                Logger.critical('Bootstrap', 'Fallo crítico durante el arranque:', err);
                $addClass(document.body, 'app-ready');
                if (kernel && typeof kernel.hideSplash === 'function') {
                    kernel.hideSplash();
                }
                const app = $id('app');
                if (app && app.children.length === 0) {
                    $mount(app, '<div class="u-center-pad-40"><h2>Error de Inicialización</h2><p>Por favor, recargue la página.</p></div>');
                }
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startKernel, { once: true });
        } else {
            startKernel();
        }

        // 3. Limpieza de memoria y ciclo de vida al desmontar la ventana
        $onWindow('beforeunload', () => {
            try {
                if (kernel && typeof kernel.destroy === 'function') {
                    kernel.destroy();
                }
            } catch (e) {
                Logger.warn('Bootstrap', 'Limpieza al cerrar ventana:', e);
            }
        }, { once: true });

    } catch (error) {
        Logger.critical('Bootstrap', 'Error no controlado en bootstrap:', error);
    }
})();

/**
 * @private
 * @function _setupNetworkAndPWA
 * @description Gestiona PWA y eventos de red con escuchadores limpios y sin setIntervals huérfanos.
 */
function _setupNetworkAndPWA() {
    $onWindow('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                Logger.info('PWA', `Controlador de servicio activo: ${reg.scope}`);
            })
            .catch(err => {
                Logger.warn('PWA', 'El registro del Service Worker falló:', err);
            });
    }, { once: true });

    const handleOnline = async () => {
        const { uiState } = await import('@/core/state/ui.js');
        uiState.set({ isOnline: true });
        Logger.info('Network', 'Conectividad reestablecida (Online)');
    };

    const handleOffline = async () => {
        const { uiState } = await import('@/core/state/ui.js');
        uiState.set({ isOnline: false });
        Logger.warn('Network', 'Conexión perdida (Offline)');
    };

    $onWindow('online', handleOnline);
    $onWindow('offline', handleOffline);
}

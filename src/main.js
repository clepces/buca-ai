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
                console.error('%c [Critical Boot Error] ', 'background: red; color: white;', err);
                document.body.classList.add('app-ready');
                if (kernel && typeof kernel.hideSplash === 'function') {
                    kernel.hideSplash();
                }
                const app = document.getElementById('app');
                if (app && app.innerHTML.trim() === '') {
                    app.innerHTML = '<div class="u-center-pad-40"><h2>Error de Inicialización</h2><p>Por favor, recargue la página.</p></div>';
                }
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startKernel, { once: true });
        } else {
            startKernel();
        }

        // 3. Limpieza de memoria y ciclo de vida al desmontar la ventana
        window.addEventListener('beforeunload', () => {
            try {
                if (kernel && typeof kernel.destroy === 'function') {
                    kernel.destroy();
                }
            } catch (e) {
                console.warn('[Bootstrap] Limpieza al cerrar:', e);
            }
        }, { once: true });

    } catch (error) {
        console.error('%c [Critical Error] ', 'background: red; color: white;', error);
    }
})();

/**
 * @private
 * @function _setupNetworkAndPWA
 * @description Gestiona PWA y eventos de red con escuchadores limpios y sin setIntervals huérfanos.
 */
function _setupNetworkAndPWA() {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('[PWA] -> Controlador de servicio activo:', reg.scope);
            })
            .catch(err => {
                console.warn('[PWA] -> El registro del Service Worker falló:', err);
            });
    }, { once: true });

    const handleOnline = async () => {
        const { uiState } = await import('@/core/state/ui.js');
        uiState.set({ isOnline: true });
        console.log('[Network] -> Online');
    };

    const handleOffline = async () => {
        const { uiState } = await import('@/core/state/ui.js');
        uiState.set({ isOnline: false });
        console.log('[Network] -> Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
}

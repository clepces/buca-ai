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
import { $id, $mount, $addClass, $text, $on, $onReady } from '@/shared/utils/dom.js';
import { $onWindow, setGlobal, getGlobal, safeReload } from '@/core/utils/system-helper.js';

/**
 * @function bootstrap
 * @description Función autoejecutable que orquesta el encendido de la aplicación.
 * Sigue una secuencia estricta: PWA -> Kernel Boot -> Teardown seguro.
 */
(async function bootstrap() {
    if (getGlobal('__bucaBootstrapped')) return;
    setGlobal('__bucaBootstrapped', true);

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
                Logger.critical({ layer: 'KERNEL', role: 'FN', target: 'bootstrap', icon: '🚨', message: 'Fallo crítico durante el arranque', data: err });
                $addClass(document.body, 'app-ready');
                if (kernel && typeof kernel.hideSplash === 'function') {
                    kernel.hideSplash();
                }
                const app = $id('app');
                if (app) {
                    $mount(app, `
                        <div class="u-center-pad-40 text-center">
                            <h2>Error de Inicialización</h2>
                            <p class="text-muted" id="buca-error-detail"></p>
                            <button type="button" class="btn btn-primary mt-3" id="buca-reload-btn">Recargar Sistema</button>
                        </div>
                    `);
                    const detailEl = $id('buca-error-detail');
                    if (detailEl) {
                        $text(detailEl, 'Ocurrió un error inesperado al iniciar el sistema. Por favor, recargue la página.');
                    }
                    const reloadBtn = $id('buca-reload-btn');
                    if (reloadBtn) {
                        $on(reloadBtn, 'click', () => safeReload());
                    }
                }
            }
        };

        $onReady(startKernel);

        // 3. Limpieza de memoria y ciclo de vida al desmontar la ventana
        $onWindow('beforeunload', () => {
            try {
                if (kernel && typeof kernel.destroy === 'function') {
                    kernel.destroy();
                }
            } catch (e) {
                Logger.warn({ layer: 'KERNEL', role: 'FN', target: 'bootstrap', icon: '⚠️', message: 'Error en limpieza al cerrar ventana', data: e });
            }
        }, { once: true });

    } catch (error) {
        Logger.critical({ layer: 'KERNEL', role: 'FN', target: 'bootstrap', icon: '🚨', message: 'Error no controlado en bootstrap', data: error });
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
                Logger.info({ layer: 'KERNEL', role: 'EVENT', target: 'ServiceWorker', icon: '🔌', message: `Controlador activo (${reg.scope})` });
            })
            .catch(err => {
                Logger.warn({ layer: 'KERNEL', role: 'EVENT', target: 'ServiceWorker', icon: '⚠️', message: 'El registro del Service Worker falló', data: err });
            });
    }, { once: true });

    const handleOnline = async () => {
        const { uiState } = await import('@/core/state/ui.js');
        uiState.set({ isOnline: true });
        Logger.info({ layer: 'KERNEL', role: 'EVENT', target: 'Network', icon: '✅', message: 'Conectividad reestablecida (Online)' });
    };

    const handleOffline = async () => {
        const { uiState } = await import('@/core/state/ui.js');
        uiState.set({ isOnline: false });
        Logger.warn({ layer: 'KERNEL', role: 'EVENT', target: 'Network', icon: '⚠️', message: 'Conexión perdida (Offline)' });
    };

    $onWindow('online', handleOnline);
    $onWindow('offline', handleOffline);
}

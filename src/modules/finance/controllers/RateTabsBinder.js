/**
 * RateTabsBinder - Manejador de Navegación, Paginación y Tabs para RateController
 * =========================================================================
 * Modularización para respetar el límite de 300 líneas por archivo.
 * =========================================================================
 */
import { ForexManager } from '@/core/services/forex/forex-manager.js';
import { DOLAR_VZLA_KEY, CDN_BASE, API_BASE } from '@/core/services/forex/forex-types.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id, $, $$, $on, $addClass, $removeClass, $val } from '@/shared/utils/dom.js';

export const RateTabsBinder = {
    bindTabs(controller) {
        const modalContainer = $id('modal-container') || document.body;
        if (modalContainer && !modalContainer._rateTabsBound) {
            modalContainer._rateTabsBound = true;
            $on(modalContainer, 'click', (e) => {
                const btn = e.target.closest('[data-rate-tab]');
                if (!btn) return;

                e.preventDefault();
                const targetTab = btn.getAttribute('data-rate-tab');
                controller.activeTab = targetTab;
                const tabsNav = btn.closest('#rate-tabs-nav') || $id('rate-tabs-nav');
                if (tabsNav) {
                    $$('[data-rate-tab]', tabsNav).forEach(b => $removeClass(b, 'active'));
                }
                $addClass(btn, 'active');

                $$('.rate-tab-content').forEach(pane => $removeClass(pane, 'active'));
                const activePane = $id(`tab-rate-${targetTab}`);
                if (activePane) $addClass(activePane, 'active');
            });
        }
    },

    bindPagination(controller) {
        const btnHistPrev = $('.btn-history-prev');
        const btnHistNext = $('.btn-history-next');
        if (btnHistPrev) {
            $on(btnHistPrev, 'click', () => {
                if (controller.historyPage > 1) {
                    controller.historyPage--;
                    controller._renderBodyContent('history');
                }
            });
        }
        if (btnHistNext) {
            $on(btnHistNext, 'click', () => {
                controller.historyPage++;
                controller._renderBodyContent('history');
            });
        }

        const btnIntervPrev = $('.btn-interventions-prev');
        const btnIntervNext = $('.btn-interventions-next');
        if (btnIntervPrev) {
            $on(btnIntervPrev, 'click', () => {
                if (controller.interventionsPage > 1) {
                    controller.interventionsPage--;
                    controller._renderBodyContent('interventions');
                }
            });
        }
        if (btnIntervNext) {
            $on(btnIntervNext, 'click', () => {
                controller.interventionsPage++;
                controller._renderBodyContent('interventions');
            });
        }
    },

    bindApiControls(controller) {
        const btnToggleVis = $id('btn-toggle-api-key-vis');
        const btnSaveApi = $id('btn-save-api-cfg');
        const btnTestApi = $id('btn-test-api-conn');
        const btnResetApi = $id('btn-reset-api-cfg');

        if (btnToggleVis) {
            $on(btnToggleVis, 'click', () => {
                controller.apiConfig.showKey = !controller.apiConfig.showKey;
                controller._renderBodyContent('api-config');
            });
        }

        if (btnSaveApi) {
            $on(btnSaveApi, 'click', () => {
                const keyValue = $val('cfg-api-key');
                if (keyValue) controller.apiConfig.apiKey = keyValue;

                ForexManager.updateConfig({
                    apiKey: controller.apiConfig.apiKey,
                    cdnBase: controller.apiConfig.cdnBase,
                    apiBase: controller.apiConfig.apiBase,
                    provider: controller.apiConfig.provider,
                    autoSyncMinutes: controller.apiConfig.autoSyncMinutes
                });

                eventBus.emit('notifications:push', {
                    title: 'Finanzas',
                    message: 'Parámetros de API de Tasas actualizados.',
                    type: 'success'
                });
                controller._loadAndPopulateData();
            });
        }

        if (btnTestApi) {
            $on(btnTestApi, 'click', async () => {
                try {
                    const testData = await ForexManager.getBCVCurrent();
                    if (testData?.current?.usd) {
                        eventBus.emit('notifications:push', {
                            title: 'Conexión Exitosa',
                            message: `Tasa BCV USD: Bs. ${testData.current.usd}`,
                            type: 'info'
                        });
                    }
                } catch (e) {
                    eventBus.emit('notifications:push', {
                        title: 'Error de Conexión',
                        message: e.message,
                        type: 'error'
                    });
                }
            });
        }

        if (btnResetApi) {
            $on(btnResetApi, 'click', () => {
                controller.apiConfig = {
                    apiKey: DOLAR_VZLA_KEY,
                    cdnBase: CDN_BASE,
                    apiBase: API_BASE,
                    provider: 'dolarvzla',
                    autoSyncMinutes: 30,
                    showKey: false
                };
                ForexManager.updateConfig(controller.apiConfig);
                controller._loadAndPopulateData();
            });
        }
    }
};

export default RateTabsBinder;

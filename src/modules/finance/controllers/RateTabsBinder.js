/**
 * RateTabsBinder - Manejador de Navegación, Paginación y Tabs para RateController
 * =========================================================================
 * Modularización para respetar el límite de 300 líneas por archivo.
 * =========================================================================
 */
import { DolarVzlaService, DOLAR_VZLA_KEY, CDN_BASE, API_BASE } from '@/core/services/DolarVzlaService.js';
import { eventBus } from '@/core/eventBus/index.js';

export const RateTabsBinder = {
    bindTabs(controller) {
        const modalContainer = document.getElementById('modal-container') || document.body;
        if (modalContainer && !modalContainer._rateTabsBound) {
            modalContainer._rateTabsBound = true;
            modalContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-rate-tab]');
                if (!btn) return;

                e.preventDefault();
                const targetTab = btn.getAttribute('data-rate-tab');
                controller.activeTab = targetTab;
                const tabsNav = btn.closest('#rate-tabs-nav') || document.getElementById('rate-tabs-nav');
                if (tabsNav) {
                    tabsNav.querySelectorAll('[data-rate-tab]').forEach(b => b.classList.remove('active'));
                }
                btn.classList.add('active');

                document.querySelectorAll('.rate-tab-content').forEach(pane => {
                    pane.classList.remove('active');
                });
                const activePane = document.getElementById(`tab-rate-${targetTab}`);
                if (activePane) activePane.classList.add('active');
            });
        }
    },

    bindPagination(controller) {
        const btnHistPrev = document.querySelector('.btn-history-prev');
        const btnHistNext = document.querySelector('.btn-history-next');
        if (btnHistPrev) {
            btnHistPrev.onclick = () => {
                if (controller.historyPage > 1) {
                    controller.historyPage--;
                    controller._renderBodyContent('history');
                }
            };
        }
        if (btnHistNext) {
            btnHistNext.onclick = () => {
                controller.historyPage++;
                controller._renderBodyContent('history');
            };
        }

        const btnIntervPrev = document.querySelector('.btn-interventions-prev');
        const btnIntervNext = document.querySelector('.btn-interventions-next');
        if (btnIntervPrev) {
            btnIntervPrev.onclick = () => {
                if (controller.interventionsPage > 1) {
                    controller.interventionsPage--;
                    controller._renderBodyContent('interventions');
                }
            };
        }
        if (btnIntervNext) {
            btnIntervNext.onclick = () => {
                controller.interventionsPage++;
                controller._renderBodyContent('interventions');
            };
        }
    },

    bindApiControls(controller) {
        const btnToggleVis = document.getElementById('btn-toggle-api-key-vis');
        const btnSaveApi = document.getElementById('btn-save-api-cfg');
        const btnTestApi = document.getElementById('btn-test-api-conn');
        const btnResetApi = document.getElementById('btn-reset-api-cfg');

        if (btnToggleVis) {
            btnToggleVis.onclick = () => {
                controller.apiConfig.showKey = !controller.apiConfig.showKey;
                controller._renderBodyContent('api-config');
            };
        }

        if (btnSaveApi) {
            btnSaveApi.onclick = () => {
                const keyEl = document.getElementById('cfg-api-key');
                if (keyEl) controller.apiConfig.apiKey = keyEl.value.trim();

                DolarVzlaService.updateConfig({
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
            };
        }

        if (btnTestApi) {
            btnTestApi.onclick = async () => {
                try {
                    const testData = await DolarVzlaService.getBCVCurrent();
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
            };
        }

        if (btnResetApi) {
            btnResetApi.onclick = () => {
                controller.apiConfig = {
                    apiKey: DOLAR_VZLA_KEY,
                    cdnBase: CDN_BASE,
                    apiBase: API_BASE,
                    provider: 'dolarvzla',
                    autoSyncMinutes: 30,
                    showKey: false
                };
                DolarVzlaService.updateConfig(controller.apiConfig);
                controller._loadAndPopulateData();
            };
        }
    }
};

export default RateTabsBinder;

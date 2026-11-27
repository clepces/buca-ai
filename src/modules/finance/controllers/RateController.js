/**
 * RateController - Controlador de Cotizaciones & Tasas Cambiarias (Módulo Finanzas)
 * =========================================================================
 * Sincronización en vivo con Supabase (finance_rates), BCV y brecha cambiaria.
 * Modularizado para cumplir el estándar de ≤ 300 líneas.
 * =========================================================================
 */
import { eventBus } from '@/core/eventBus/index.js';
import { Validators as Validator } from '@/shared/utils/validators.js';
import ModalService from '@/shared/ui/services/ModalService.js';
import { rateManagementTemplate } from '../components/RateManagementModal.js';
import { ForexManager } from '@/core/services/forex/forex-manager.js';
import { DOLAR_VZLA_KEY, CDN_BASE, API_BASE, safeRound2 } from '@/core/services/forex/forex-types.js';
import { FinanceRepository } from '../services/FinanceRepository.js';
import { sessionState } from '@/core/state/session.js';
import { RateCalculatorHelper } from './RateCalculatorHelper.js';
import { RateTabsBinder } from './RateTabsBinder.js';
import { $id, $$, $on, $mount, $show, $hide, $text } from '@/shared/utils/dom.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export function formatVariation(raw) {
    if (raw === null || raw === undefined || isNaN(Number(raw))) return '+0.00%';
    const num = safeRound2(raw);
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
}

export const RateController = {
    id: 'rate-management-modal',
    currentRate: 0,
    financialData: null,
    activeTab: 'overview',
    historyPage: 1,
    historyPerPage: 6,
    interventionsPage: 1,
    interventionsPerPage: 5,

    apiConfig: {
        apiKey: DOLAR_VZLA_KEY,
        cdnBase: CDN_BASE,
        apiBase: API_BASE,
        provider: 'dolarvzla',
        autoSyncMinutes: 30,
        showKey: false
    },

    async show() {
        Logger.debug({ layer: 'UI', role: 'CLASS', target: 'RateController', message: 'Abriendo panel de tasas cambiarias.' });
        this._renderModalContent();
        this._loadAndPopulateData();
    },

    hide() {
        ModalService.hideModal();
    },

    _renderModalContent() {
        ModalService.showModal({
            id: 'finance-rate-modal',
            scope: 'module',
            size: 'lg',
            header: {
                left: {
                    icon: 'bi-currency-exchange',
                    title: 'Gestión de Tasas',
                    subtitle: 'Mercado de Cambio',
                    badge: { text: 'FINANZAS', tone: 'primary' }
                },
                right: {
                    actions: [
                        '<button type="button" class="ui-modal__icon-btn" id="btn-refresh-rate-header" title="Sincronizar en Vivo" aria-label="Sincronizar en Vivo"><i class="bi bi-arrow-repeat" aria-hidden="true"></i></button>'
                    ]
                }
            },
            body: { html: rateManagementTemplate(this._buildTemplateData()) },
            footer: {
                left: `
                    <div class="d-flex align-items-center gap-2 text-muted small">
                        <i class="bi bi-shield-check text-success fs-6"></i>
                        <span>Sincronización Supabase Cloud con RLS & Brecha Cambiaria</span>
                    </div>
                `,
                right: `
                    <button type="button" class="btn btn-ghost rounded-pill px-4" data-action="ui:close_modal">Cancelar</button>
                    <button type="button" class="btn btn-primary rounded-pill px-4" id="btn-apply-rate">
                        <i class="bi bi-check2-circle me-1"></i> Aplicar Tasa a ERP
                    </button>
                `
            }
        });

        this._bindEvents();
    },

    _buildTemplateData() {
        return {
            currentRate: this.currentRate,
            lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            bcvData: this.financialData?.bcv,
            usdtData: this.financialData?.usdt,
            interventionsData: this.financialData?.interventions,
            history: this.financialData?.history,
            historyPage: this.historyPage,
            historyPerPage: this.historyPerPage,
            interventionsPage: this.interventionsPage,
            interventionsPerPage: this.interventionsPerPage,
            apiConfig: this.apiConfig
        };
    },

    _renderBodyContent(preserveTab = null) {
        const bodySlot = $id('ui-modal-content') || $id('modal-body-content');
        if (!bodySlot) return;

        const currentTab = preserveTab || this.activeTab || 'overview';
        this.activeTab = currentTab;

        $mount(bodySlot, rateManagementTemplate(this._buildTemplateData()));

        const tabsNav = $id('rate-tabs-nav');
        if (tabsNav) {
            $$('[data-rate-tab]', tabsNav).forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-rate-tab') === currentTab);
            });
        }
        $$('.rate-tab-content').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-rate-${currentTab}`);
        });

        this._bindEvents();
    },

    async _loadAndPopulateData() {
        const spinner = $id('sync-spinner');
        if (spinner) $show(spinner);

        try {
            const data = await ForexManager.loadAllFinancialData();
            this.financialData = data;
            if (data.bcv?.current?.usd) this.currentRate = data.bcv.current.usd;
            this._renderBodyContent();
            this._updatePageRates(this.currentRate);
        } catch (err) {
            Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'RateController', message: 'Error cargando datos financieros y tasas.', data: err?.message || err });
        } finally {
            if (spinner) $hide(spinner);
        }
    },

    _bindEvents() {
        RateTabsBinder.bindTabs(this);
        RateTabsBinder.bindPagination(this);
        RateTabsBinder.bindApiControls(this);
        RateCalculatorHelper.bind(this.financialData, this.currentRate);

        const btnRefreshHeader = $id('btn-refresh-rate-header');
        const applyBtn = $id('btn-apply-rate');
        const input = $id('manual-rate-input');
        const syncBtn = $id('btn-sync-api');
        const btnAnchorUsd = $id('btn-anchor-usd');
        const btnAnchorEur = $id('btn-anchor-eur');

        if (btnRefreshHeader) {
            $on(btnRefreshHeader, 'click', (e) => {
                e.stopPropagation();
                this._loadAndPopulateData();
            });
        }

        if (btnAnchorUsd && input) {
            $on(btnAnchorUsd, 'click', () => {
                const val = this.financialData?.bcv?.current?.usd || this.currentRate || 0;
                input.value = val;
                input.dispatchEvent(new Event('input'));
            });
        }
        if (btnAnchorEur && input) {
            $on(btnAnchorEur, 'click', () => {
                const val = this.financialData?.bcv?.current?.eur || 0;
                input.value = val;
                input.dispatchEvent(new Event('input'));
            });
        }

        if (applyBtn && input) {
            $on(applyBtn, 'click', async () => {
                const newRate = parseFloat(input.value);
                if (!Validator.isValidRate(newRate) || newRate >= 1000000) return;

                applyBtn.disabled = true;
                setButtonLoading(applyBtn, true, 'Guardando...');

                try {
                    const tenantId = sessionState.get().tenantId || 'default';
                    const parallelRate = this.financialData?.usdt?.current?.average || null;

                    await FinanceRepository.saveRateSnapshot(tenantId, {
                        rate: newRate, rateParallel: parallelRate,
                        currency: 'USD', source: 'BCV/DolarVzla'
                    });

                    this.currentRate = newRate;
                    this._updatePageRates(newRate);
                    eventBus.emit('notifications:push', {
                        title: 'Tasa ERP Actualizada',
                        message: `Se ha anclado la tasa a Bs. ${newRate.toFixed(2)} exitosamente en Supabase.`,
                        type: 'success'
                    });
                    this.hide();
                } catch {
                    eventBus.emit('notifications:push', {
                        title: 'Error de Persistencia',
                        message: 'No se pudo guardar la tasa en la base de datos.',
                        type: 'error'
                    });
                } finally {
                    applyBtn.disabled = false;
                    setButtonContent(applyBtn, 'Aplicar Tasa a ERP', 'bi bi-check2-circle');
                }
            });
        }

        if (syncBtn) {
            $on(syncBtn, 'click', () => this._loadAndPopulateData());
        }
    },

    async _updatePageRates(newRate) {
        Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'RateController', message: `Difundiendo tasa global: Bs. ${newRate}` });

        try {
            const { globalState } = await import('@/core/state/global.js');
            if (globalState && typeof globalState.updateRates === 'function') {
                globalState.updateRates({ bcv: newRate });
            }
        } catch (e) {
            Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'RateController', message: 'Error sincronizando tasa con globalState.', data: e?.message || e });
        }

        const formatted = Number(newRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        $$('.live-bcv-mini-pill span, .pill-amount').forEach(el => {
            $text(el, `Bs. ${formatted}`);
        });
        $$('#global-bcv-rate, .bcv-rate-value, .rate-bcv-display').forEach(el => {
            $text(el, Number(newRate).toFixed(2));
        });

        eventBus.emit('finance:rate_updated', { rate: newRate, timestamp: new Date().toISOString() });
    }
};

export default RateController;

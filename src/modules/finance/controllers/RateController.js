/**
 * RateController - Controlador de Cotizaciones & Tasas Cambiarias (Módulo Finanzas)
 * =========================================================================
 * Sincronización en vivo con Supabase (finance_rates), BCV y brecha cambiaria.
 * Modularizado para cumplir el estándar de ≤ 300 líneas.
 * =========================================================================
 */
import { eventBus } from '@/core/eventBus/index.js';
import { Validators as Validator } from '@/shared/utils/validators.js';
import ModalService from '@/shared/ui/overlays/ModalService.js';
import { ModalTemplates } from '@/shared/ui/templates/ModalTemplates.js';
import { rateManagementTemplate } from '../components/RateManagementModal.js';
import { DolarVzlaService, DOLAR_VZLA_KEY, CDN_BASE, API_BASE, safeRound2 } from '@/core/services/DolarVzlaService.js';
import { FinanceRepository } from '../services/FinanceRepository.js';
import { sessionState } from '@/core/state/session.js';
import { RateCalculatorHelper } from './RateCalculatorHelper.js';
import { RateTabsBinder } from './RateTabsBinder.js';

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
        console.log('[RateController] -> Opening Multi-Currency Rate Dashboard');
        this._renderModalContent();
        this._loadAndPopulateData();
    },

    hide() {
        ModalService.hideModal();
    },

    _renderModalContent() {
        ModalService.showModal({
            size: 'lg',
            header: ModalTemplates.buildHeader({
                icon: 'bi-currency-exchange',
                title: 'Gestión de Tasas',
                subtitle: 'Mercado de Cambio',
                tag: 'v1.1.3 FINANZAS',
                actions: `
                    <div class="header-actions">
                        <button type="button" class="action-mini-btn" id="btn-refresh-rate-header" title="Sincronizar en Vivo">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button type="button" class="action-mini-btn close modal-close-btn" data-action="ui:close_modal" title="Cerrar">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                `
            }),
            body: rateManagementTemplate({
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
            }),
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

    _renderBodyContent(preserveTab = null) {
        const bodySlot = document.getElementById('modal-body-content');
        if (!bodySlot) return;

        const currentTab = preserveTab || this.activeTab || 'overview';
        this.activeTab = currentTab;

        bodySlot.innerHTML = rateManagementTemplate({
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
        });

        const tabsNav = document.getElementById('rate-tabs-nav');
        if (tabsNav) {
            tabsNav.querySelectorAll('[data-rate-tab]').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-rate-tab') === currentTab);
            });
        }
        document.querySelectorAll('.rate-tab-content').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-rate-${currentTab}`);
        });

        this._bindEvents();
    },

    async _loadAndPopulateData() {
        const spinner = document.getElementById('sync-spinner');
        if (spinner) spinner.classList.remove('d-none');

        try {
            const data = await DolarVzlaService.loadAllFinancialData();
            this.financialData = data;

            if (data.bcv?.current?.usd) {
                this.currentRate = data.bcv.current.usd;
            }

            this._renderBodyContent();
            this._updatePageRates(this.currentRate);
        } catch (err) {
            console.error('[RateController] Error loading financial data:', err);
        } finally {
            if (spinner) spinner.classList.add('d-none');
        }
    },

    _bindEvents() {
        RateTabsBinder.bindTabs(this);
        RateTabsBinder.bindPagination(this);
        RateTabsBinder.bindApiControls(this);
        RateCalculatorHelper.bind(this.financialData, this.currentRate);

        const btnRefreshHeader = document.getElementById('btn-refresh-rate-header');
        const applyBtn = document.getElementById('btn-apply-rate');
        const input = document.getElementById('manual-rate-input');
        const syncBtn = document.getElementById('btn-sync-api');
        const btnAnchorUsd = document.getElementById('btn-anchor-usd');
        const btnAnchorEur = document.getElementById('btn-anchor-eur');

        if (btnRefreshHeader) {
            btnRefreshHeader.onclick = (e) => {
                e.stopPropagation();
                this._loadAndPopulateData();
            };
        }

        if (btnAnchorUsd && input) {
            btnAnchorUsd.onclick = () => {
                const val = this.financialData?.bcv?.current?.usd || this.currentRate || 0;
                input.value = val;
                input.dispatchEvent(new Event('input'));
            };
        }
        if (btnAnchorEur && input) {
            btnAnchorEur.onclick = () => {
                const val = this.financialData?.bcv?.current?.eur || 0;
                input.value = val;
                input.dispatchEvent(new Event('input'));
            };
        }

        if (applyBtn && input) {
            applyBtn.onclick = async () => {
                const newRate = parseFloat(input.value);
                if (Validator.isValidRate(newRate) && newRate < 1000000) {
                    applyBtn.disabled = true;
                    applyBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Guardando...';

                    try {
                        const tenantId = sessionState.get().tenantId || 'default';
                        const parallelRate = this.financialData?.usdt?.current?.average || null;

                        await FinanceRepository.saveRateSnapshot(tenantId, {
                            rate: newRate,
                            rateParallel: parallelRate,
                            currency: 'USD',
                            source: 'BCV/DolarVzla'
                        });

                        this.currentRate = newRate;
                        this._updatePageRates(newRate);

                        eventBus.emit('notifications:push', {
                            title: 'Tasa ERP Actualizada',
                            message: `Se ha anclado la tasa a Bs. ${newRate.toFixed(2)} exitosamente en Supabase.`,
                            type: 'success'
                        });

                        this.hide();
                    } catch (err) {
                        eventBus.emit('notifications:push', {
                            title: 'Error de Persistencia',
                            message: 'No se pudo guardar la tasa en la base de datos.',
                            type: 'error'
                        });
                    } finally {
                        applyBtn.disabled = false;
                        applyBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Aplicar Tasa a ERP';
                    }
                }
            };
        }

        if (syncBtn) {
            syncBtn.onclick = () => this._loadAndPopulateData();
        }
    },

    async _updatePageRates(newRate) {
        console.log(`[RateController] -> Broadcasting Global Rate: Bs. ${newRate}`);

        try {
            const { globalState } = await import('@/core/state/global.js');
            if (globalState && typeof globalState.updateRates === 'function') {
                globalState.updateRates({ bcv: newRate });
            }
        } catch (e) {
            console.error('[RateController] Error syncing with globalState:', e);
        }

        document.querySelectorAll('.live-bcv-mini-pill span, .pill-amount').forEach(el => {
            el.textContent = `Bs. ${Number(newRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        });

        const globalRateElements = document.querySelectorAll('#global-bcv-rate, .bcv-rate-value, .rate-bcv-display');
        globalRateElements.forEach(el => {
            el.textContent = Number(newRate).toFixed(2);
        });

        eventBus.emit('buca:rate_change', {
            rate: newRate,
            timestamp: new Date().toISOString()
        });
    }
};

export default RateController;

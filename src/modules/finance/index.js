/**
 * Módulo de Finanzas & Tesorería BUSA-I
 * =========================================================================
 * Responsable de la gestión de cotizaciones cambiarias, monedas (USD/VES/EUR/USDT),
 * regímenes de impuestos y persistencia financiera.
 */
import { eventBus } from '@/core/eventBus/index.js';
import RateController from './controllers/RateController.js';
import { FinanceRepository } from './services/FinanceRepository.js';
import { ForexManager } from '@/core/services/forex/forex-manager.js';
import { sessionState } from '@/core/state/session.js';
import { Logger } from '@/shared/utils/logger.js';

export const FinanceModule = {
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        Logger.info('FinanceModule', 'Inicializado módulo de finanzas');

        // Suscribir eventos del Bus para desacoplamiento total
        eventBus.on('finance:open_rate_modal', () => RateController.show());
        eventBus.on('ui:open_rate', () => RateController.show());
        eventBus.on('finance:sync-rates', () => this.syncRates());

        // Disparar sincronización inicial de tasas de forma asíncrona no bloqueante
        this.syncRates();
    },

    async syncRates() {
        try {
            const tenantId = sessionState.get().tenantId || 'default';
            const anchoredData = await FinanceRepository.getTenantRate(tenantId);
            if (anchoredData?.rate) {
                Logger.info('FinanceModule', `Usando tasa anclada ERP: ${anchoredData.rate}`);
                eventBus.emit('buca:rate_change', { rate: anchoredData.rate, isAnchored: true });
                return;
            }
            const data = await ForexManager.getBCVCurrent();
            if (data?.current?.usd) {
                eventBus.emit('buca:rate_change', { rate: data.current.usd, isAnchored: false });
            }
        } catch (e) {
            Logger.warn('FinanceModule', 'Fallo en sincronización de tasa en vivo:', e?.message || e);
        }
    },

    openRateModal() {
        RateController.show();
    }
};

export default FinanceModule;

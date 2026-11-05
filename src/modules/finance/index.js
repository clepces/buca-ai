/**
 * Módulo de Finanzas & Tesorería BUSA-I
 * =========================================================================
 * Responsable de la gestión de cotizaciones cambiarias, monedas (USD/VES/EUR/USDT),
 * regímenes de impuestos y persistencia financiera.
 */
import { eventBus } from '@/core/eventBus/index.js';
import RateController from './controllers/RateController.js';

export const FinanceModule = {
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('[FinanceModule] -> Inicializado módulo de finanzas');

        // Suscribir eventos del Bus para desacoplamiento total
        eventBus.on('finance:open_rate_modal', () => RateController.show());
        eventBus.on('ui:open_rate', () => RateController.show());
    },

    openRateModal() {
        RateController.show();
    }
};

export default FinanceModule;

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
        Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Finance', message: 'Módulo de finanzas inicializado.' });

        // Suscribir eventos del Bus para desacoplamiento total
        eventBus.on('finance:open_rate', () => RateController.show());
        eventBus.on('finance:sync-rates', () => this.syncRates());

        // Disparar sincronización inicial de tasas de forma asíncrona no bloqueante
        this.syncRates();
    },

    async syncRates() {
        try {
            const tenantId = sessionState.get().tenantId;
            // Solo si hay una unidad comercial seleccionada con anclaje manual explícito
            if (tenantId && tenantId !== 'default') {
                const anchoredData = await FinanceRepository.getTenantRate(tenantId);
                if (anchoredData?.rate) {
                    Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Finance', message: `Usando tasa anclada de unidad comercial: Bs. ${anchoredData.rate}` });
                    eventBus.emit('finance:rate_updated', { 
                        rate: anchoredData.rate, 
                        isAnchored: true, 
                        date: anchoredData.created_at || new Date().toISOString() 
                    });
                    return;
                }
            }

            // Consultar siempre la tasa oficial en vivo de los adaptadores
            const data = await ForexManager.getBCVCurrent();
            if (data?.current?.usd) {
                Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Finance', message: `Tasa oficial en vivo obtenida: Bs. ${data.current.usd} (${data.date || 'Hoy'})` });
                eventBus.emit('finance:rate_updated', { 
                    rate: data.current.usd, 
                    eur: data.current.eur,
                    isAnchored: false, 
                    date: data.date || new Date().toISOString() 
                });
                return;
            }

            // Fallback: Si no hay internet o falló el feed, consultar último snapshot histórico
            const fallbackSnapshot = await FinanceRepository.getTenantRate('default');
            if (fallbackSnapshot?.rate) {
                Logger.warn({ layer: 'MODULE', role: 'CLASS', target: 'Finance', message: `Modo contingencia: usando última tasa registrada (Bs. ${fallbackSnapshot.rate}).` });
                eventBus.emit('finance:rate_updated', { 
                    rate: fallbackSnapshot.rate, 
                    isAnchored: true, 
                    isFallback: true,
                    date: fallbackSnapshot.created_at 
                });
            }
        } catch (e) {
            Logger.warn({ layer: 'MODULE', role: 'CLASS', target: 'Finance', message: 'Fallo en sincronización de tasa cambiaria.', data: e?.message || e });
        }
    },

    openRateModal() {
        RateController.show();
    }
};

export default FinanceModule;

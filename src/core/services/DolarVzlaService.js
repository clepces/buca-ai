/**
 * @fileoverview DolarVzlaService - Fachada de compatibilidad monetaria sobre ForexManager
 * @module core/services/DolarVzlaService
 */

import { ForexManager } from './forex/forex-manager.js';
import {
    DOLAR_VZLA_KEY,
    CDN_BASE,
    API_BASE,
    safeRound2,
    safeRound4,
    BCVRateSchema,
    USDTRateSchema
} from './forex/forex-types.js';
import { DolarVzlaAdapter } from './forex/adapters/dolar-vzla-adapter.js';

export {
    ForexManager,
    DOLAR_VZLA_KEY,
    CDN_BASE,
    API_BASE,
    safeRound2,
    safeRound4,
    BCVRateSchema,
    USDTRateSchema
};

export class DolarVzlaService {
    static config = {
        apiKey: DOLAR_VZLA_KEY,
        cdnBase: CDN_BASE,
        apiBase: API_BASE,
        provider: 'multi-forex',
        autoSyncMinutes: 30
    };

    /**
     * Actualiza la configuración global y re-registra el adaptador con nuevas credenciales.
     * @param {Object} newCfg
     */
    static updateConfig(newCfg) {
        Object.assign(this.config, newCfg);
        ForexManager.registerAdapter(
            new DolarVzlaAdapter({
                cdnBase: this.config.cdnBase,
                apiBase: this.config.apiBase,
                apiKey: this.config.apiKey
            }, 2)
        );
        ForexManager.clearCache();
    }

    static async getBCVCurrent() {
        return ForexManager.getBCVCurrent();
    }

    static async getUSDTRate() {
        return ForexManager.getUSDTRate();
    }

    static async getInterventions() {
        return ForexManager.getInterventions();
    }

    static async getBCVHistory(year) {
        return ForexManager.getBCVHistory(year);
    }

    static async loadAllFinancialData() {
        return ForexManager.loadAllFinancialData();
    }
}

export default DolarVzlaService;

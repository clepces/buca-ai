/**
 * @fileoverview DolarVzlaService - Servicio de Integración con DolarVzla API (rates.dolarvzla.com & api.dolarvzla.com)
 * @module core/services/DolarVzlaService
 * @description Orquestador central de cotizaciones BCV, USDT Binance P2P, intervenciones e historial.
 */

import {
    DOLAR_VZLA_KEY,
    CDN_BASE,
    API_BASE,
    safeRound2,
    safeRound4,
    BCVRateSchema,
    USDTRateSchema
} from './dolar-vzla/dolar-vzla-types.js';

import {
    getFallbackBCV,
    getFallbackUSDT,
    getFallbackInterventions,
    getFallbackHistory
} from './dolar-vzla/dolar-vzla-fallback.js';

import {
    fetchBCVData,
    fetchUSDTData,
    fetchInterventionsData,
    fetchHistoryData
} from './dolar-vzla/dolar-vzla-client.js';

export {
    DOLAR_VZLA_KEY,
    CDN_BASE,
    API_BASE,
    safeRound2,
    safeRound4,
    BCVRateSchema,
    USDTRateSchema
};

export class DolarVzlaService {
    /** Configuración dinámica editable por el Superadministrador */
    static config = {
        apiKey: DOLAR_VZLA_KEY,
        cdnBase: CDN_BASE,
        apiBase: API_BASE,
        provider: 'dolarvzla',
        autoSyncMinutes: 30
    };

    /** @private Cache local para evitar peticiones redundantes y mantener persistencia */
    static _cache = {
        bcv: null,
        usdt: null,
        interventions: null,
        history: null,
        lastFetch: 0
    };

    /** @private Promesas en vuelo para deduplicación de solicitudes concurrentes */
    static _inflightPromises = {
        bcv: null,
        usdt: null,
        interventions: null,
        history: null,
        all: null
    };

    /**
     * Actualiza la configuración global del servicio de tasas.
     * @param {Object} newCfg 
     */
    static updateConfig(newCfg) {
        Object.assign(this.config, newCfg);
        this._cache = { bcv: null, usdt: null, interventions: null, history: null, lastFetch: 0 };
        this._inflightPromises = { bcv: null, usdt: null, interventions: null, history: null, all: null };
    }

    /**
     * Obtiene la tasa oficial BCV actual (USD y EUR) con porcentajes de variación real.
     * @returns {Promise<Readonly<Object>>}
     */
    static async getBCVCurrent() {
        const now = Date.now();
        if (this._cache.bcv && (now - this._cache.lastFetch < 60000)) {
            return this._cache.bcv;
        }
        if (this._inflightPromises.bcv) {
            return this._inflightPromises.bcv;
        }

        this._inflightPromises.bcv = (async () => {
            try {
                const data = await fetchBCVData(this.config);
                this._cache.bcv = data;
                return data;
            } catch (err) {
                console.warn('[DolarVzlaService] Error consultando API BCV, aplicando valores de respaldo:', err);
                return this._cache.bcv || getFallbackBCV();
            } finally {
                this._inflightPromises.bcv = null;
            }
        })();

        return this._inflightPromises.bcv;
    }

    /**
     * Obtiene la cotización del USDT Binance P2P mediante la API autenticada o CDN.
     * @returns {Promise<Readonly<Object>>}
     */
    static async getUSDTRate() {
        const now = Date.now();
        if (this._cache.usdt && (now - this._cache.lastFetch < 60000)) {
            return this._cache.usdt;
        }
        if (this._inflightPromises.usdt) {
            return this._inflightPromises.usdt;
        }

        this._inflightPromises.usdt = (async () => {
            try {
                const data = await fetchUSDTData(this.config);
                this._cache.usdt = data;
                return data;
            } catch (err) {
                console.warn('[DolarVzlaService] Error consultando API USDT Binance, aplicando valores de respaldo:', err);
                return this._cache.usdt || getFallbackUSDT();
            } finally {
                this._inflightPromises.usdt = null;
            }
        })();

        return this._inflightPromises.usdt;
    }

    /**
     * Obtiene los datos de la última intervención cambiaria del BCV.
     * @returns {Promise<Readonly<Object>>}
     */
    static async getInterventions() {
        const now = Date.now();
        if (this._cache.interventions && (now - this._cache.lastFetch < 60000)) {
            return this._cache.interventions;
        }
        if (this._inflightPromises.interventions) {
            return this._inflightPromises.interventions;
        }

        this._inflightPromises.interventions = (async () => {
            try {
                const result = await fetchInterventionsData(this.config);
                if (result.current || result.list.length > 0) {
                    this._cache.interventions = result;
                }
                return result.current ? result : (this._cache.interventions || getFallbackInterventions());
            } catch (err) {
                console.warn('[DolarVzlaService] Error fetching Interventions:', err);
                return this._cache.interventions || getFallbackInterventions();
            } finally {
                this._inflightPromises.interventions = null;
            }
        })();

        return this._inflightPromises.interventions;
    }

    /**
     * Obtiene el historial de tasas BCV por año.
     * @param {number} [year=new Date().getFullYear()]
     * @returns {Promise<Readonly<Array>>}
     */
    static async getBCVHistory(year = new Date().getFullYear()) {
        const now = Date.now();
        if (this._cache.history && (now - this._cache.lastFetch < 60000)) {
            return this._cache.history;
        }
        if (this._inflightPromises.history) {
            return this._inflightPromises.history;
        }

        this._inflightPromises.history = (async () => {
            try {
                const data = await fetchHistoryData(this.config, year);
                this._cache.history = data;
                return data;
            } catch (err) {
                console.warn('[DolarVzlaService] Error fetching BCV History:', err);
                return this._cache.history || getFallbackHistory();
            } finally {
                this._inflightPromises.history = null;
            }
        })();

        return this._inflightPromises.history;
    }

    /**
     * Carga de forma consolidada todos los indicadores del ecosistema financiero.
     * @returns {Promise<Readonly<Object>>}
     */
    static async loadAllFinancialData() {
        if (this._inflightPromises.all) {
            return this._inflightPromises.all;
        }

        this._inflightPromises.all = (async () => {
            try {
                const [bcvRes, usdtRes, intervRes, historyRes] = await Promise.allSettled([
                    this.getBCVCurrent(),
                    this.getUSDTRate(),
                    this.getInterventions(),
                    this.getBCVHistory()
                ]);

                this._cache.lastFetch = Date.now();

                return Object.freeze({
                    bcv: bcvRes.status === 'fulfilled' ? bcvRes.value : null,
                    usdt: usdtRes.status === 'fulfilled' ? usdtRes.value : null,
                    interventions: intervRes.status === 'fulfilled' ? intervRes.value : null,
                    history: historyRes.status === 'fulfilled' ? historyRes.value : Object.freeze([]),
                    timestamp: new Date().toISOString()
                });
            } finally {
                this._inflightPromises.all = null;
            }
        })();

        return this._inflightPromises.all;
    }
}

export default DolarVzlaService;

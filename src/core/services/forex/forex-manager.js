/**
 * @fileoverview forex-manager - Gestor central y orquestador multi-adaptador de divisas
 * @module core/services/forex/forex-manager
 */

import { DolarApiAdapter } from './adapters/dolar-api-adapter.js';
import { DolarVzlaAdapter } from './adapters/dolar-vzla-adapter.js';
import { MontosVeAdapter } from './adapters/montos-ve-adapter.js';
import { FallbackAdapter } from './adapters/fallback-adapter.js';
import {
    DOLAR_API_BASE,
    DOLAR_VZLA_KEY,
    CDN_BASE,
    API_BASE,
    MONTOS_VE_KEY,
    MONTOS_VE_API
} from './forex-types.js';

export class ForexManager {
    static _initialized = false;
    static _adapters = [];
    static _cache = {
        bcv: null,
        parallel: null,
        interventions: null,
        history: null,
        lastFetch: 0
    };
    static _inflight = {
        bcv: null,
        parallel: null,
        interventions: null,
        history: null,
        all: null
    };

    /** Inicializa adaptadores por defecto según orden de prioridad */
    static init() {
        if (this._initialized) return;
        this._initialized = true;

        this.registerAdapter(new DolarApiAdapter(DOLAR_API_BASE, 1));
        if (MONTOS_VE_KEY) {
            this.registerAdapter(new MontosVeAdapter({ apiBase: MONTOS_VE_API, apiKey: MONTOS_VE_KEY }, 2));
        }
        this.registerAdapter(new DolarVzlaAdapter({ cdnBase: CDN_BASE, apiBase: API_BASE, apiKey: DOLAR_VZLA_KEY }, 3));
        this.registerAdapter(new FallbackAdapter(99));
    }

    /**
     * Registra un nuevo adaptador monetario de forma extensible.
     * @param {import('./adapters/base-forex-adapter.js').BaseForexAdapter} adapter
     * @param {number} [priority]
     */
    static registerAdapter(adapter, priority) {
        if (!this._initialized && !(adapter instanceof FallbackAdapter) && !(adapter instanceof DolarApiAdapter)) {
            this.init();
        }
        if (priority !== undefined) adapter.priority = priority;
        this._adapters = this._adapters.filter(a => a.name !== adapter.name);
        this._adapters.push(adapter);
        this._adapters.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Limpia la caché en memoria y cancela promesas.
     */
    static clearCache() {
        this._cache = { bcv: null, parallel: null, interventions: null, history: null, lastFetch: 0 };
    }

    /**
     * Obtiene la tasa oficial BCV actual (USD y EUR).
     * @returns {Promise<Readonly<Object>>}
     */
    static async getBCVCurrent() {
        this.init();
        const now = Date.now();
        if (this._cache.bcv && (now - this._cache.lastFetch < 60000)) {
            return this._cache.bcv;
        }
        if (this._inflight.bcv) return this._inflight.bcv;

        this._inflight.bcv = (async () => {
            try {
                for (const adapter of this._adapters) {
                    if (!adapter.isAvailable()) continue;
                    try {
                        const data = await adapter.fetchBCV();
                        if (data?.current?.usd) {
                            this._cache.bcv = data;
                            return data;
                        }
                    } catch (err) {
                        console.warn(`[ForexManager] Adaptador ${adapter.name} falló en fetchBCV:`, err.message);
                    }
                }
                throw new Error('Todos los adaptadores de divisas fallaron');
            } finally {
                this._inflight.bcv = null;
            }
        })();

        return this._inflight.bcv;
    }

    /**
     * Obtiene la tasa de referencia USDT / Paralelo.
     * @returns {Promise<Readonly<Object>>}
     */
    static async getUSDTRate() {
        this.init();
        const now = Date.now();
        if (this._cache.parallel && (now - this._cache.lastFetch < 60000)) {
            return this._cache.parallel;
        }
        if (this._inflight.parallel) return this._inflight.parallel;

        this._inflight.parallel = (async () => {
            try {
                for (const adapter of this._adapters) {
                    if (!adapter.isAvailable()) continue;
                    try {
                        const data = await adapter.fetchParallel();
                        if (data?.current?.average) {
                            this._cache.parallel = data;
                            return data;
                        }
                    } catch (err) {
                        console.warn(`[ForexManager] Adaptador ${adapter.name} falló en fetchParallel:`, err.message);
                    }
                }
                throw new Error('Todos los adaptadores de paralelo fallaron');
            } finally {
                this._inflight.parallel = null;
            }
        })();

        return this._inflight.parallel;
    }

    /**
     * Obtiene intervenciones cambiarias del BCV.
     * @returns {Promise<Readonly<Object>>}
     */
    static async getInterventions() {
        this.init();
        if (this._cache.interventions) return this._cache.interventions;
        if (this._inflight.interventions) return this._inflight.interventions;

        this._inflight.interventions = (async () => {
            try {
                for (const adapter of this._adapters) {
                    if (typeof adapter.fetchInterventions !== 'function') continue;
                    try {
                        const data = await adapter.fetchInterventions();
                        if (data?.current || data?.list?.length > 0) {
                            this._cache.interventions = data;
                            return data;
                        }
                    } catch (err) {
                        console.warn(`[ForexManager] Intervenciones en ${adapter.name}:`, err.message);
                    }
                }
                return { current: null, list: [] };
            } finally {
                this._inflight.interventions = null;
            }
        })();

        return this._inflight.interventions;
    }

    /**
     * Obtiene el historial de cotizaciones anuales.
     * @param {number} [year]
     * @returns {Promise<Readonly<Array>>}
     */
    static async getBCVHistory(year = new Date().getFullYear()) {
        this.init();
        if (this._cache.history) return this._cache.history;
        if (this._inflight.history) return this._inflight.history;

        this._inflight.history = (async () => {
            try {
                for (const adapter of this._adapters) {
                    if (typeof adapter.fetchHistory !== 'function') continue;
                    try {
                        const data = await adapter.fetchHistory(year);
                        if (Array.isArray(data) && data.length > 0) {
                            this._cache.history = data;
                            return data;
                        }
                    } catch (err) {
                        console.warn(`[ForexManager] Historial en ${adapter.name}:`, err.message);
                    }
                }
                return [];
            } finally {
                this._inflight.history = null;
            }
        })();

        return this._inflight.history;
    }

    /**
     * Carga de forma consolidada todos los indicadores financieros.
     * @returns {Promise<Readonly<Object>>}
     */
    static async loadAllFinancialData() {
        if (this._inflight.all) return this._inflight.all;

        this._inflight.all = (async () => {
            try {
                const [bcvRes, usdtRes, intervRes, histRes] = await Promise.allSettled([
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
                    history: histRes.status === 'fulfilled' ? histRes.value : Object.freeze([]),
                    timestamp: new Date().toISOString()
                });
            } finally {
                this._inflight.all = null;
            }
        })();

        return this._inflight.all;
    }
}

export default ForexManager;

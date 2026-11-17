/**
 * @fileoverview fallback-adapter - Adaptador de contingencia estática inmutable
 * @module core/services/forex/adapters/fallback-adapter
 */

import { BaseForexAdapter } from './base-forex-adapter.js';

export class FallbackAdapter extends BaseForexAdapter {
    constructor(priority = 99) {
        super('offline-fallback', priority);
    }

    isAvailable() {
        return true;
    }

    async fetchBCV() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        return Object.freeze({
            current: Object.freeze({ usd: 914.02, eur: 1010.56, date: today }),
            previous: Object.freeze({ usd: 912.45, eur: 1008.20, date: yesterday }),
            changePercentage: Object.freeze({ usd: 0.17, eur: 0.23 }),
            _provider: this.name
        });
    }

    async fetchParallel() {
        const now = new Date().toISOString();
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        return Object.freeze({
            current: Object.freeze({ buy: 1076.87, sell: 1070.00, average: 1073.43, date: now }),
            previous: Object.freeze({ buy: 1070.00, sell: 1065.00, average: 1067.50, date: yesterday }),
            changePercentage: Object.freeze({ buy: 0.64, sell: 0.47 }),
            _provider: this.name
        });
    }

    async fetchInterventions() {
        const today = new Date().toISOString().split('T')[0];
        return Object.freeze({
            current: Object.freeze({ id: 'INT-2026-44', date: today, rate: 914.02, usdAmount: '$ 80,000,000 USD' }),
            list: Object.freeze([
                Object.freeze({ id: 'INT-2026-44', date: today, rate: 914.02, usdAmount: '$ 80M USD' }),
                Object.freeze({ id: 'INT-2026-43', date: '2026-11-10', rate: 905.10, usdAmount: '$ 70M USD' })
            ])
        });
    }

    async fetchHistory() {
        return Object.freeze([
            Object.freeze({ date: '2026-11-16', usd: 914.02, eur: 1010.56, variation: 0.17 }),
            Object.freeze({ date: '2026-11-15', usd: 912.45, eur: 1008.20, variation: 0.23 })
        ]);
    }
}

export default FallbackAdapter;

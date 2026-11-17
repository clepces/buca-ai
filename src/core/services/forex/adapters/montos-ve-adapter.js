/**
 * @fileoverview montos-ve-adapter - Adaptador de tasas para MontosVE API (montosve.com)
 * @module core/services/forex/adapters/montos-ve-adapter
 */

import { BaseForexAdapter } from './base-forex-adapter.js';
import { safeRound2 } from '../forex-types.js';

export class MontosVeAdapter extends BaseForexAdapter {
    constructor(config = {}, priority = 3) {
        super('montosve.com', priority);
        this.apiBase = config.apiBase || 'https://montosve.com/v1';
        this.apiKey = config.apiKey || '';
    }

    isAvailable() {
        return Boolean(this.apiKey && this.apiBase);
    }

    async fetchBCV() {
        if (!this.isAvailable()) {
            throw new Error('MontosVE API Key no configurada');
        }

        const res = await fetch(`${this.apiBase}/fx/rates/bcv`, {
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error(`MontosVE HTTP: ${res.status}`);
        const data = await res.json();

        const usd = safeRound2(data.usd || data.rate || data.price || 0);
        const eur = safeRound2(data.eur || usd * 1.10);
        const dateStr = (data.timestamp || new Date().toISOString()).split('T')[0];

        return Object.freeze({
            current: Object.freeze({ usd, eur, date: dateStr }),
            previous: Object.freeze({ usd, eur, date: dateStr }),
            changePercentage: Object.freeze({ usd: 0, eur: 0 }),
            _provider: this.name
        });
    }

    async fetchParallel() {
        if (!this.isAvailable()) {
            throw new Error('MontosVE API Key no configurada');
        }

        const res = await fetch(`${this.apiBase}/fx/rates/binance`, {
            headers: {
                'X-API-Key': this.apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error(`MontosVE HTTP: ${res.status}`);
        const data = await res.json();

        const avg = safeRound2(data.usdt || data.rate || data.price || 0);
        const dateStr = data.timestamp || new Date().toISOString();

        return Object.freeze({
            current: Object.freeze({ buy: avg, sell: avg, average: avg, date: dateStr }),
            previous: Object.freeze({ buy: avg, sell: avg, average: avg, date: dateStr }),
            changePercentage: Object.freeze({ buy: 0, sell: 0 }),
            _provider: `${this.name} (binance)`
        });
    }
}

export default MontosVeAdapter;

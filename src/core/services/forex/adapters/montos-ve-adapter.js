/**
 * @fileoverview montos-ve-adapter - Adaptador de tasas para MontosVE API (https://api.montosve.com/v1)
 * @module core/services/forex/adapters/montos-ve-adapter
 * @description Soporta cotizaciones oficiales BCV (USD/EUR) y mercados P2P (Binance/Bybit) con optimización de cuota.
 */

import { BaseForexAdapter } from './base-forex-adapter.js';
import { safeRound2, safeRound4 } from '../forex-types.js';

export class MontosVeAdapter extends BaseForexAdapter {
    constructor(config = {}, priority = 2) {
        super('montosve.com', priority);
        this.apiBase = config.apiBase || 'https://api.montosve.com/v1';
        this.apiKey = config.apiKey || '';
        this._cache = { data: null, timestamp: 0 };
        this._ttl = 180000; // 3 minutos de caché en memoria para preservar cuota mensual (500 req/mes)
    }

    isAvailable() {
        return Boolean(this.apiKey && this.apiBase);
    }

    /**
     * Consulta consolidada de tasas (/v1/fx/rates) con caché para minimizar consumo de créditos.
     * @private
     * @returns {Promise<Array>}
     */
    async _fetchRawRates() {
        const now = Date.now();
        if (this._cache.data && (now - this._cache.timestamp < this._ttl)) {
            return this._cache.data;
        }

        const res = await fetch(`${this.apiBase}/fx/rates`, {
            headers: {
                'X-API-Key': this.apiKey,
                'Accept': 'application/json'
            }
        });

        if (!res.ok) {
            throw new Error(`MontosVE HTTP Error: ${res.status}`);
        }

        const json = await res.json();
        const list = json?.data;
        if (!Array.isArray(list) || list.length === 0) {
            throw new Error('MontosVE: respuesta sin arreglo de tasas válido');
        }

        this._cache = { data: list, timestamp: now };
        return list;
    }

    async fetchBCV() {
        if (!this.isAvailable()) {
            throw new Error('MontosVE API Key no configurada');
        }

        const list = await this._fetchRawRates();
        const usdItem = list.find(item => item.market === 'bcv' && item.currency_pair === 'USD/VES');
        const eurItem = list.find(item => item.market === 'bcv' && item.currency_pair === 'EUR/VES');

        if (!usdItem || !usdItem.rate) {
            throw new Error('MontosVE: registro BCV USD no encontrado');
        }

        const usdRate = safeRound2(usdItem.rate);
        const eurRate = safeRound2(eurItem?.rate || usdRate * 1.10);
        const dateStr = usdItem.date || new Date().toISOString().split('T')[0];

        return Object.freeze({
            current: Object.freeze({
                usd: usdRate,
                eur: eurRate,
                date: dateStr
            }),
            previous: Object.freeze({
                usd: safeRound2(usdItem.previous_rate || usdRate),
                eur: safeRound2(eurItem?.previous_rate || eurRate),
                date: usdItem.previous_date || dateStr
            }),
            changePercentage: Object.freeze({
                usd: safeRound4(usdItem.change_percentage || 0),
                eur: safeRound4(eurItem?.change_percentage || 0)
            }),
            _provider: this.name
        });
    }

    async fetchParallel() {
        if (!this.isAvailable()) {
            throw new Error('MontosVE API Key no configurada');
        }

        const list = await this._fetchRawRates();
        const p2pItem = list.find(item => item.market === 'binance_p2p' && item.currency_pair === 'USDT/VES')
            || list.find(item => item.type === 'p2p' && item.currency_pair === 'USDT/VES');

        if (!p2pItem || !p2pItem.rate) {
            throw new Error('MontosVE: registro P2P USDT no encontrado');
        }

        const avg = safeRound2(p2pItem.rate);
        const best = safeRound2(p2pItem.best_rate || avg);
        const dateStr = p2pItem.updated_at || new Date().toISOString();

        return Object.freeze({
            current: Object.freeze({
                buy: best,
                sell: avg,
                average: avg,
                date: dateStr
            }),
            previous: Object.freeze({
                buy: best,
                sell: avg,
                average: avg,
                date: dateStr
            }),
            changePercentage: Object.freeze({
                buy: 0,
                sell: 0
            }),
            _provider: `${this.name} (${p2pItem.market || 'p2p'})`
        });
    }

    /**
     * Consulta el consumo mensual de la API (/v1/account/usage).
     * @returns {Promise<Object>}
     */
    async getAccountUsage() {
        if (!this.isAvailable()) return null;
        try {
            const res = await fetch(`${this.apiBase}/account/usage`, {
                headers: {
                    'X-API-Key': this.apiKey,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) return null;
            const json = await res.json();
            return json?.data || null;
        } catch {
            return null;
        }
    }
}

export default MontosVeAdapter;

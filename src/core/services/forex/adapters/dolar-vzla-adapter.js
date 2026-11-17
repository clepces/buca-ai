/**
 * @fileoverview dolar-vzla-adapter - Adaptador de tasas para DolarVzla (rates.dolarvzla.com & api.dolarvzla.com)
 * @module core/services/forex/adapters/dolar-vzla-adapter
 */

import { BaseForexAdapter } from './base-forex-adapter.js';
import { safeRound2, safeRound4 } from '../forex-types.js';

export class DolarVzlaAdapter extends BaseForexAdapter {
    constructor(config = {}, priority = 2) {
        super('dolarvzla.com', priority);
        this.cdnBase = config.cdnBase || 'https://rates.dolarvzla.com';
        this.apiBase = config.apiBase || 'https://api.dolarvzla.com';
        this.apiKey = config.apiKey || '';
    }

    isAvailable() {
        return Boolean(this.cdnBase || (this.apiBase && this.apiKey));
    }

    async fetchBCV() {
        if (!this.cdnBase) throw new Error('DolarVzla CDN no configurado');
        const res = await fetch(`${this.cdnBase}/bcv/current.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`DolarVzla HTTP: ${res.status}`);
        const data = await res.json();

        if (!data?.current?.usd) {
            throw new Error('DolarVzla: formato de respuesta inválido');
        }

        return Object.freeze({
            current: Object.freeze({
                usd: safeRound2(data.current.usd),
                eur: safeRound2(data.current.eur),
                date: data.current.date || new Date().toISOString().split('T')[0]
            }),
            previous: Object.freeze({
                usd: safeRound2(data.previous?.usd || data.current.usd),
                eur: safeRound2(data.previous?.eur || data.current.eur),
                date: data.previous?.date || new Date(Date.now() - 86400000).toISOString().split('T')[0]
            }),
            changePercentage: Object.freeze({
                usd: safeRound4(data.changePercentage?.usd ?? 0),
                eur: safeRound4(data.changePercentage?.eur ?? 0)
            }),
            _provider: this.name
        });
    }

    async fetchParallel() {
        let res = null;
        if (this.apiKey && this.apiBase) {
            res = await fetch(`${this.apiBase}/public/usdt/exchange-rate?t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'x-dolarvzla-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            }).catch(() => null);
        }

        if (!res || !res.ok) {
            res = await fetch(`${this.cdnBase}/bcv/usdt.json?t=${Date.now()}`, { cache: 'no-store' }).catch(() => null);
        }

        if (!res || !res.ok) throw new Error(`DolarVzla HTTP: ${res ? res.status : 'Network'}`);
        const data = await res.json();

        if (!data?.current?.average) {
            throw new Error('DolarVzla: formato de respuesta USDT inválido');
        }

        return Object.freeze({
            current: Object.freeze({
                buy: safeRound2(data.current.buy),
                sell: safeRound2(data.current.sell),
                average: safeRound2(data.current.average),
                date: data.current.date || new Date().toISOString()
            }),
            previous: Object.freeze({
                buy: safeRound2(data.previous?.buy || data.current.buy),
                sell: safeRound2(data.previous?.sell || data.current.sell),
                average: safeRound2(data.previous?.average || data.current.average),
                date: data.previous?.date || new Date(Date.now() - 86400000).toISOString()
            }),
            changePercentage: Object.freeze({
                buy: safeRound4(data.changePercentage?.buy ?? 0),
                sell: safeRound4(data.changePercentage?.sell ?? 0)
            }),
            _provider: `${this.name} (usdt)`
        });
    }

    async fetchInterventions() {
        if (!this.cdnBase) return { current: null, list: [] };

        const [currRes, listRes] = await Promise.allSettled([
            fetch(`${this.cdnBase}/interventions/current.json?t=${Date.now()}`, { cache: 'no-store' }),
            fetch(`${this.cdnBase}/interventions/list.json?t=${Date.now()}`, { cache: 'no-store' })
        ]);

        let current = null;
        let list = [];

        if (currRes.status === 'fulfilled' && currRes.value.ok) {
            current = await currRes.value.json();
        }
        if (listRes.status === 'fulfilled' && listRes.value.ok) {
            const rawList = await listRes.value.json();
            if (Array.isArray(rawList)) {
                list = rawList.slice(0, 50).map(item => Object.freeze({
                    ...item,
                    rate: safeRound2(item.rate),
                    date: item.date ? String(item.date).split('T')[0] : ''
                }));
            }
        }

        if (current && current.date) {
            current = Object.freeze({
                ...current,
                rate: safeRound2(current.rate),
                date: String(current.date).split('T')[0]
            });
        }

        return Object.freeze({ current, list: Object.freeze(list) });
    }

    async fetchHistory(year = new Date().getFullYear()) {
        if (!this.cdnBase) return [];
        const res = await fetch(`${this.cdnBase}/bcv/${year}/list.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`DolarVzla History HTTP: ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) return [];

        return Object.freeze(data.slice(0, 50).map(item => Object.freeze({
            ...item,
            usd: safeRound2(item.usd),
            eur: safeRound2(item.eur),
            variation: safeRound4(item.variation),
            date: item.date ? String(item.date).split('T')[0] : ''
        })));
    }
}

export default DolarVzlaAdapter;

/**
 * @fileoverview dolar-api-adapter - Adaptador de tasas para DolarApi.com (ve.dolarapi.com)
 * @module core/services/forex/adapters/dolar-api-adapter
 * @description Proveedor público gratuito sin límites restrictivos, sin API key y con CORS abierto.
 */

import { BaseForexAdapter } from './base-forex-adapter.js';
import { safeRound2 } from '../forex-types.js';

export class DolarApiAdapter extends BaseForexAdapter {
    constructor(baseUrl = 'https://ve.dolarapi.com/v1', priority = 1) {
        super('dolarapi.com', priority);
        this.baseUrl = baseUrl;
    }

    isAvailable() {
        return Boolean(this.baseUrl);
    }

    async fetchBCV() {
        const [usdRes, eurRes] = await Promise.all([
            fetch(`${this.baseUrl}/dolares/oficial`, { cache: 'no-store' }),
            fetch(`${this.baseUrl}/euros/oficial`, { cache: 'no-store' })
        ]);

        if (!usdRes.ok) {
            throw new Error(`DolarApi HTTP Error (USD): ${usdRes.status}`);
        }

        const usdData = await usdRes.json();
        const eurData = eurRes.ok ? await eurRes.json() : null;

        if (!usdData?.promedio) {
            throw new Error('DolarApi: formato de respuesta BCV inválido');
        }

        const usdRate = safeRound2(usdData.promedio);
        const eurRate = safeRound2(eurData?.promedio || usdRate * 1.10);
        const dateStr = (usdData.fechaActualizacion || new Date().toISOString()).split('T')[0];

        return Object.freeze({
            current: Object.freeze({ usd: usdRate, eur: eurRate, date: dateStr }),
            previous: Object.freeze({ usd: usdRate, eur: eurRate, date: dateStr }),
            changePercentage: Object.freeze({ usd: 0, eur: 0 }),
            _provider: this.name
        });
    }

    async fetchParallel() {
        const res = await fetch(`${this.baseUrl}/dolares`, { cache: 'no-store' });
        if (!res.ok) {
            throw new Error(`DolarApi HTTP Error (Paralelo): ${res.status}`);
        }

        const list = await res.json();
        if (!Array.isArray(list)) {
            throw new Error('DolarApi: respuesta no es un array');
        }

        const paralelo = list.find(item => item.fuente === 'paralelo');
        if (!paralelo?.promedio) {
            throw new Error('DolarApi: tasa paralela no encontrada en listado');
        }

        const avg = safeRound2(paralelo.promedio);
        const dateStr = paralelo.fechaActualizacion || new Date().toISOString();

        return Object.freeze({
            current: Object.freeze({ buy: avg, sell: avg, average: avg, date: dateStr }),
            previous: Object.freeze({ buy: avg, sell: avg, average: avg, date: dateStr }),
            changePercentage: Object.freeze({ buy: 0, sell: 0 }),
            _provider: `${this.name} (paralelo)`
        });
    }
}

export default DolarApiAdapter;

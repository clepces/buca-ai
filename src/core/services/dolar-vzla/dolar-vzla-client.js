/**
 * @fileoverview dolar-vzla-client - Adaptador HTTP para consumo de endpoints CDN y API de DolarVzla
 * @module core/services/dolar-vzla/dolar-vzla-client
 */

import { safeRound2, safeRound4 } from './dolar-vzla-types.js';

/**
 * Consulta la tasa oficial BCV actual (USD y EUR) desde el CDN.
 * @param {Object} config
 * @returns {Promise<Readonly<Object>>}
 */
export async function fetchBCVData(config) {
    const res = await fetch(`${config.cdnBase}/bcv/current.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();

    if (!data?.current?.usd) {
        throw new Error('Formato de respuesta inválido');
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
        })
    });
}

/**
 * Consulta la tasa de Binance P2P USDT mediante API autenticada o CDN de respaldo.
 * @param {Object} config
 * @returns {Promise<Readonly<Object>>}
 */
export async function fetchUSDTData(config) {
    let res = null;
    if (config.apiKey) {
        res = await fetch(`${config.apiBase}/public/usdt/exchange-rate?t=${Date.now()}`, {
            method: 'GET',
            headers: {
                'x-dolarvzla-key': config.apiKey,
                'Content-Type': 'application/json'
            }
        }).catch(() => null);
    }

    if (!res || !res.ok) {
        res = await fetch(`${config.cdnBase}/bcv/usdt.json?t=${Date.now()}`, { cache: 'no-store' }).catch(() => null);
    }

    if (!res || !res.ok) throw new Error(`HTTP Error: ${res ? res.status : 'Network'}`);
    const data = await res.json();

    if (!data?.current?.average) {
        throw new Error('Formato de respuesta USDT inválido');
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
        })
    });
}

/**
 * Consulta intervenciones cambiarias del BCV.
 * @param {Object} config
 * @returns {Promise<Readonly<Object>>}
 */
export async function fetchInterventionsData(config) {
    const [currRes, listRes] = await Promise.allSettled([
        fetch(`${config.cdnBase}/interventions/current.json?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`${config.cdnBase}/interventions/list.json?t=${Date.now()}`, { cache: 'no-store' })
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

/**
 * Consulta el historial de tasas BCV para un año específico.
 * @param {Object} config
 * @param {number} year
 * @returns {Promise<Readonly<Array>>}
 */
export async function fetchHistoryData(config, year) {
    const res = await fetch(`${config.cdnBase}/bcv/${year}/list.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Historial vacío');
    }

    return Object.freeze(data.slice(0, 50).map(item => Object.freeze({
        ...item,
        usd: safeRound2(item.usd),
        eur: safeRound2(item.eur),
        variation: safeRound4(item.variation),
        date: item.date ? String(item.date).split('T')[0] : ''
    })));
}

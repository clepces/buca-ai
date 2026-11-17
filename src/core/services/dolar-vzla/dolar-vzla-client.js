/**
 * @fileoverview dolar-vzla-client - Adaptador HTTP Multi-Proveedor (DolarApi.com + DolarVzla CDN)
 * @module core/services/dolar-vzla/dolar-vzla-client
 * @description Estrategia cascada: DolarApi.com (gratis, sin API key) → DolarVzla CDN (respaldo)
 */

import { safeRound2, safeRound4 } from './dolar-vzla-types.js';

/**
 * Proveedor Principal: DolarApi.com (ve.dolarapi.com)
 * - 100% gratuito, sin API key, CORS abierto, sin rate limit conocido.
 * - Endpoints: /v1/dolares/oficial, /v1/euros/oficial, /v1/dolares (incluye paralelo)
 */
async function fetchBCVFromDolarApi() {
    const [usdRes, eurRes] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial', { cache: 'no-store' }),
        fetch('https://ve.dolarapi.com/v1/euros/oficial', { cache: 'no-store' })
    ]);

    if (!usdRes.ok || !eurRes.ok) {
        throw new Error(`DolarApi HTTP: USD=${usdRes.status} EUR=${eurRes.status}`);
    }

    const [usdData, eurData] = await Promise.all([usdRes.json(), eurRes.json()]);

    if (!usdData?.promedio) {
        throw new Error('DolarApi: formato de respuesta inválido');
    }

    const usdRate = safeRound2(usdData.promedio);
    const eurRate = safeRound2(eurData?.promedio || usdRate * 1.10);
    const dateStr = (usdData.fechaActualizacion || new Date().toISOString()).split('T')[0];

    return Object.freeze({
        current: Object.freeze({ usd: usdRate, eur: eurRate, date: dateStr }),
        previous: Object.freeze({ usd: usdRate, eur: eurRate, date: dateStr }),
        changePercentage: Object.freeze({ usd: 0, eur: 0 }),
        _provider: 'dolarapi.com'
    });
}

/**
 * Proveedor Secundario: DolarVzla CDN (rates.dolarvzla.com)
 * - Gratuito para BCV/intervenciones, requiere API key para USDT (Binance).
 */
async function fetchBCVFromDolarVzla(config) {
    const res = await fetch(`${config.cdnBase}/bcv/current.json?t=${Date.now()}`, { cache: 'no-store' });
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
        _provider: 'dolarvzla.com'
    });
}

/**
 * Consulta la tasa oficial BCV con estrategia cascada multi-proveedor.
 * @param {Object} config
 * @returns {Promise<Readonly<Object>>}
 */
export async function fetchBCVData(config) {
    // Intento 1: DolarApi.com (sin API key, siempre disponible)
    try {
        return await fetchBCVFromDolarApi();
    } catch (err) {
        console.warn('[RateClient] DolarApi.com no disponible, intentando DolarVzla CDN:', err.message);
    }

    // Intento 2: DolarVzla CDN (respaldo)
    if (config.cdnBase) {
        return await fetchBCVFromDolarVzla(config);
    }

    throw new Error('Ningún proveedor de tasas BCV disponible');
}

/**
 * Consulta la tasa USDT/VES paralela vía DolarApi.com (paralelo) o DolarVzla CDN/API.
 * @param {Object} config
 * @returns {Promise<Readonly<Object>>}
 */
export async function fetchUSDTData(config) {
    // Intento 1: DolarApi.com paralelo (aproximación a P2P sin API key)
    try {
        const res = await fetch('https://ve.dolarapi.com/v1/dolares', { cache: 'no-store' });
        if (res.ok) {
            const list = await res.json();
            const paralelo = Array.isArray(list)
                ? list.find(item => item.fuente === 'paralelo')
                : null;

            if (paralelo?.promedio) {
                const avg = safeRound2(paralelo.promedio);
                const dateStr = paralelo.fechaActualizacion || new Date().toISOString();
                return Object.freeze({
                    current: Object.freeze({ buy: avg, sell: avg, average: avg, date: dateStr }),
                    previous: Object.freeze({ buy: avg, sell: avg, average: avg, date: dateStr }),
                    changePercentage: Object.freeze({ buy: 0, sell: 0 }),
                    _provider: 'dolarapi.com (paralelo)'
                });
            }
        }
    } catch (err) {
        console.warn('[RateClient] DolarApi paralelo fallback:', err.message);
    }

    // Intento 2: DolarVzla API autenticada (si hay API key válida)
    if (config.apiKey && config.apiBase) {
        try {
            const res = await fetch(`${config.apiBase}/public/usdt/exchange-rate?t=${Date.now()}`, {
                method: 'GET',
                headers: {
                    'x-dolarvzla-key': config.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data?.current?.average) {
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
                        _provider: 'dolarvzla.com (api)'
                    });
                }
            }
        } catch (err) {
            console.warn('[RateClient] DolarVzla API autenticada:', err.message);
        }
    }

    // Intento 3: DolarVzla CDN (USDT estático)
    if (config.cdnBase) {
        const res = await fetch(`${config.cdnBase}/bcv/usdt.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data?.current?.average) {
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
                    _provider: 'dolarvzla.com (cdn)'
                });
            }
        }
    }

    throw new Error('Ningún proveedor de tasas USDT disponible');
}

/**
 * Consulta intervenciones cambiarias del BCV (solo DolarVzla CDN).
 * @param {Object} config
 * @returns {Promise<Readonly<Object>>}
 */
export async function fetchInterventionsData(config) {
    if (!config.cdnBase) {
        return Object.freeze({ current: null, list: Object.freeze([]) });
    }

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
 * Consulta el historial de tasas BCV (solo DolarVzla CDN).
 * @param {Object} config
 * @param {number} year
 * @returns {Promise<Readonly<Array>>}
 */
export async function fetchHistoryData(config, year) {
    if (!config.cdnBase) {
        throw new Error('CDN no configurado para historial');
    }

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

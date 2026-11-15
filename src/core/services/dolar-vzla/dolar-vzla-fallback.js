/**
 * @fileoverview dolar-vzla-fallback - Estructuras de datos de respaldo en caso de contingencia o fallo de red
 * @module core/services/dolar-vzla/dolar-vzla-fallback
 */

export function getFallbackBCV() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return Object.freeze({
        current: Object.freeze({ usd: 889.58, eur: 991.25, date: today }),
        previous: Object.freeze({ usd: 889.26, eur: 992.80, date: yesterday }),
        changePercentage: Object.freeze({ usd: 0.036, eur: -0.156 })
    });
}

export function getFallbackUSDT() {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    return Object.freeze({
        current: Object.freeze({ buy: 989.31, sell: 982.43, average: 985.87, date: now }),
        previous: Object.freeze({ buy: 991.76, sell: 987.15, average: 989.46, date: yesterday }),
        changePercentage: Object.freeze({ buy: -0.25, sell: -0.48 })
    });
}

export function getFallbackInterventions() {
    const today = new Date().toISOString().split('T')[0];
    return Object.freeze({
        current: Object.freeze({ id: 'INT-2026-42', date: today, rate: 889.58, usdAmount: '$ 75,000,000 USD' }),
        list: Object.freeze([
            Object.freeze({ id: 'INT-2026-42', date: today, rate: 889.58, usdAmount: '$ 75M USD' }),
            Object.freeze({ id: 'INT-2026-41', date: '2026-10-27', rate: 885.20, usdAmount: '$ 60M USD' }),
            Object.freeze({ id: 'INT-2026-40', date: '2026-10-20', rate: 880.15, usdAmount: '$ 80M USD' }),
            Object.freeze({ id: 'INT-2026-39', date: '2026-10-13', rate: 875.40, usdAmount: '$ 50M USD' }),
            Object.freeze({ id: 'INT-2026-38', date: '2026-10-06', rate: 870.10, usdAmount: '$ 65M USD' }),
            Object.freeze({ id: 'INT-2026-37', date: '2026-09-29', rate: 865.00, usdAmount: '$ 70M USD' }),
            Object.freeze({ id: 'INT-2026-36', date: '2026-09-22', rate: 860.25, usdAmount: '$ 55M USD' })
        ])
    });
}

export function getFallbackHistory() {
    return Object.freeze([
        Object.freeze({ date: '2026-11-02', usd: 889.58, eur: 991.25, variation: 0.04 }),
        Object.freeze({ date: '2026-10-30', usd: 889.26, eur: 992.80, variation: 0.12 }),
        Object.freeze({ date: '2026-10-29', usd: 888.15, eur: 991.00, variation: -0.08 }),
        Object.freeze({ date: '2026-10-28', usd: 888.85, eur: 992.10, variation: 0.15 }),
        Object.freeze({ date: '2026-10-27', usd: 887.50, eur: 990.40, variation: 0.05 })
    ]);
}

/**
 * @fileoverview forex-types - Esquemas Zod, constantes y utilidades numéricas de divisas
 * @module core/services/forex/forex-types
 */

import { z } from 'zod';
import { ENV } from '../../config/environment.js';

export const DOLAR_API_BASE = ENV.FOREX?.DOLAR_API?.BASE || 'https://ve.dolarapi.com/v1';
export const DOLAR_VZLA_KEY = ENV.FOREX?.DOLAR_VZLA?.KEY || '';
export const CDN_BASE = ENV.FOREX?.DOLAR_VZLA?.CDN || 'https://rates.dolarvzla.com';
export const API_BASE = ENV.FOREX?.DOLAR_VZLA?.API || 'https://api.dolarvzla.com';
export const MONTOS_VE_KEY = ENV.FOREX?.MONTOS_VE?.KEY || '';
export const MONTOS_VE_API = ENV.FOREX?.MONTOS_VE?.API || 'https://api.montosve.com/v1';

/**
 * Redondeo exacto a 2 decimales sin desbordamiento de coma flotante.
 * @param {number|string} val
 * @returns {number}
 */
export function safeRound2(val) {
    const num = Number(val);
    if (isNaN(num)) return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Redondeo exacto a 4 decimales para variaciones finas.
 * @param {number|string} val
 * @returns {number}
 */
export function safeRound4(val) {
    const num = Number(val);
    if (isNaN(num)) return 0;
    return Math.round((num + Number.EPSILON) * 10000) / 10000;
}

export const BCVRateSchema = z.object({
    current: z.object({
        usd: z.number(),
        eur: z.number(),
        date: z.string()
    }),
    previous: z.object({
        usd: z.number(),
        eur: z.number(),
        date: z.string()
    }).optional(),
    changePercentage: z.object({
        usd: z.number(),
        eur: z.number()
    }).optional(),
    _provider: z.string().optional()
});

export const USDTRateSchema = z.object({
    current: z.object({
        buy: z.number(),
        sell: z.number(),
        average: z.number(),
        date: z.string()
    }),
    previous: z.object({
        buy: z.number(),
        sell: z.number(),
        average: z.number(),
        date: z.string()
    }).optional(),
    changePercentage: z.object({
        buy: z.number().optional(),
        sell: z.number().optional()
    }).optional(),
    _provider: z.string().optional()
});

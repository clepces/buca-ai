/**
 * @fileoverview dolar-vzla-types - Esquemas de validación Zod, constantes y utilidades numéricas
 * @module core/services/dolar-vzla/dolar-vzla-types
 */

import { z } from 'zod';
import { ENV } from '@/core/config/environment.js';

export const DOLAR_VZLA_KEY = ENV.DOLAR_VZLA.KEY;
export const CDN_BASE = ENV.DOLAR_VZLA.CDN;
export const API_BASE = ENV.DOLAR_VZLA.API;

/**
 * Función pura para redondeo exacto a 2 decimales sin desbordamiento de coma flotante.
 * @param {number|string} val
 * @returns {number}
 */
export function safeRound2(val) {
    const num = Number(val);
    if (isNaN(num)) return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Función pura para redondeo exacto a 4 decimales para variaciones finas.
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
    }).optional()
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
    }).optional()
});

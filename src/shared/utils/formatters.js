/**
 * @fileoverview Number & Currency Formatters (Clean Core ES6+)
 * @module shared/utils/formatters
 * @description Formateo numérico y de divisas estandarizado conforme al estándar venezolano (es-VE) y multidivisa.
 */

/**
 * Formatea un número según las opciones regionales especificadas (por defecto es-VE).
 * @param {number} num - Número a formatear
 * @param {Intl.NumberFormatOptions} [options={}] - Opciones de Intl.NumberFormat
 * @returns {string} Número formateado
 */
export const formatNumber = (num, options = {}) => {
    const val = typeof num === 'number' ? num : Number(num) || 0;
    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options
    }).format(val);
};

/**
 * Formatea un número en notación abreviada (ej. 10k, 1.5M) para dashboards y widgets compactos.
 * @param {number} num 
 * @returns {string}
 */
export const formatNumberAbbreviated = (num) => {
    const val = typeof num === 'number' ? num : Number(num) || 0;
    if (Math.abs(val) < 10000) {
        return formatNumber(val);
    }
    return new Intl.NumberFormat('es-VE', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(val);
};

/**
 * Formatea un valor en divisa (USD, VES, EUR).
 * @param {number|string} val - Monto monetario
 * @param {string} [symbol='$'] - Símbolo monetario
 * @returns {string} Cadena formateada
 */
export const formatCurrency = (val, symbol = '$') => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return `${symbol} ${formatNumber(num)}`;
};

/**
 * Normaliza valores de entrada para comparaciones o sanitización.
 * @param {any} val 
 * @returns {string|number}
 */
export const normalizeValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'number') return val;
    return String(val).trim();
};

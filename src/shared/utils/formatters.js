/**
 * TOP - MIGRADO DESDE ERP MODULAR
 * Carpeta Origen: buca-app-modular/src/shared/utils/formatters.js
 */

/**
 * Formats a number with specific options.
 * @param {number} num - The number to format.
 * @param {object} options - Intl.NumberFormat options.
 * @returns {string} The formatted number.
 */
export const formatNumber = (num, options = {}) => {
    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options
    }).format(num);
};

/**
 * Formats a number with abbreviation for large numbers (e.g., 10k, 1M).
 * Falls back to standard formatting for smaller numbers.
 * @param {number} num - The number to format.
 * @returns {string} The formatted number.
 */
export const formatNumberAbbreviated = (num) => {
    if (num < 10000) {
        return formatNumber(num);
    }
    return new Intl.NumberFormat('es-VE', {
        notation: 'compact',
        maximumFractionDigits: 2
    }).format(num);
};

/**
 * Formats a currency value.
 * @param {number} val - The value to format.
 * @param {string} symbol - The currency symbol to prepend.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (val, symbol = '$') => {
    const num = typeof val === 'number' ? val : parseFloat(val) || 0;
    return `${symbol} ${formatNumber(num)}`;
};

/**
 * Normalizes a value for comparison or display.
 * @param {any} val - The value to normalize.
 * @returns {string|number} The normalized value.
 */
export const normalizeValue = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'number') return val;
    return val;
};

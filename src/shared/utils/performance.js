/**
 * @fileoverview Performance & Execution Rate Utilities
 * @module shared/utils/performance
 * @description Control de cadencia de eventos (Throttle y Debounce) para optimización del Event Loop.
 */

/**
 * Limita la frecuencia de ejecución de una función (Throttle).
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Intervalo mínimo en milisegundos
 * @returns {Function}
 */
export const throttle = (func, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};

/**
 * Retrasa la ejecución de una función hasta que transcurra un tiempo sin invocaciones (Debounce).
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {Function}
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

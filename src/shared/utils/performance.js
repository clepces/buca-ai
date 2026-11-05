/**
 * Utilidades de rendimiento para BUCA ES6+ 2026.
 */

/**
 * Limita la frecuencia de ejecución de una función.
 * @param {Function} func - Función a ejecutar.
 * @param {number} limit - Tiempo en ms.
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        };
    };
};

/**
 * Retrasa la ejecución de una función hasta que pase un tiempo sin llamadas.
 * @param {Function} func 
 * @param {number} delay 
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

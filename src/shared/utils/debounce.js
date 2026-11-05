/**
 * Debounce Function
 * 
 * Delays the execution of a function until after the "wait" time 
 * has elapsed since the last time the debounced function was invoked.
 * 
 * @param {Function} func 
 * @param {number} delay (ms)
 * @returns {Function}
 */
export function debounce(func, delay = 300) {
    let timeout;
    return (...args) => {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

/**
 * @fileoverview System & Window Helper (Kernel Layer Utilities)
 * @module core/utils/system-helper
 * @description Abstracción segura de ciclo de vida del entorno, listeners de ventana
 * y utilidades de hardware para proteger el Kernel y evitar accesos descontrolados a window.
 */

/**
 * Comprueba si el código se ejecuta en un contexto de navegador válido.
 * @returns {boolean}
 */
export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Registra de forma segura un escuchador de eventos en el objeto window global.
 * Retorna automáticamente una función de limpieza (teardown) para evitar memory leaks.
 * 
 * @param {string} event - Nombre del evento (ej: 'beforeunload', 'online', 'offline')
 * @param {Function} handler - Callback a ejecutar
 * @param {AddEventListenerOptions|boolean} [options]
 * @returns {Function} Función para cancelar el listener
 */
export const $onWindow = (event, handler, options) => {
    if (!isBrowser() || typeof handler !== 'function') return () => {};
    window.addEventListener(event, handler, options);
    return () => {
        window.removeEventListener(event, handler, options);
    };
};

/**
 * Remueve un escuchador previamente registrado en window.
 * @param {string} event
 * @param {Function} handler
 * @param {EventListenerOptions|boolean} [options]
 */
export const $offWindow = (event, handler, options) => {
    if (!isBrowser() || typeof handler !== 'function') return;
    window.removeEventListener(event, handler, options);
};

/**
 * Recarga la aplicación de forma segura protegiendo transacciones en curso.
 * @param {string} [destination] - Ruta de redirección opcional
 */
export const safeReload = (destination) => {
    if (!isBrowser()) return;
    if (destination) {
        window.location.href = destination;
    } else {
        window.location.reload();
    }
};

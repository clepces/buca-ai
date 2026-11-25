/**
 * @fileoverview System & Window Helper (Kernel Layer Utilities)
 * @module core/utils/system-helper
 * @description Abstracción segura de ciclo de vida del entorno, listeners de ventana,
 * manipulación de historial y utilidades para evitar accesos descontrolados al objeto global window.
 */
import { ENV } from '@/core/config/environment.js';

/**
 * Comprueba si el código se ejecuta en un contexto de navegador válido.
 * @returns {boolean}
 */
export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Obtiene la ruta actual (pathname) de forma segura.
 * @returns {string}
 */
export const getPath = () => (isBrowser() ? window.location.pathname : '/');

/**
 * Reemplaza la URL en el historial del navegador sin disparar recarga.
 * @param {string} url - Nueva ruta
 */
export const replaceHistory = (url) => {
    if (isBrowser() && window.history && typeof window.history.replaceState === 'function') {
        window.history.replaceState({}, '', url);
    }
};

/**
 * Agrega una nueva entrada al historial de navegación.
 * @param {string} url - Ruta de destino
 */
export const pushHistory = (url) => {
    if (isBrowser() && window.history && typeof window.history.pushState === 'function') {
        window.history.pushState({}, '', url);
    }
};

/**
 * Desplaza la ventana suavemente o a coordenadas dadas.
 * @param {ScrollToOptions|number} options 
 */
export const scrollWindowTo = (options = { top: 0, behavior: 'smooth' }) => {
    if (isBrowser() && typeof window.scrollTo === 'function') {
        window.scrollTo(options);
    }
};

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

/**
 * Obtiene una propiedad global de forma segura sin peligro de excepción.
 * @param {string} key 
 * @returns {any}
 */
export const getGlobal = (key) => (isBrowser() ? window[key] : undefined);

/**
 * Asigna una propiedad global de forma segura.
 * @param {string} key 
 * @param {any} val 
 */
export const setGlobal = (key, val) => {
    if (isBrowser()) window[key] = val;
};

/**
 * Obtiene el ancho del viewport de forma segura.
 * @returns {number}
 */
export const getViewportWidth = () => (isBrowser() ? window.innerWidth : 0);

/**
 * Obtiene el alto del viewport de forma segura.
 * @returns {number}
 */
export const getViewportHeight = () => (isBrowser() ? window.innerHeight : 0);

/**
 * Verifica si el navegador está en modo pantalla completa.
 * @returns {boolean}
 */
export const isFullscreen = () => (isBrowser() ? Boolean(document.fullscreenElement) : false);

/**
 * Solicita pantalla completa en el elemento raíz del documento.
 * @returns {Promise<void>}
 */
export const requestFullscreen = async () => {
    if (isBrowser() && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
    }
};

/**
 * Sale del modo pantalla completa de forma segura.
 * @returns {Promise<void>}
 */
export const exitFullscreen = async () => {
    if (isBrowser() && document.exitFullscreen) {
        await document.exitFullscreen();
    }
};

/**
 * Obtiene el hash de la URL actual de forma segura.
 * @returns {string}
 */
export const getHash = () => (isBrowser() ? window.location.hash : '');

/**
 * Obtiene el hostname actual de forma segura.
 * @returns {string}
 */
export const getHostname = () => (isBrowser() ? window.location.hostname : '');

/**
 * Retorna el origen (origin) del navegador validado de forma estricta contra la lista permitida del entorno.
 * Previene redirecciones arbitrarias o mezcla de orígenes entre desarrollo y producción.
 * @returns {string}
 * @throws {Error} Si el origen no coincide con el entorno esperado.
 */
export const getValidatedOrigin = () => {
    const isProd = Boolean(ENV?.IS_PROD);
    const expectedOrigin = isProd ? 'https://app.buca.com.ve' : 'http://localhost:3000';

    if (!isBrowser()) {
        return expectedOrigin;
    }

    const currentOrigin = window.location.origin;
    if (currentOrigin !== expectedOrigin) {
        throw new Error(`[Security] Origen no permitido para redirección de autenticación: "${currentOrigin}". Esperado: "${expectedOrigin}".`);
    }

    return currentOrigin;
};

/**
 * @fileoverview Async & Task Helpers (Kernel Layer Utilities)
 * @module core/utils/async-helper
 * @description Gestión asíncrona no bloqueante, timeouts seguros y ejecución en reposo (requestIdleCallback).
 */

import { isBrowser } from './system-helper.js';

/**
 * Promesa que se resuelve tras transcurrir una cantidad determinada de milisegundos.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ejecuta una tarea en segundo plano durante el tiempo de reposo del navegador (requestIdleCallback),
 * con fallback transparente a setTimeout para entornos que no lo soportan.
 * 
 * @param {Function} callback - Tarea a ejecutar
 * @param {number} [timeoutMs=2000] - Tiempo máximo antes de forzar la ejecución
 * @returns {number|any} Identificador de la tarea
 */
export const runOnIdle = (callback, timeoutMs = 2000) => {
    if (isBrowser() && typeof window.requestIdleCallback === 'function') {
        return window.requestIdleCallback(callback, { timeout: timeoutMs });
    }
    return setTimeout(callback, 50);
};

/**
 * Envuelve una promesa con un tiempo límite estricto para evitar bloqueos del Kernel.
 * @template T
 * @param {Promise<T>} promise 
 * @param {number} ms 
 * @param {string} [errorMsg='Operation timed out'] 
 * @returns {Promise<T>}
 */
export const withTimeout = (promise, ms, errorMsg = 'Operation timed out') => {
    let timerId;
    const timeoutPromise = new Promise((_, reject) => {
        timerId = setTimeout(() => reject(new Error(errorMsg)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timerId);
    });
};

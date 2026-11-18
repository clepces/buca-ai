/**
 * @fileoverview DOM Utilities & Helpers (Clean Core Vanilla JS)
 * @module shared/utils/dom
 * @description Utilidades de alto rendimiento para manipulación segura del DOM,
 * selectores optimizados, gestión de estado de botones sin innerHTML y control por clases CSS.
 */

/**
 * Resuelve un elemento a partir de una referencia o de un selector/ID.
 * @param {HTMLElement|string} target - Elemento o ID/selector
 * @param {ParentNode} [scope=document]
 * @returns {HTMLElement|null}
 */
export const resolveEl = (target, scope = document) => {
    if (!target) return null;
    if (target instanceof HTMLElement || target instanceof SVGElement) return target;
    if (typeof target === 'string') {
        return scope.getElementById?.(target) || scope.querySelector?.(target) || null;
    }
    return null;
};

/**
 * Selector rápido por ID (document.getElementById).
 * @param {string} id - Identificador del elemento
 * @returns {HTMLElement|null}
 */
export const $id = (id) => document.getElementById(id);

/**
 * QuerySelector estándar con soporte de ámbito (scope).
 * @param {string} selector - Selector CSS
 * @param {ParentNode} [scope=document] - Elemento contenedor
 * @returns {HTMLElement|null}
 */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/**
 * QuerySelectorAll estándar que retorna un Array nativo de elementos.
 * @param {string} selector - Selector CSS
 * @param {ParentNode} [scope=document] - Elemento contenedor
 * @returns {HTMLElement[]}
 */
export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/**
 * Inyecta una plantilla HTML de forma atómica y segura sin invocar asignaciones directas de innerHTML.
 * Utiliza DocumentFragment y replaceChildren para renderizado sin fugas.
 * @param {HTMLElement|string} target - Contenedor destino
 * @param {string} htmlString - Cadena de marcado HTML a renderizar
 * @returns {HTMLElement|null}
 */
export const $mount = (target, htmlString) => {
    const el = resolveEl(target);
    if (!el) return null;
    if (!htmlString) {
        el.replaceChildren();
        return el;
    }
    const range = document.createRange();
    const fragment = range.createContextualFragment(htmlString);
    el.replaceChildren(fragment);
    return el;
};

/**
 * Vacía de forma atómica y segura los hijos de un elemento sin usar innerHTML = ''.
 * @param {HTMLElement|string} target
 * @returns {HTMLElement|null}
 */
export const $empty = (target) => {
    const el = resolveEl(target);
    if (el) el.replaceChildren();
    return el;
};

/**
 * Gestiona atributos del elemento de forma segura y tipada.
 * @param {HTMLElement|string} target - Elemento destino
 * @param {string} name - Nombre del atributo
 * @param {string|number|null} [value] - Valor a asignar (si es null se elimina el atributo; si se omite, se lee)
 * @returns {string|null|HTMLElement}
 */
export const $attr = (target, name, value) => {
    const el = resolveEl(target);
    if (!el) return null;
    if (typeof value === 'undefined') return el.getAttribute(name);
    if (value === null) el.removeAttribute(name);
    else el.setAttribute(name, String(value));
    return el;
};

/**
 * Añade una o más clases a un elemento de forma segura.
 * @param {HTMLElement|string} target
 * @param {...string} classes
 * @returns {HTMLElement|null}
 */
export const $addClass = (target, ...classes) => {
    const el = resolveEl(target);
    if (el) el.classList.add(...classes);
    return el;
};

/**
 * Remueve una o más clases de un elemento de forma segura.
 * @param {HTMLElement|string} target
 * @param {...string} classes
 * @returns {HTMLElement|null}
 */
export const $removeClass = (target, ...classes) => {
    const el = resolveEl(target);
    if (el) el.classList.remove(...classes);
    return el;
};

/**
 * Obtiene el valor recortado de un input, textarea o select de forma segura.
 * @param {HTMLElement|string} target - Elemento o ID
 * @param {string} [fallback=''] - Valor por defecto
 * @returns {string}
 */
export const $val = (target, fallback = '') => {
    const el = resolveEl(target);
    if (!el || typeof el.value === 'undefined') return fallback;
    return String(el.value).trim();
};

/**
 * Obtiene el estado booleano de un checkbox o radio button.
 * @param {HTMLElement|string} target - Elemento o ID
 * @param {boolean} [fallback=false] - Valor por defecto
 * @returns {boolean}
 */
export const $checked = (target, fallback = false) => {
    const el = resolveEl(target);
    if (!el || typeof el.checked === 'undefined') return fallback;
    return Boolean(el.checked);
};

/**
 * Muestra un elemento removiendo la clase 'd-none' (sin usar .style.display).
 * @param {HTMLElement|string} target
 */
export const $show = (target) => {
    const el = resolveEl(target);
    if (el) el.classList.remove('d-none');
};

/**
 * Oculta un elemento agregando la clase 'd-none' (sin usar .style.display).
 * @param {HTMLElement|string} target
 */
export const $hide = (target) => {
    const el = resolveEl(target);
    if (el) el.classList.add('d-none');
};

/**
 * Alterna la visibilidad de un elemento utilizando la clase 'd-none'.
 * @param {HTMLElement|string} target
 * @param {boolean} [visible] - Forzar visible (true) u oculto (false)
 */
export const $toggle = (target, visible) => {
    const el = resolveEl(target);
    if (!el) return;
    if (typeof visible === 'boolean') {
        el.classList.toggle('d-none', !visible);
    } else {
        el.classList.toggle('d-none');
    }
};

/**
 * Modifica el estado de carga de un botón de forma segura (sin innerHTML).
 * Crea el spinner nativo mediante nodos del DOM y gestiona el atributo disabled.
 * 
 * @param {HTMLElement|string} target - Botón o selector
 * @param {boolean} isLoading - Estado de carga activo
 * @param {string} [loadingText='Procesando...'] - Texto durante la carga
 */
export const setButtonLoading = (target, isLoading, loadingText = 'Procesando...') => {
    const btn = resolveEl(target);
    if (!btn) return;

    btn.disabled = Boolean(isLoading);

    if (isLoading) {
        if (!btn.dataset.originalText) {
            btn.dataset.originalText = btn.textContent?.trim() || '';
        }

        const spinner = document.createElement('span');
        spinner.className = 'spinner-border spinner-border-sm me-2';
        spinner.setAttribute('role', 'status');
        spinner.setAttribute('aria-hidden', 'true');

        const textNode = document.createTextNode(loadingText);
        btn.replaceChildren(spinner, textNode);
    } else {
        const originalText = btn.dataset.originalText || '';
        btn.textContent = originalText;
    }
};

/**
 * Asigna un escuchador de eventos de forma segura utilizando addEventListener (evita onclick obsoleto).
 * @param {HTMLElement|string} target - Elemento o ID
 * @param {string} event - Tipo de evento (ej: 'click')
 * @param {Function} handler - Callback del evento
 * @param {AddEventListenerOptions|boolean} [options]
 */
export const $on = (target, event, handler, options) => {
    const el = resolveEl(target);
    if (el && typeof el.addEventListener === 'function') {
        el.addEventListener(event, handler, options);
    }
};

/**
 * Modifica el contenido de un botón de forma segura con icono opcional (sin innerHTML).
 * 
 * @param {HTMLElement|string} target - Botón o selector
 * @param {string} text - Texto del botón
 * @param {string} [iconClass=''] - Clase de icono (ej: 'bi bi-check-circle-fill')
 */
export const setButtonContent = (target, text, iconClass = '') => {
    const btn = resolveEl(target);
    if (!btn) return;

    if (!iconClass) {
        btn.textContent = text;
        return;
    }

    const icon = document.createElement('i');
    icon.className = `${iconClass} me-2`;

    const textNode = document.createTextNode(text);
    btn.replaceChildren(icon, textNode);
};

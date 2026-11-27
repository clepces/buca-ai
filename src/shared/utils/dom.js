/**
 * @fileoverview DOM Utilities & Helpers (Clean Core Vanilla JS)
 * @module shared/utils/dom
 * @description Utilidades de alto rendimiento para manipulación segura del DOM,
 * selectores optimizados, montaje atómico (cero innerHTML), y gestión de clases/atributos.
 */

import { isBrowser } from '../../core/utils/system-helper.js';

/** Resuelve un elemento a partir de una referencia o de un selector/ID. */
export const resolveEl = (target, scope = document) => {
    if (!target) return null;
    if (typeof EventTarget !== 'undefined' && target instanceof EventTarget) return target;
    if (target === document || target === window) return target;
    if (target instanceof HTMLElement || target instanceof SVGElement) return target;
    if (typeof target === 'string') {
        return scope.getElementById?.(target) || scope.querySelector?.(target) || null;
    }
    return null;
};

/** Selector rápido por ID (document.getElementById). */
export const $id = (id) => document.getElementById(id);

/** QuerySelector estándar con soporte de ámbito (scope). */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/** QuerySelectorAll estándar que retorna un Array nativo de elementos. */
export const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/**
 * Inyecta una plantilla HTML de forma atómica y segura sin invocar asignaciones directas de innerHTML.
 * Utiliza DocumentFragment y replaceChildren para renderizado sin fugas de memoria.
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

/** Vacía de forma atómica y segura los hijos de un elemento sin usar innerHTML = ''. */
export const $empty = (target) => {
    const el = resolveEl(target);
    if (el) el.replaceChildren();
    return el;
};

/** Obtiene o asigna de forma segura el texto plano de un elemento (textContent). */
export const $text = (target, value) => {
    const el = resolveEl(target);
    if (!el) return null;
    if (typeof value === 'undefined') return el.textContent?.trim() || '';
    el.textContent = String(value);
    return el;
};

/** Asigna o lee la clase (className) de un elemento de forma limpia. */
export const $className = (target, className) => {
    const el = resolveEl(target);
    if (!el) return null;
    if (typeof className === 'undefined') return el.className;
    el.className = className;
    return el;
};

/** Asigna una variable CSS personalizada o propiedad de estilo de forma segura. */
export const $styleVar = (target, varName, value) => {
    const el = resolveEl(target);
    if (el && el.style && typeof el.style.setProperty === 'function') {
        el.style.setProperty(varName, String(value));
    }
    return el;
};

/** Gestiona atributos del elemento de forma segura y tipada. */
export const $attr = (target, name, value) => {
    const el = resolveEl(target);
    if (!el) return null;
    if (typeof value === 'undefined') return el.getAttribute(name);
    if (value === null) el.removeAttribute(name);
    else el.setAttribute(name, String(value));
    return el;
};

/** Añade una o más clases a un elemento de forma segura. */
export const $addClass = (target, ...classes) => {
    const el = resolveEl(target);
    if (el) el.classList.add(...classes);
    return el;
};

/** Remueve una o más clases de un elemento de forma segura. */
export const $removeClass = (target, ...classes) => {
    const el = resolveEl(target);
    if (el) el.classList.remove(...classes);
    return el;
};

/** Verifica si un elemento contiene una clase CSS dada. */
export const $hasClass = (target, className) => {
    const el = resolveEl(target);
    return el ? el.classList.contains(className) : false;
};

/** Obtiene el valor recortado de un input, textarea o select de forma segura. */
export const $val = (target, fallback = '') => {
    const el = resolveEl(target);
    if (!el || typeof el.value === 'undefined') return fallback;
    return String(el.value).trim();
};

/** Obtiene el estado booleano de un checkbox o radio button. */
export const $checked = (target, fallback = false) => {
    const el = resolveEl(target);
    if (!el || typeof el.checked === 'undefined') return fallback;
    return Boolean(el.checked);
};

/** Muestra un elemento removiendo la clase 'd-none'. */
export const $show = (target) => {
    const el = resolveEl(target);
    if (el) el.classList.remove('d-none');
};

/** Oculta un elemento agregando la clase 'd-none'. */
export const $hide = (target) => {
    const el = resolveEl(target);
    if (el) el.classList.add('d-none');
};

/** Alterna la visibilidad de un elemento utilizando la clase 'd-none'. */
export const $toggle = (target, visible) => {
    const el = resolveEl(target);
    if (!el) return;
    if (typeof visible === 'boolean') {
        el.classList.toggle('d-none', !visible);
    } else {
        el.classList.toggle('d-none');
    }
};

/** Modifica el estado de carga de un botón de forma segura (sin innerHTML). */
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
    } else if (btn.dataset.originalText !== undefined) {
        btn.textContent = btn.dataset.originalText;
        delete btn.dataset.originalText;
    }
};

/** Asigna un escuchador de eventos de forma segura utilizando addEventListener y retorna un destructor. */
export const $on = (target, event, handler, options) => {
    const el = resolveEl(target);
    if (el && typeof el.addEventListener === 'function') {
        el.addEventListener(event, handler, options);
        return () => el.removeEventListener(event, handler, options);
    }
    return () => {};
};

/** Ejecuta una función cuando el DOM esté completamente cargado. */
export const $onReady = (callback) => {
    if (!isBrowser() || typeof callback !== 'function') return;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
        callback();
    }
};

/** Modifica el contenido de un botón de forma segura con icono opcional (sin innerHTML). */
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

/** Remueve un escuchador de eventos de forma segura usando removeEventListener. */
export const $off = (target, event, handler, options) => {
    const el = resolveEl(target);
    if (el && typeof el.removeEventListener === 'function') {
        el.removeEventListener(event, handler, options);
    }
};

/** Crea un elemento HTML de forma segura con atributos opcionales. */
export const $create = (tag, attrs = {}) => {
    const el = document.createElement(tag);
    const { id, className, text, ...rest } = attrs;
    if (id !== undefined && id !== null && id !== '') el.id = String(id);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = String(text);
    for (const [key, val] of Object.entries(rest)) {
        if (key.startsWith('data')) {
            el.setAttribute(key.replace(/([A-Z])/g, '-$1').toLowerCase(), val);
        } else {
            el.setAttribute(key, val);
        }
    }
    return el;
};

/** Añade un nodo hijo a un elemento padre de forma segura. */
export const $appendTo = (parent, child) => {
    const el = resolveEl(parent);
    if (el && child) el.appendChild(child);
    return el;
};

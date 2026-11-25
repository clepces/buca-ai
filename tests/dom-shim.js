/**
 * @fileoverview Minimal browser-global shim for Node.js test environment.
 * Provides the DOM surface area that kernel.js and its dependency tree
 * touch at import time and during boot/destroy. No third-party dependency.
 *
 * Usage: import this file before any @/ import in a test.
 */

const noop = () => {};

// Define DOM class hierarchy early so createMockElement can use them
globalThis.EventTarget = globalThis.EventTarget || class EventTarget {};
globalThis.HTMLElement = globalThis.HTMLElement || class HTMLElement extends globalThis.EventTarget {};
globalThis.SVGElement = globalThis.SVGElement || class SVGElement extends globalThis.EventTarget {};

/** Creates a mock element that passes `instanceof HTMLElement` checks. */
const createMockElement = () => {
    const el = Object.create(globalThis.HTMLElement?.prototype || {});
    const elListeners = new Map();
    const classSet = new Set();
    Object.assign(el, {
        id: '', className: '', dataset: {}, style: { setProperty: noop },
        classList: {
            add: (...cls) => { cls.forEach(c => { if (c) classSet.add(c); }); },
            remove: (...cls) => { cls.forEach(c => classSet.delete(c)); },
            contains: (c) => classSet.has(c),
            toggle: (c, force) => {
                if (force === true) { classSet.add(c); return true; }
                if (force === false) { classSet.delete(c); return false; }
                if (classSet.has(c)) { classSet.delete(c); return false; }
                classSet.add(c); return true;
            }
        },
        setAttribute: noop, getAttribute: () => null, removeAttribute: noop,
        hasAttribute: () => false, closest: () => null,
        appendChild: noop, replaceChildren: noop, remove: noop,
        addEventListener: (evt, fn) => {
            if (!elListeners.has(evt)) elListeners.set(evt, new Set());
            elListeners.get(evt).add(fn);
        },
        removeEventListener: (evt, fn) => {
            elListeners.get(evt)?.delete(fn);
        },
        dispatchEvent: (evt) => {
            const type = typeof evt === 'string' ? evt : evt?.type;
            const set = elListeners.get(type);
            if (set) {
                for (const fn of Array.from(set)) {
                    fn(typeof evt === 'string' ? { type, target: el } : evt);
                }
            }
            return true;
        },
        parentNode: null, children: [], textContent: '',
        getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }),
    });
    return el;
};

const listeners = new Map();

const mockDocument = {
    readyState: 'complete',
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: createMockElement,
    createTextNode: (text = '') => ({ nodeType: 3, textContent: String(text) }),
    createRange: () => ({
        createContextualFragment: () => ({ childNodes: [] }),
    }),
    body: createMockElement(),
    addEventListener(evt, fn, opts) {
        if (!listeners.has(`doc:${evt}`)) listeners.set(`doc:${evt}`, new Set());
        listeners.get(`doc:${evt}`).add(fn);
    },
    removeEventListener(evt, fn) {
        listeners.get(`doc:${evt}`)?.delete(fn);
    },
    dispatchEvent(evt) {
        const type = typeof evt === 'string' ? evt : evt?.type;
        const set = listeners.get(`doc:${type}`);
        if (set) {
            for (const fn of Array.from(set)) {
                fn(typeof evt === 'string' ? { type, target: mockDocument } : evt);
            }
        }
        return true;
    },
};

const mockWindow = {
    ...globalThis,
    addEventListener(evt, fn, opts) {
        if (!listeners.has(`win:${evt}`)) listeners.set(`win:${evt}`, new Set());
        listeners.get(`win:${evt}`).add(fn);
    },
    removeEventListener(evt, fn) {
        listeners.get(`win:${evt}`)?.delete(fn);
    },
    dispatchEvent(evt) {
        const type = typeof evt === 'string' ? evt : evt?.type;
        const set = listeners.get(`win:${type}`);
        if (set) {
            for (const fn of Array.from(set)) {
                fn(typeof evt === 'string' ? { type, target: mockWindow } : evt);
            }
        }
        return true;
    },
    innerWidth: 1280,
    innerHeight: 720,
    document: mockDocument,
    navigator: { onLine: true, serviceWorker: undefined },
    location: { pathname: '/', search: '', hash: '', origin: 'http://localhost:3000', hostname: 'localhost', href: 'http://localhost:3000/' },
    history: { pushState: noop, replaceState: noop },
    requestAnimationFrame: (fn) => fn(),
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    scroll: noop,
};

globalThis.window = mockWindow;
globalThis.document = mockDocument;
globalThis.navigator = mockWindow.navigator;
globalThis.location = mockWindow.location;
globalThis.history = mockWindow.history;
globalThis.requestAnimationFrame = mockWindow.requestAnimationFrame;
globalThis.matchMedia = mockWindow.matchMedia;
globalThis.getComputedStyle = mockWindow.getComputedStyle;
globalThis.MutationObserver = globalThis.MutationObserver || class MutationObserver {
    observe() {} disconnect() {} takeRecords() { return []; }
};
globalThis.IntersectionObserver = globalThis.IntersectionObserver || class IntersectionObserver {
    observe() {} disconnect() {} unobserve() {}
};
globalThis.ResizeObserver = globalThis.ResizeObserver || class ResizeObserver {
    observe() {} disconnect() {} unobserve() {}
};
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
globalThis.sessionStorage = globalThis.sessionStorage || { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
globalThis.indexedDB = globalThis.indexedDB || undefined;

export { listeners, mockDocument, mockWindow };

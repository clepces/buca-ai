/**
 * @fileoverview modal-focus-trap - Gestión de foco, Focus Trap e inert para ModalServiceV2.
 * @module shared/ui/services/modal/modal-focus-trap
 */
import { $id } from '@/shared/utils/dom.js';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

export class ModalFocusTrap {
    constructor() {
        this._lastFocused = null;
        this._onKeyDown = null;
    }

    /**
     * Activa el trap sobre el diálogo y aísla #app con inert.
     * @param {HTMLElement} dialogEl
     * @param {string|null} initialFocusSelector
     */
    activate(dialogEl, initialFocusSelector = null) {
        this.deactivate(false);
        this._lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const appRoot = $id('app');
        if (appRoot) appRoot.setAttribute('inert', '');

        const target = initialFocusSelector ? dialogEl.querySelector(initialFocusSelector) : null;
        if (target && typeof target.focus === 'function') {
            target.focus({ preventScroll: true });
        } else {
            const focusables = this._getFocusables(dialogEl);
            const fallback = focusables[0] || dialogEl;
            if (fallback && typeof fallback.focus === 'function') {
                fallback.focus({ preventScroll: true });
            }
        }

        this._onKeyDown = (e) => {
            if (e.key !== 'Tab') return;
            const focusables = this._getFocusables(dialogEl);
            if (focusables.length === 0) {
                e.preventDefault();
                dialogEl.focus({ preventScroll: true });
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && (document.activeElement === first || !dialogEl.contains(document.activeElement))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', this._onKeyDown, true);
    }

    /**
     * Desactiva el trap y opcionalmente restaura el foco al disparador original.
     * @param {boolean} [restoreFocus=true]
     */
    deactivate(restoreFocus = true) {
        if (this._onKeyDown) {
            document.removeEventListener('keydown', this._onKeyDown, true);
            this._onKeyDown = null;
        }

        const appRoot = $id('app');
        if (appRoot) appRoot.removeAttribute('inert');

        if (restoreFocus && this._lastFocused && document.contains(this._lastFocused)) {
            this._lastFocused.focus({ preventScroll: true });
        }
        this._lastFocused = null;
    }

    _getFocusables(container) {
        return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
            if (el.closest('[hidden]')) return false;
            return el.offsetParent !== null || el === document.activeElement;
        });
    }
}

export default ModalFocusTrap;

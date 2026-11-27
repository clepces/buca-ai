/**
 * @fileoverview drilldown-menu - Menú desplegable multinivel global reutilizable.
 * Soporta ítems [icono] + [texto] + [chevron], submenús con botón Volver,
 * navegación por teclado y cierre prioritario con Escape.
 * @module shared/ui/components/drilldown-menu/drilldown-menu
 */
import { escapeHTML } from '@/shared/utils/security.js';
import { $mount, $on } from '@/shared/utils/dom.js';

export class DrilldownMenu {
    static _rootEl = null;
    static _triggerEl = null;
    static _stack = [];
    static _title = '';
    static _onSelect = null;
    static _abortController = null;

    static isOpen() {
        return Boolean(this._rootEl && !this._rootEl.hidden);
    }

    /**
     * Abre un menú drill-down anclado a un elemento disparador.
     * @param {Object} options
     * @param {HTMLElement} options.triggerEl
     * @param {Array<Object>} options.items - [{ id, label, icon, iconRight, badge, active, disabled, children }]
     * @param {string} [options.title='']
     * @param {Function} [options.onSelect]
     */
    static open({ triggerEl, items = [], title = '', onSelect = null } = {}) {
        if (!triggerEl || !Array.isArray(items)) return;

        if (this.isOpen() && this._triggerEl === triggerEl) {
            this.close();
            return;
        }

        this.close(false);
        this._triggerEl = triggerEl;
        this._title = title;
        this._onSelect = onSelect;
        this._stack = [{ title, items }];

        this._ensureRoot();
        this._renderCurrentLevel();
        this._positionNearTrigger(triggerEl);

        this._rootEl.hidden = false;
        this._triggerEl.setAttribute('aria-expanded', 'true');
        this._bindEvents();

        const firstBtn = this._rootEl.querySelector('.ui-drilldown__item:not(:disabled)');
        if (firstBtn) firstBtn.focus();
    }

    static close(restoreFocus = true) {
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }
        if (this._rootEl) {
            this._rootEl.hidden = true;
            this._rootEl.replaceChildren();
        }
        if (this._triggerEl) {
            this._triggerEl.setAttribute('aria-expanded', 'false');
            if (restoreFocus && typeof this._triggerEl.focus === 'function') {
                this._triggerEl.focus();
            }
        }
        this._triggerEl = null;
        this._stack = [];
        this._onSelect = null;
    }

    static _ensureRoot() {
        if (this._rootEl && document.body.contains(this._rootEl)) return;
        const el = document.createElement('div');
        el.id = 'ui-drilldown-menu';
        el.className = 'ui-drilldown';
        el.setAttribute('role', 'menu');
        el.hidden = true;
        document.body.appendChild(el);
        this._rootEl = el;
    }

    static _renderCurrentLevel() {
        if (!this._rootEl || this._stack.length === 0) return;
        const current = this._stack[this._stack.length - 1];
        const hasParent = this._stack.length > 1;

        const headerHtml = (hasParent || current.title) ? `
            <div class="ui-drilldown__header">
                ${hasParent ? `
                    <button type="button" class="ui-drilldown__back" data-drill-back="true" aria-label="Volver">
                        <i class="bi bi-chevron-left" aria-hidden="true"></i>
                        <span>Volver</span>
                    </button>
                ` : ''}
                ${current.title ? `<span class="ui-drilldown__title">${escapeHTML(current.title)}</span>` : ''}
            </div>
        ` : '';

        const itemsHtml = current.items.map((item, idx) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const endIcon = item.iconRight || (hasChildren ? 'bi-chevron-right' : (item.active ? 'bi-check2' : ''));
            return `
                <button
                    type="button"
                    class="ui-drilldown__item ${item.active ? 'is-active' : ''}"
                    role="menuitem"
                    data-drill-index="${idx}"
                    ${item.disabled ? 'disabled' : ''}
                >
                    <span class="ui-drilldown__item-start">
                        ${item.icon ? `<i class="bi ${escapeHTML(item.icon)} ui-drilldown__icon" aria-hidden="true"></i>` : ''}
                        <span class="ui-drilldown__label">${escapeHTML(item.label || '')}</span>
                    </span>
                    <span class="ui-drilldown__item-end">
                        ${item.badge ? `<span class="badge badge--primary ui-drilldown__badge">${escapeHTML(item.badge)}</span>` : ''}
                        ${endIcon ? `<i class="bi ${escapeHTML(endIcon)} ui-drilldown__chevron" aria-hidden="true"></i>` : ''}
                    </span>
                </button>
            `;
        }).join('');

        $mount(this._rootEl, `${headerHtml}<div class="ui-drilldown__list">${itemsHtml}</div>`);
    }

    static _positionNearTrigger(triggerEl) {
        if (!this._rootEl) return;
        const rect = triggerEl.getBoundingClientRect();
        const menuW = 248;
        const margin = 8;
        const left = Math.max(margin, Math.min(rect.right - menuW, window.innerWidth - menuW - margin));
        const top = Math.min(rect.bottom + 6, window.innerHeight - 280);
        this._rootEl.style.left = `${left}px`;
        this._rootEl.style.top = `${Math.max(margin, top)}px`;
    }

    static _bindEvents() {
        this._abortController = new AbortController();
        const { signal } = this._abortController;

        $on(this._rootEl, 'click', (e) => {
            const backBtn = e.target.closest('[data-drill-back]');
            if (backBtn && this._stack.length > 1) {
                this._stack.pop();
                this._renderCurrentLevel();
                return;
            }

            const itemBtn = e.target.closest('[data-drill-index]');
            if (!itemBtn || itemBtn.disabled) return;

            const idx = Number(itemBtn.dataset.drillIndex);
            const current = this._stack[this._stack.length - 1];
            const item = current?.items?.[idx];
            if (!item) return;

            if (Array.isArray(item.children) && item.children.length > 0) {
                this._stack.push({ title: item.label, items: item.children });
                this._renderCurrentLevel();
                const nextFocus = this._rootEl.querySelector('.ui-drilldown__item:not(:disabled)');
                if (nextFocus) nextFocus.focus();
                return;
            }

            const cb = this._onSelect;
            this.close(true);
            if (typeof cb === 'function') cb(item);
        }, { signal });

        $on(document, 'pointerdown', (e) => {
            if (!this.isOpen()) return;
            if (this._rootEl.contains(e.target) || this._triggerEl?.contains(e.target)) return;
            this.close(false);
        }, { signal, capture: true });

        $on(this._rootEl, 'keydown', (e) => {
            const buttons = Array.from(this._rootEl.querySelectorAll('.ui-drilldown__item:not(:disabled)'));
            const currentIdx = buttons.indexOf(document.activeElement);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = buttons[(currentIdx + 1) % Math.max(buttons.length, 1)];
                if (next) next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = buttons[(currentIdx - 1 + buttons.length) % Math.max(buttons.length, 1)];
                if (prev) prev.focus();
            } else if (e.key === 'ArrowLeft' && this._stack.length > 1) {
                e.preventDefault();
                this._stack.pop();
                this._renderCurrentLevel();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                this.close(true);
            }
        }, { signal });
    }
}

export default DrilldownMenu;

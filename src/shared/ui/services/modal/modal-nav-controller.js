/**
 * @fileoverview modal-nav-controller - Controla nav-left, nav-right, nav-top y vistas con preserveState.
 * @module shared/ui/services/modal/modal-nav-controller
 */
import { escapeHTML } from '@/shared/utils/security.js';
import { $mount, $on } from '@/shared/utils/dom.js';

export class ModalNavController {
    constructor(renderer) {
        this._renderer = renderer;
        this._views = [];
        this._activeViewId = null;
        this._onViewChange = null;
        this._preserveState = true;
        this._viewNodes = new Map();
    }

    /**
     * Monta la navegación y las vistas declarativas si layout !== 'plain'.
     * @param {Object} params
     * @param {string} params.layout
     * @param {Object} params.body
     * @param {AbortSignal} params.signal
     * @param {Function} [params.onViewChange]
     */
    setup({ layout, body = {}, signal, onViewChange = null }) {
        this.reset();
        const navEl = this._renderer.el('nav');
        const contentEl = this._renderer.el('content');
        if (!navEl || !contentEl) return;

        const views = Array.isArray(body.views) ? body.views : [];
        const navItems = Array.isArray(body.nav) ? body.nav : views;

        if (layout === 'plain' || navItems.length === 0) {
            navEl.hidden = true;
            navEl.replaceChildren();
            return;
        }

        this._views = views;
        this._onViewChange = onViewChange;
        this._preserveState = body.preserveState !== false;

        const isTop = layout === 'nav-top';
        const pos = isTop ? 'top' : (layout === 'nav-right' ? 'right' : 'left');
        navEl.dataset.navPosition = pos;
        navEl.dataset.navCollapsed = 'false';
        navEl.hidden = false;

        const toggleBtn = !isTop ? `
            <button type="button" class="ui-modal__nav-toggle" data-modal-nav-toggle="true" aria-label="Colapsar navegación" title="Colapsar menú">
                <i class="bi bi-layout-sidebar" aria-hidden="true"></i>
            </button>
        ` : '';

        const itemsHtml = navItems.map((item) => `
            <button
                type="button"
                class="ui-modal__nav-item"
                role="${isTop ? 'tab' : 'button'}"
                data-modal-view-id="${escapeHTML(item.id)}"
                aria-selected="false"
                ${item.disabled ? 'disabled' : ''}
            >
                ${item.icon ? `<i class="bi ${escapeHTML(item.icon)} ui-modal__nav-icon" aria-hidden="true"></i>` : ''}
                <span class="ui-modal__nav-label">${escapeHTML(item.label || item.id)}</span>
                ${item.badge ? `<span class="badge badge--primary">${escapeHTML(String(item.badge))}</span>` : ''}
            </button>
        `).join('');

        $mount(navEl, `${toggleBtn}<div class="ui-modal__nav-list" role="${isTop ? 'tablist' : 'navigation'}">${itemsHtml}</div>`);

        $on(navEl, 'click', (e) => {
            const toggle = e.target.closest('[data-modal-nav-toggle]');
            if (toggle) {
                const collapsed = navEl.dataset.navCollapsed === 'true';
                navEl.dataset.navCollapsed = collapsed ? 'false' : 'true';
                return;
            }
            const btn = e.target.closest('[data-modal-view-id]');
            if (btn && !btn.disabled) {
                this.setView(btn.dataset.modalViewId, signal);
            }
        }, { signal });

        if (this._views.length > 0) {
            const initialId = body.activeView || this._views[0].id;
            this.setView(initialId, signal);
        }
    }

    setView(viewId, signal) {
        const view = this._views.find((v) => v.id === viewId);
        const navEl = this._renderer.el('nav');
        const contentEl = this._renderer.el('content');
        if (!view || !contentEl) return;

        this._activeViewId = viewId;

        if (navEl) {
            navEl.querySelectorAll('[data-modal-view-id]').forEach((btn) => {
                const active = btn.dataset.modalViewId === viewId;
                btn.classList.toggle('is-active', active);
                btn.setAttribute('aria-selected', active ? 'true' : 'false');
            });
        }

        if (this._preserveState) {
            this._viewNodes.forEach((panel, id) => {
                const isTarget = id === viewId;
                panel.hidden = !isTarget;
                if (isTarget) panel.removeAttribute('inert');
                else panel.setAttribute('inert', '');
            });

            if (!this._viewNodes.has(viewId)) {
                const panel = document.createElement('div');
                panel.className = 'ui-modal__view-panel';
                panel.dataset.viewId = viewId;
                const html = typeof view.render === 'function' ? view.render() : (view.html || '');
                $mount(panel, html);
                contentEl.appendChild(panel);
                this._viewNodes.set(viewId, panel);
                if (typeof view.onEnter === 'function') view.onEnter({ panel, signal });
            }
        } else {
            const html = typeof view.render === 'function' ? view.render() : (view.html || '');
            $mount(contentEl, html);
            if (typeof view.onEnter === 'function') view.onEnter({ panel: contentEl, signal });
        }

        if (view.footer) {
            this._renderer.renderFooter(view.footer);
        }
        if (typeof this._onViewChange === 'function') {
            this._onViewChange({ viewId, signal });
        }
    }

    reset() {
        this._views = [];
        this._activeViewId = null;
        this._onViewChange = null;
        this._viewNodes.clear();
    }
}

export default ModalNavController;

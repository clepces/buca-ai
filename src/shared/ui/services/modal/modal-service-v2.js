/**
 * @fileoverview modal-service-v2 - Orquestador de modales de nueva generación (Base Sólida .ui-modal).
 * @module shared/ui/services/modal/modal-service-v2
 */
import { ScrollManager } from '@/shared/ui/utils/ui-helper.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $mount, $on } from '@/shared/utils/dom.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { Logger } from '@/shared/utils/logger.js';
import { DrilldownMenu } from '@/shared/ui/components/drilldown-menu/drilldown-menu.js';
import { ModalFocusTrap } from './modal-focus-trap.js';
import { ModalRenderer } from './modal-renderer.js';
import { ModalNavController } from './modal-nav-controller.js';
import { normalizeModalOptions } from './modal-legacy-bridge.js';

const MODAL_SIZES = [
    { id: 'xs', label: 'Extra Pequeño (XS)', icon: 'bi-phone' },
    { id: 'sm', label: 'Pequeño (SM)', icon: 'bi-tablet' },
    { id: 'md', label: 'Mediano (MD)', icon: 'bi-window' },
    { id: 'lg', label: 'Grande (LG)', icon: 'bi-window-desktop' },
    { id: 'xl', label: 'Extra Grande (XL)', icon: 'bi-display' },
    { id: '2xl', label: 'Doble Grande (2XL)', icon: 'bi-aspect-ratio' },
    { id: 'full', label: 'Pantalla Completa', icon: 'bi-arrows-fullscreen' }
];

export class ModalServiceV2 {
    constructor() {
        this._initialized = false;
        this._cleanups = [];
        this._renderer = new ModalRenderer();
        this._focusTrap = new ModalFocusTrap();
        this._nav = new ModalNavController(this._renderer);
        this._modalAbort = null;
        this._resizeObserver = null;
        this._closeTimer = null;
        this._activeConfig = null;
    }

    init({ registerBusHandlers = true } = {}) {
        if (this._initialized) return;
        this._initialized = true;
        Logger.info({ layer: 'UI', role: 'CLASS', target: 'ModalServiceV2', message: 'Servicio de modales v2 inicializado.' });

        if (registerBusHandlers) {
            this._cleanups.push(
                eventBus.on('ui:close_modal', () => this.requestClose('programmatic')),
                eventBus.on('ui:open_modal', (p = {}) => {
                    this.showModal({
                        scope: 'global',
                        size: p.size || 'md',
                        header: { left: { icon: 'bi-info-circle', title: String(p.title || 'Información') } },
                        body: { html: `<p class="mb-0">${escapeHTML(String(p.description || p.body || 'Contenido no disponible.'))}</p>` },
                        footer: { right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Entendido</button>' }
                    });
                })
            );
        }

        this._cleanups.push(
            eventBus.on('ui:modal_more_menu', () => this._openMoreMenu()),
            eventBus.on('ui:modal_size_menu', () => this._openSizeMenu()),
            eventBus.on('ui:modal_ai_assist', () => eventBus.emit('ai:open_copilot')),
            eventBus.on('ui:modal_help', () => {
                if (typeof this._activeConfig?.onHelp === 'function') {
                    this._activeConfig.onHelp();
                    return;
                }
                this.notifyHeader('info', 'Tab: navegar · Esc: cerrar · EXP: tamaño', 4000);
            }),
            eventBus.on('router:navigate', () => {
                if (this.isOpen() && this._activeConfig?.closeOnRouteChange !== false) {
                    this.hideModal('route-change');
                }
            }),
            eventBus.on('auth:logout', () => {
                if (this.isOpen()) this.hideModal('route-change');
            }),
            $on(document, 'keydown', (e) => {
                if (e.key === 'Escape' && !e.defaultPrevented && this.isOpen()) {
                    this.requestClose('esc');
                }
            })
        );

        const root = this._renderer.el('root');
        if (root) {
            this._cleanups.push($on(root, 'click', (e) => {
                if (e.target === root && this._activeConfig?.closeOnBackdrop !== false) {
                    this.requestClose('backdrop');
                }
            }));
        }
    }

    showModal(rawOptions = {}) {
        this.init();
        const root = this._renderer.el('root');
        const dialog = this._renderer.el('dialog');
        if (!root || !dialog) {
            Logger.error({ layer: 'UI', role: 'CLASS', target: 'ModalServiceV2', message: 'No se encontró #ui-modal-root en el DOM.' });
            return;
        }

        if (this._closeTimer) {
            clearTimeout(this._closeTimer);
            this._closeTimer = null;
        }

        this._teardownInstance('replace');
        eventBus.emit('header:close_all_panels');

        const cfg = normalizeModalOptions(rawOptions);
        this._activeConfig = cfg;
        this._modalAbort = new AbortController();
        const { signal } = this._modalAbort;

        root.dataset.modalScope = cfg.scope;
        root.dataset.modalState = 'open';
        root.classList.add('active');
        root.setAttribute('aria-hidden', 'false');
        dialog.dataset.modalSize = cfg.size;
        dialog.dataset.modalLayout = cfg.layout;
        dialog.dataset.mobileMode = cfg.mobileMode;

        this._renderer.renderHeader(cfg.header);
        this._renderer.renderFooter(cfg.footer);
        this._renderer.setLoading(cfg.loading);

        const contentEl = this._renderer.el('content');
        if (Array.isArray(cfg.body.views) && cfg.body.views.length > 0) {
            this._nav.setup({ layout: cfg.layout, body: cfg.body, signal, onViewChange: cfg.onViewChange });
        } else {
            this._nav.reset();
            const navEl = this._renderer.el('nav');
            if (navEl) navEl.hidden = true;
            if (contentEl) $mount(contentEl, cfg.body.html || '');
        }

        if (contentEl && typeof cfg.onResize === 'function' && typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver((entries) => {
                const rect = entries[0]?.contentRect;
                if (rect) cfg.onResize({ width: rect.width, height: rect.height });
            });
            this._resizeObserver.observe(contentEl);
        }

        ScrollManager.lock();
        this._focusTrap.activate(dialog, cfg.initialFocus);

        if (typeof cfg.onOpen === 'function') {
            cfg.onOpen({
                modalEl: dialog,
                contentEl,
                signal,
                setLoading: (flag) => this.setLoading(flag),
                setFooter: (f) => this._renderer.renderFooter(f),
                notifyHeader: (type, msg, ms) => this._renderer.notifyHeader(type, msg, ms),
                setView: (viewId) => this._nav.setView(viewId, signal),
                close: () => this.requestClose('programmatic')
            });
        }
    }

    async requestClose(reason = 'programmatic') {
        if (!this.isOpen()) return;
        if (reason === 'esc' && this._activeConfig?.closeOnEsc === false) return;

        if (typeof this._activeConfig?.beforeClose === 'function') {
            const allowed = await this._activeConfig.beforeClose({ reason });
            if (allowed === false) return;
        }
        this.hideModal(reason);
    }

    hideModal(reason = 'programmatic') {
        const root = this._renderer.el('root');
        DrilldownMenu.close(false);
        this._teardownInstance(reason);

        if (root) {
            root.dataset.modalState = 'closed';
            root.classList.remove('active');
            root.setAttribute('aria-hidden', 'true');
            this._closeTimer = setTimeout(() => {
                if (!this.isOpen()) {
                    this._renderer.clearAll();
                }
                this._closeTimer = null;
            }, 180);
        }
        ScrollManager.forceUnlock();
    }

    setSize(size) {
        const dialog = this._renderer.el('dialog');
        if (dialog && MODAL_SIZES.some((s) => s.id === size)) {
            dialog.dataset.modalSize = size;
        }
    }

    setLoading(flag) {
        this._renderer.setLoading(Boolean(flag));
    }

    notifyHeader(type, message, durationMs) {
        this._renderer.notifyHeader(type, message, durationMs);
    }

    isOpen(modalId = null) {
        const root = this._renderer.el('root');
        const open = Boolean(root && (root.dataset?.modalState === 'open' || root.classList?.contains('active')));
        if (!open) return false;
        return modalId ? this._activeConfig?.id === modalId : true;
    }

    isShortcutLocked() {
        return this.isOpen() && Boolean(this._activeConfig?.lockShortcuts);
    }

    destroy() {
        this.hideModal('destroy');
        while (this._cleanups.length > 0) {
            try { this._cleanups.pop()(); } catch { /* absorb */ }
        }
        this._initialized = false;
    }

    _openSizeMenu() {
        const triggerEl = this._renderer.el('btnResize');
        const dialog = this._renderer.el('dialog');
        if (!triggerEl || !dialog) return;
        const current = dialog.dataset.modalSize || 'md';
        DrilldownMenu.open({
            triggerEl,
            title: 'Tamaño (Experimental)',
            items: MODAL_SIZES.map((s) => ({ ...s, active: s.id === current })),
            onSelect: (item) => this.setSize(item.id)
        });
    }

    _openMoreMenu() {
        const triggerEl = this._renderer.el('btnMore');
        const dialog = this._renderer.el('dialog');
        if (!triggerEl || !dialog) return;

        const current = dialog.dataset.modalSize || 'md';
        const globals = this._activeConfig?.header?.right?.showGlobalControls || {};
        const items = [];

        if (globals.ai !== false) {
            items.push({ id: 'ai', label: 'Asistente IA', icon: 'bi-stars' });
        }
        if (globals.help !== false) {
            items.push({ id: 'help', label: 'Ayuda rápida', icon: 'bi-question-circle' });
        }
        if (globals.resize !== false) {
            items.push({
                id: 'resize',
                label: 'Tamaño de ventana',
                icon: 'bi-aspect-ratio',
                badge: 'EXP',
                children: MODAL_SIZES.map((s) => ({ ...s, active: s.id === current }))
            });
        }

        DrilldownMenu.open({
            triggerEl,
            title: 'Opciones',
            items,
            onSelect: (item) => {
                if (item.id === 'ai') eventBus.emit('ui:modal_ai_assist');
                else if (item.id === 'help') eventBus.emit('ui:modal_help');
                else if (MODAL_SIZES.some((s) => s.id === item.id)) this.setSize(item.id);
            }
        });
    }

    _teardownInstance(reason) {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        if (this._modalAbort) {
            this._modalAbort.abort();
            this._modalAbort = null;
        }
        this._focusTrap.deactivate(reason !== 'replace' && reason !== 'destroy');
        this._nav.reset();

        const prevClose = this._activeConfig?.onClose;
        this._activeConfig = null;
        if (typeof prevClose === 'function') {
            try { prevClose({ reason }); } catch (err) {
                Logger.warn({ layer: 'UI', role: 'CLASS', target: 'ModalServiceV2', message: 'Error en onClose.', data: err?.message || err });
            }
        }
    }
}

export const modalServiceV2 = new ModalServiceV2();
export default modalServiceV2;

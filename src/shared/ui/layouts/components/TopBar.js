import { uiState } from '@/core/state/ui.js';
import { sessionState } from '@/core/state/session.js';
import { eventBus } from '@/core/eventBus/index.js';
import { NotificationTray } from '@/shared/ui/components/notifications/NotificationTray.js';
import { FloatingPanelManager } from '@/shared/ui/services/FloatingPanelManager.js';
import { KeyboardShortcuts } from '@/core/services/KeyboardShortcuts.js';
import { initTouchGestures } from '@/shared/utils/touchGestures.js';
import { NotificationService } from '@/core/services/NotificationService.js';
import { renderTopBar } from './topbar-template.js';
import { $id, $, $$, $mount, $on, $addClass, $removeClass, $toggle, $text, $className, $attr, $create, $appendTo } from '@/shared/utils/dom.js';
import { getViewportWidth, isFullscreen, requestFullscreen, exitFullscreen } from '@/core/utils/system-helper.js';
import { $onWindow } from '@/core/utils/index.js';

/**
 * Componente modular Header — BUCA Website (Refactorizado)
 * =========================================================================
 * Desacoplado en servicios: FloatingPanelManager, KeyboardShortcuts, TouchGestures.
 * =========================================================================
 */

export const Header = {
    init(containerId = 'topbar-slot') {
        const container = $id(containerId);
        if (!container || $('.app-header', container)) return;

        $mount(container, this.render());
        this.element = $('.app-header', container);

        this._createOverlay();
        FloatingPanelManager.extractPanelsToBody('.app-header .glass-panel');
        
        this._destroyTouch = initTouchGestures(() => this.closeAllPanels());
        KeyboardShortcuts.init();

        if (!this._eventsBound) {
            this._bindEvents();
            this._eventsBound = true;
        }

        this._initialized = true;
        this.syncNotifications();
        this._initBrandContraction();
    },

    _bindEvents() {
        // Clic fuera para cerrar paneles
        $on(document, 'click', (e) => {
            const isInsidePanel = e.target.closest('.glass-panel');
            const isInsideWrapper = e.target.closest('.dropdown-wrapper');
            const isTrigger = e.target.closest('[data-action]');
            if (!isInsidePanel && !isInsideWrapper && !isTrigger) this.closeAllPanels();
        });

        // Suscripciones de Estado
        uiState.subscribe((state) => {
            this.updateStatusUI(state.isOnline);
            if (state.graphics) this.updateEngineUI(state.graphics);
        });

        $onWindow('resize', () => {
            const activePanel = $('.glass-panel.active');
            if (activePanel) {
                const wrapperId = activePanel.getAttribute('data-anchor-wrapper');
                const wrapper = $id(wrapperId);
                FloatingPanelManager.positionPanel(activePanel, wrapper);
            }
        });

        // Acciones vía EventBus
        eventBus.on('header:toggle_panel', (payload = {}) => {
            const targetId = payload.target || payload.id;
            const triggerEl = payload.trigger || (targetId ? $(`[data-target="${targetId}"]`) : null);
            if (targetId) this.togglePanel(targetId, triggerEl);
        });

        eventBus.on('header:close_all_panels', () => this.closeAllPanels());
        eventBus.on('header:toggle_fullscreen', () => this.toggleFullscreen());

        // Escuchar actualización de notificaciones
        eventBus.on('notifications:updated', (notifications) => {
            this.syncNotifications(notifications);
        });

        eventBus.on('notifications:clear', () => {
            NotificationService.clearNotifications();
        });

        // Escuchar cambios globales de tasa
        eventBus.on('finance:rate_updated', ({ rate }) => {
            const pill = $('.live-bcv-mini-pill span');
            if (pill && rate) {
                $text(pill, `Bs. ${Number(rate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            }
        });

        // Buscador Global
        eventBus.on('workspace:toggle_search', () => {
            const searchInput = $id('ws-global-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
                const capsule = $id('ws-search-box');
                if (capsule) $addClass(capsule, 'search-active');
            }
        });

        const searchInput = $id('ws-global-search');
        if (searchInput) {
            $on(searchInput, 'input', (e) => {
                const term = e.target.value.toLowerCase();
                if (term.length > 2) {
                    eventBus.emit('ui:global_search', { term });
                }
            });
            $on(searchInput, 'blur', () => {
                const capsule = $id('ws-search-box');
                if (capsule) $removeClass(capsule, 'search-active');
            });
        }
    },

    async syncNotifications(notifications) {
        if (!notifications) {
            notifications = NotificationService.getNotifications();
        }
        
        const panel = $id('panel-notifications');
        const user = sessionState.get().user;
        const currentUid = user?.uid;

        if (panel) {
            $mount(panel, NotificationTray.render(notifications));
        }

        // Actualizar punto de alerta (Solo si hay no leídas)
        const unreadCount = notifications.filter(n => !n.read_by?.includes(currentUid)).length;
        const dot = $('.notif-glow-dot');
        if (dot) {
            $toggle(dot, unreadCount > 0);
            if (unreadCount > 0) $addClass(dot, 'pulse-notif');
            else $removeClass(dot, 'pulse-notif');
        }
    },

    openPanel(panelId, triggerWrapper) {
        this.closeAllPanels();
        const panel = $id(panelId);
        if (!panel) return;

        if (triggerWrapper) {
            FloatingPanelManager.positionPanel(panel, triggerWrapper);
            $addClass(triggerWrapper, 'panel-open');
        }

        $addClass(panel, 'active');
        const overlay = $id('panel-overlay');
        if (overlay && getViewportWidth() <= 767) $addClass(overlay, 'active');
    },

    closeAllPanels() {
        $$('.glass-panel.active').forEach(p => $removeClass(p, 'active'));
        $$('.dropdown-wrapper.panel-open').forEach(w => $removeClass(w, 'panel-open'));
        const overlay = $id('panel-overlay');
        if (overlay) $removeClass(overlay, 'active');
    },

    togglePanel(panelId, trigger) {
        const panel = $id(panelId);
        const wrapper = trigger.closest('.dropdown-wrapper');
        if (panel && panel.classList.contains('active')) {
            this.closeAllPanels();
        } else {
            this.openPanel(panelId, wrapper);
        }
    },

    render() {
        return renderTopBar();
    },

    _createOverlay() {
        if ($id('panel-overlay')) return;
        const overlay = $create('div', {
            id: 'panel-overlay',
            className: 'panel-overlay'
        });
        $on(overlay, 'click', () => this.closeAllPanels());
        $appendTo(document.body, overlay);
    },

    toggleFullscreen() {
        if (!isFullscreen()) requestFullscreen().catch(() => {});
        else exitFullscreen().catch(() => {});
        this.closeAllPanels();
    },

    /**
     * Initializes brand contraction animation.
     * Shows full branding on load, contracts to logo-only after ~3s.
     * Hover on logo shows tooltip with app name, version and context.
     */
    _initBrandContraction() {
        const collapsible = $('.brand-collapsible');
        const tooltip = $('.brand-hover-tooltip');
        const logoContainer = $('.logo-neural-container');
        if (!collapsible || !logoContainer) return;

        this._brandTimer = setTimeout(() => {
            $addClass(collapsible, 'brand-collapsible--contracted');
            if (tooltip) $addClass(tooltip, 'brand-hover-tooltip--ready');
        }, 3000);

        // Hover → show tooltip (only when contracted)
        $on(logoContainer, 'mouseenter', () => {
            if (collapsible.classList.contains('brand-collapsible--contracted') && tooltip) {
                $addClass(tooltip, 'brand-hover-tooltip--visible');
            }
        });
        $on(logoContainer, 'mouseleave', () => {
            if (tooltip) $removeClass(tooltip, 'brand-hover-tooltip--visible');
        });
    },

    updateEngineUI(data) {
        const tierCode = data.id || 'L1';
        const profileBadge = $id('profile-engine-badge');
        if (profileBadge) {
            $text(profileBadge, tierCode);
            $className(profileBadge, 'badge ' + this._getBadgeClassForTier(data.tier));
        }
    },

    _getBadgeClassForTier(tierId) {
        const map = { 'eco': 'badge--eco', 'balanced': 'badge--balanced', 'pro': 'badge--pro', 'ultra': 'badge--ultra' };
        return map[tierId] || 'badge--balanced';
    },

    updateStatusUI(isOnline) {
        const badge = $id('connection-status-badge');
        if (!badge) return;
        
        const icon = $('i', badge);
        const state = uiState.get();

        if (state.isSyncing || state.isConnecting) {
            $className(badge, 'action-capsule-btn btn-status-toggle connecting');
            if (icon) $className(icon, 'bi bi-wifi-2 status-icon-dot');
            $attr(badge, 'title', 'Intentando conectar...');
        } else if (isOnline) {
            $className(badge, 'action-capsule-btn btn-status-toggle online');
            if (icon) $className(icon, 'bi bi-wifi status-icon-dot');
            $attr(badge, 'title', 'Conexión Estable');
        } else {
            $className(badge, 'action-capsule-btn btn-status-toggle offline');
            if (icon) $className(icon, 'bi bi-wifi-off status-icon-dot');
            $attr(badge, 'title', 'Sin Conexión');
        }
    }
};

export default Header;

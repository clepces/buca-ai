import { uiState } from '@/core/state/ui.js';
import { sessionState } from '@/core/state/session.js';
import { eventBus } from '@/core/eventBus/index.js';
import { FloatingPanelManager } from '@/shared/ui/services/FloatingPanelManager.js';
import { KeyboardShortcuts } from '@/core/services/KeyboardShortcuts.js';
import { initTouchGestures } from '@/shared/utils/touchGestures.js';
import { NotificationService } from '@/core/services/NotificationService.js';
import { renderTopBar } from './topbar-template.js';

/**
 * Componente modular Header — BUCA Website (Refactorizado)
 * =========================================================================
 * Desacoplado en servicios: FloatingPanelManager, KeyboardShortcuts, TouchGestures.
 * =========================================================================
 */

export const Header = {
    init(containerId = 'topbar-slot') {
        const container = document.getElementById(containerId);
        if (!container || container.querySelector('.app-header')) return;

        container.innerHTML = this.render();
        this.element = container.querySelector('.app-header');

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
    },

    _bindEvents() {
        // Clic fuera para cerrar paneles
        document.addEventListener('click', (e) => {
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

        window.addEventListener('resize', () => {
            const activePanel = document.querySelector('.glass-panel.active');
            if (activePanel) {
                const wrapperId = activePanel.getAttribute('data-anchor-wrapper');
                const wrapper = document.getElementById(wrapperId);
                FloatingPanelManager.positionPanel(activePanel, wrapper);
            }
        });

        // Acciones vía EventBus
        eventBus.on('header:toggle_panel', (payload = {}) => {
            const targetId = payload.target || payload.id;
            const triggerEl = payload.trigger || (targetId ? document.querySelector(`[data-target="${targetId}"]`) : null);
            if (targetId) this.togglePanel(targetId, triggerEl);
        });

        eventBus.on('header:close_all_panels', () => this.closeAllPanels());
        eventBus.on('header:toggle_fullscreen', () => this.toggleFullscreen());

        // Escuchar actualización de notificaciones
        eventBus.on('notifications:updated', (notifications) => {
            this.syncNotifications(notifications);
        });

        eventBus.on('ui:clear_notifications', () => {
            NotificationService.clearNotifications();
        });

        // Escuchar cambios globales de tasa
        eventBus.on('buca:rate_change', ({ rate }) => {
            const pill = document.querySelector('.live-bcv-mini-pill span');
            if (pill && rate) {
                pill.textContent = `Bs. ${Number(rate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        });

        // Buscador Global
        eventBus.on('workspace:toggle_search', () => {
            const searchInput = document.getElementById('ws-global-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
                const capsule = document.getElementById('ws-search-box');
                if (capsule) capsule.classList.add('search-active');
            }
        });

        const searchInput = document.getElementById('ws-global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                if (term.length > 2) {
                    eventBus.emit('ui:global_search', { term });
                }
            });
            searchInput.addEventListener('blur', () => {
                const capsule = document.getElementById('ws-search-box');
                if (capsule) capsule.classList.remove('search-active');
            });
        }
    },

    async syncNotifications(notifications) {
        if (!notifications) {
            notifications = NotificationService.getNotifications();
        }
        
        const panel = document.getElementById('panel-notifications');
        const user = sessionState.get().user;
        const currentUid = user?.uid;

        if (panel) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = NotificationTray.render(notifications);
            if (tempDiv.firstElementChild) {
                panel.innerHTML = tempDiv.firstElementChild.innerHTML;
            }
        }

        // Actualizar punto de alerta (Solo si hay no leídas)
        const unreadCount = notifications.filter(n => !n.read_by?.includes(currentUid)).length;
        const dot = document.querySelector('.notif-glow-dot');
        if (dot) {
            dot.style.display = unreadCount > 0 ? 'block' : 'none';
            if (unreadCount > 0) dot.classList.add('pulse-notif');
            else dot.classList.remove('pulse-notif');
        }
    },

    openPanel(panelId, triggerWrapper) {
        this.closeAllPanels();
        const panel = document.getElementById(panelId);
        if (!panel) return;

        if (triggerWrapper) {
            FloatingPanelManager.positionPanel(panel, triggerWrapper);
            triggerWrapper.classList.add('panel-open');
        }

        panel.classList.add('active');
        const overlay = document.getElementById('panel-overlay');
        if (overlay && window.innerWidth <= 767) overlay.classList.add('active');
    },

    closeAllPanels() {
        document.querySelectorAll('.glass-panel.active').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.dropdown-wrapper.panel-open').forEach(w => w.classList.remove('panel-open'));
        const overlay = document.getElementById('panel-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    togglePanel(panelId, trigger) {
        const panel = document.getElementById(panelId);
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
        if (document.getElementById('panel-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'panel-overlay';
        overlay.className = 'panel-overlay';
        overlay.addEventListener('click', () => this.closeAllPanels());
        document.body.appendChild(overlay);
    },

    toggleFullscreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
        this.closeAllPanels();
    },

    updateEngineUI(data) {
        const tierCode = data.id || 'L1';
        const profileBadge = document.getElementById('profile-engine-badge');
        if (profileBadge) {
            profileBadge.textContent = tierCode;
            profileBadge.className = 'badge ' + this._getBadgeClassForTier(data.tier);
        }
    },

    _getBadgeClassForTier(tierId) {
        const map = { 'eco': 'badge--eco', 'balanced': 'badge--balanced', 'pro': 'badge--pro', 'ultra': 'badge--ultra' };
        return map[tierId] || 'badge--balanced';
    },

    updateStatusUI(isOnline) {
        const badge = document.getElementById('connection-status-badge');
        if (!badge) return;
        
        const icon = badge.querySelector('i');
        const state = uiState.get();

        if (state.isSyncing || state.isConnecting) {
            badge.className = 'action-capsule-btn btn-status-toggle connecting';
            if (icon) icon.className = 'bi bi-wifi-2 status-icon-dot';
            badge.title = 'Intentando conectar...';
        } else if (isOnline) {
            badge.className = 'action-capsule-btn btn-status-toggle online';
            if (icon) icon.className = 'bi bi-wifi status-icon-dot';
            badge.title = 'Conexión Estable';
        } else {
            badge.className = 'action-capsule-btn btn-status-toggle offline';
            if (icon) icon.className = 'bi bi-wifi-off status-icon-dot';
            badge.title = 'Sin Conexión';
        }
    }
};

export default Header;

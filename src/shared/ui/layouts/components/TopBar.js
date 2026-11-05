import { uiState } from '@/core/state/ui.js';
import { sessionState } from '@/core/state/session.js';
import { eventBus } from '@/core/eventBus/index.js';
import { NotificationTray } from '@/shared/ui/components/notifications/NotificationTray.js';
import { ProfilePanel } from '@/shared/ui/components/header/ProfilePanel.js';
import { FloatingPanelManager } from '@/shared/ui/services/FloatingPanelManager.js';
import { KeyboardShortcuts } from '@/core/services/KeyboardShortcuts.js';
import { initTouchGestures } from '@/shared/utils/touchGestures.js';

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
            import('@/core/services/NotificationService.js').then(({ NotificationService }) => {
                NotificationService.clearNotifications();
            });
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
            const { NotificationService } = await import('@/core/services/NotificationService.js');
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
        const state = uiState.get();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const logoSrc = `/assets/icons/logo-${currentTheme === 'dark' ? 'light' : 'dark'}.svg`;
        const tierCode = state.graphics?.tier?.toUpperCase() || 'L1';
        const user = sessionState.get().user || {};
        const displayName = user.displayName || user.username || (user.email ? user.email.split('@')[0] : 'U');
        const initials = displayName.split(/[\s._-]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

        return `
            <header class="app-header header--glass">
                <div class="container-fluid">
                    <!-- Left Zone: Logo & Brand -->
                    <div class="header-left-identity d-flex align-items-center gap-2">
                        <a href="/" class="navbar-brand-premium d-flex align-items-center gap-2 m-0 text-decoration-none">
                            <div class="logo-neural-container position-relative d-flex align-items-center justify-content-center p-2 rounded-4">
                                <img id="app-logo" src="${logoSrc}" alt="Logo BUCA" class="logo-img-premium">
                                <div class="logo-aura"></div>
                            </div>
                            <div class="brand-typography d-flex flex-column">
                                <div class="d-flex align-items-center gap-1.5">
                                    <h1 class="brand-name-main mb-0">BUCA <span class="text-gradient-ai">AI</span></h1>
                                    <span class="badge bg-primary-subtle text-primary d-none d-sm-inline-block brand-badge-version">v5.4</span>
                                </div>
                                <span class="brand-tagline d-none d-lg-inline-block">ECOSISTEMA INTELIGENTE</span>
                            </div>
                        </a>
                    </div>

                    <!-- Center Zone: Global Search Capsule -->
                    <div class="header-center-zone d-flex align-items-center justify-content-center">
                        <div class="ws-search-capsule d-none d-md-flex align-items-center" id="ws-search-box">
                            <div class="search-inner-wrapper d-flex align-items-center px-3 py-1 rounded-pill">
                                <i class="bi bi-search search-icon-neural me-2"></i>
                                <input type="search" id="ws-global-search" class="search-input-field border-0 bg-transparent" placeholder="Buscar en BUCA AI..." autocomplete="off">
                                <div class="search-kbd-hint d-none d-lg-flex align-items-center gap-1 ms-2">
                                    <span class="kbd-key">Ctrl</span><span class="kbd-key">K</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Zone: Action Controls & User Profile -->
                    <div class="header-right d-flex align-items-center gap-2">
                        <div class="header-actions-capsule d-flex align-items-center">
                            <!-- Theme Toggle Button -->
                            <button type="button" class="action-capsule-btn btn-theme-toggle" data-action="ui:toggle_theme" title="Cambiar Tema Visual">
                                <i class="bi ${currentTheme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}"></i>
                            </button>
                            
                            <!-- Notifications Button -->
                            <div class="dropdown-wrapper position-relative" id="dw-panel-notifications">
                                <button type="button" class="action-capsule-btn btn-notif-toggle position-relative" data-action="header:toggle_panel" data-target="panel-notifications" title="Bandeja de Notificaciones">
                                    <i class="bi bi-bell-fill"></i>
                                    <span class="notif-glow-dot"></span>
                                </button>
                                ${NotificationTray.render()}
                            </div>

                            <!-- Test Area Button -->
                            <button type="button" class="action-capsule-btn btn-test-sandbox" data-action="ui:open_test_sandbox" title="Módulo de Pruebas">
                                <i class="bi bi-bug"></i>
                            </button>

                            <!-- Network Status Badge -->
                            <div id="connection-status-badge" class="action-capsule-btn btn-status-toggle online" title="Estado de Red">
                                <i class="bi bi-wifi status-icon-dot"></i>
                            </div>
                        </div>

                        <!-- User Profile Capsule -->
                        <div class="dropdown-wrapper" id="dw-panel-profile">
                            <div class="d-flex align-items-center clickable user-profile-trigger px-2 py-1 rounded-pill shadow-sm" 
                                 data-action="header:toggle_panel" 
                                 data-target="panel-profile" 
                                 title="Perfil y Ajustes de Cuenta">
                                <div class="user-avatar-circle bg-primary text-white d-flex align-items-center justify-content-center rounded-circle position-relative topbar-avatar">
                                    ${initials}
                                    <span class="position-absolute bottom-0 end-0 profile-status-dot bg-success border rounded-circle topbar-status-dot"></span>
                                </div>
                                <div class="d-none d-sm-flex flex-column text-start ms-1 me-1 lh-sm">
                                    <span class="fw-bold text-main text-truncate topbar-user-name">${displayName}</span>
                                    <span class="text-primary fw-bold topbar-user-role">ADMIN</span>
                                </div>
                                <i class="bi bi-chevron-down text-muted d-none d-sm-inline topbar-chevron"></i>
                            </div>
                            ${ProfilePanel.render(tierCode)}
                        </div>
                    </div>
                </div>
            </header>
        `;
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

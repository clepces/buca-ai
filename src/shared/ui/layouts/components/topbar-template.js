/**
 * @fileoverview TopBar HTML Template — Separated for line-limit compliance.
 * @module shared/ui/layouts/components/topbar-template
 */
import { uiState } from '@/core/state/ui.js';
import { sessionState } from '@/core/state/session.js';
import { NotificationTray } from '@/shared/ui/components/notifications/NotificationTray.js';
import { ProfilePanel } from '@/shared/ui/components/header/ProfilePanel.js';

/**
 * Genera el HTML completo del TopBar/Header corporativo.
 * @returns {string} Template literal del header.
 */
export function renderTopBar() {
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
}

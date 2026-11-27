/**
 * @fileoverview topbar-template - Plantilla HTML del Header Corporativo BUCA AI (Estilo Supabase Studio)
 * @module shared/ui/layouts/components/topbar-template
 */
import { sessionState } from '@/core/state/session.js';
import { FeedbackPanel } from '@/shared/ui/components/header/feedback-panel.js';
import { HelpPanel } from '@/shared/ui/components/header/help-panel.js';
import { AdvisorPanel } from '@/shared/ui/components/header/advisor-panel.js';
import { ProfilePanel } from '@/shared/ui/components/header/ProfilePanel.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { ENV } from '@/core/config/environment.js';

/**
 * Builds the context label and badge for the header breadcrumb.
 * @param {string|undefined} tenantId - Current tenant ID
 * @returns {{ bizLabel: string, hasTenant: boolean }}
 */
function getBizContext(tenantId) {
    const hasTenant = Boolean(tenantId && tenantId !== 'default');
    const bizLabel = hasTenant ? String(tenantId).replace(/^biz_/, 'Unidad ') : 'Ecosistema ERP';
    return { bizLabel, hasTenant };
}

export function renderTopBar() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const logoSrc = `/assets/icons/logo-${currentTheme === 'dark' ? 'light' : 'dark'}.svg`;
    const user = sessionState.get().user || {};
    const tenantId = sessionState.get().tenantId;
    const displayName = user.displayName || user.username || (user.email ? user.email.split('@')[0] : 'Usuario');
    const initials = displayName.split(/[\s._-]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

    const { bizLabel, hasTenant } = getBizContext(tenantId);
    const versionTag = `v${ENV.APP_VERSION}`;
    const envBadge = hasTenant ? 'PRODUCCIÓN' : 'STANDALONE';
    const envBadgeClass = hasTenant ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary';

    return `
        <header class="app-header header--solid shadow-2xs">
            <div class="container-fluid">
                <!-- Left Zone: Logo con contracción animada + Breadcrumb Supabase -->
                <div class="header-left-identity d-flex align-items-center gap-2">
                    <a href="/" class="navbar-brand-premium d-flex align-items-center gap-2 m-0 text-decoration-none" aria-label="BUCA AI - Inicio">
                        <div class="logo-neural-container d-flex align-items-center justify-content-center p-1.5 rounded-2 bg-subtle border">
                            <img id="app-logo" src="${logoSrc}" alt="Logo BUCA" class="logo-img-premium" width="20" height="20">
                        </div>
                        <div class="brand-collapsible" aria-hidden="true">
                            <span class="brand-name-main fw-bold text-main">BUCA <span class="text-primary">AI</span></span>
                            <span class="badge bg-secondary-subtle text-muted rounded-pill px-2 py-0.5 x-small font-monospace brand-version-badge">${versionTag}</span>
                        </div>
                        <!-- Tooltip hover: aparece sobre logo contraído -->
                        <div class="brand-hover-tooltip" role="tooltip" aria-hidden="true">
                            <strong class="brand-hover-tooltip__name">BUCA AI</strong>
                            <span class="brand-hover-tooltip__version">${versionTag}</span>
                            <span class="brand-hover-tooltip__sep">/</span>
                            <span class="brand-hover-tooltip__context">${escapeHTML(bizLabel)} <small>${envBadge}</small></span>
                        </div>
                    </a>

                    <!-- Separador y Breadcrumb de Organización / Negocio -->
                    <span class="header-breadcrumb-sep text-muted opacity-40 d-none d-md-inline">/</span>
                    <div class="header-breadcrumb-ctx d-none d-md-flex align-items-center gap-1.5">
                        <span class="fw-semibold text-main small text-truncate max-w-160" title="${escapeHTML(bizLabel)}">${escapeHTML(bizLabel)}</span>
                        <span class="badge ${envBadgeClass} rounded-pill px-1.5 py-0.2 x-small font-monospace">
                            ${envBadge}
                        </span>
                    </div>
                </div>

                <!-- Center Zone: Vacío / Espaciador Limpio -->
                <div class="header-center-zone flex-grow-1"></div>

                <!-- Right Zone: Controls & Dropdowns (Supabase Inspired) -->
                <div class="header-right d-flex align-items-center gap-1.5">
                    <!-- 1. Botón Feedback -->
                    <div class="dropdown-wrapper position-relative" id="dw-panel-feedback">
                        <button type="button" class="btn btn-sm header-btn-feedback d-flex align-items-center gap-1.5 px-2.5 py-1" data-action="header:toggle_panel" data-target="panel-feedback" data-tooltip="Compartir Feedback">
                            <i class="bi bi-chat-square-text"></i>
                            <span class="d-none d-sm-inline">Feedback</span>
                        </button>
                        ${FeedbackPanel.render()}
                    </div>

                    <!-- 2. Botón Buscar (Command Palette) -->
                    <button type="button" class="btn btn-sm header-btn-search d-flex align-items-center gap-2 px-2.5 py-1" data-action="ui:open_search_palette" data-tooltip="Buscar o comandos (Ctrl + K)">
                        <i class="bi bi-search"></i>
                        <span class="d-none d-md-inline">Buscar...</span>
                        <kbd class="d-none d-lg-inline-block px-1.5 py-0.2 rounded border x-small">Ctrl K</kbd>
                    </button>

                    <!-- Divisor Visual 1 -->
                    <span class="header-divider d-none d-sm-inline-block"></span>

                    <!-- 3. Botón Ayuda (?) -->
                    <div class="dropdown-wrapper position-relative" id="dw-panel-help">
                        <button type="button" class="btn btn-sm header-circle-btn" data-action="header:toggle_panel" data-target="panel-help" data-tooltip="Centro de Ayuda & Documentación">
                            <i class="bi bi-question-circle fs-6"></i>
                        </button>
                        ${HelpPanel.render()}
                    </div>

                    <!-- 4. Botón Advisor Center (Bombillo / Campana) -->
                    <div class="dropdown-wrapper position-relative" id="dw-panel-advisor">
                        <button type="button" class="btn btn-sm header-circle-btn position-relative" data-action="header:toggle_panel" data-target="panel-advisor" data-tooltip="Advisor Center: Asesoría & Diagnóstico">
                            <i class="bi bi-lightbulb fs-6"></i>
                            <span class="position-absolute top-1 end-1 p-1 bg-warning rounded-circle notif-glow-dot"></span>
                        </button>
                        ${AdvisorPanel.render()}
                    </div>

                    <!-- 5. Botón Consola de Auditoría -->
                    <button type="button" class="btn btn-sm header-circle-btn d-none d-sm-inline-flex" data-action="ui:open_activity_log" data-tooltip="Consola de Auditoría en Tiempo Real">
                        <i class="bi bi-terminal fs-6"></i>
                    </button>

                    <!-- 6. Botón AI Assistant -->
                    <button type="button" class="btn btn-sm header-circle-btn text-primary" data-action="ui:open_ai_assistant" data-tooltip="BUCA AI Copilot & Asistente">
                        <i class="bi bi-stars fs-6"></i>
                    </button>

                    <!-- Divisor Visual 2 -->
                    <span class="header-divider d-none d-sm-inline-block"></span>

                    <!-- 7. Avatar & Account Settings -->
                    <div class="dropdown-wrapper position-relative ms-0.5" id="dw-panel-profile">
                        <button type="button" class="btn btn-sm p-0 rounded-circle border-0 header-avatar-trigger" data-action="header:toggle_panel" data-target="panel-profile" data-tooltip="Ajustes de Cuenta & Perfil">
                            <div class="user-avatar-circle bg-primary text-white d-flex align-items-center justify-content-center rounded-circle position-relative topbar-avatar">
                                <span class="fw-bold x-small">${initials}</span>
                                <span class="position-absolute bottom-0 end-0 profile-status-dot bg-success border rounded-circle"></span>
                            </div>
                        </button>
                        ${ProfilePanel.render()}
                    </div>
                </div>
            </div>
        </header>
    `;
}

export default renderTopBar;

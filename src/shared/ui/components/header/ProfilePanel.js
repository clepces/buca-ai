/**
 * @fileoverview ProfilePanel - Menú Desplegable de Perfil y Ajustes Corporativos
 * @module shared/ui/components/header/ProfilePanel
 */
import { sessionState } from '@/core/state/session.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { ENV } from '@/core/config/environment.js';

export const ProfilePanel = {
    render: (_tierCode = 'L1') => {
        const user = sessionState.get().user || {};
        const email = user.email || '';
        const displayName = user.displayName || user.username || (email ? email.split('@')[0] : 'Usuario');
        const initials = displayName.split(/[\s._-]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
        const role = (user.role || 'user').toUpperCase();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

        return `
            <div id="panel-profile" class="glass-panel solid-dropdown-panel profile-dropdown-panel">
                <!-- 1. HEADER DE USUARIO -->
                <div class="panel-profile-header p-3 border-bottom d-flex align-items-center gap-3">
                    <div class="user-avatar-circle large bg-primary text-white d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
                        <span class="fw-bold">${initials}</span>
                        <span class="status-dot bg-success border rounded-circle"></span>
                    </div>
                    <div class="profile-info flex-grow-1 min-w-0">
                        <div class="d-flex align-items-center gap-1.5 mb-0.5">
                            <h6 class="profile-name mb-0 text-truncate fw-bold text-main small">${escapeHTML(displayName)}</h6>
                            <span class="badge bg-primary-subtle text-primary rounded-pill px-1.5 py-0.5 x-small font-monospace">${role}</span>
                        </div>
                        <span class="profile-email text-muted x-small text-truncate d-block">${escapeHTML(email || 'Sin correo asociado')}</span>
                        <span class="badge bg-secondary-subtle text-muted rounded-pill px-1.5 py-0.5 x-small mt-1">PLAN COMMUNITY</span>
                    </div>
                    <button class="btn btn-sm btn-icon text-muted p-0 d-md-none" data-action="header:close_all_panels">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>

                <!-- 2. CONTENIDO PRINCIPAL -->
                <div class="panel-profile-body p-2 buca-scroll-area max-h-340">
                    <!-- Sección de Navegación de Cuenta -->
                    <div class="list-group list-group-flush mb-2">
                        <span class="x-small fw-bold text-muted text-uppercase px-2.5 py-1 d-block">Cuenta & Seguridad</span>
                        
                        <button type="button" class="list-group-item list-group-item-action border-0 rounded-3 d-flex align-items-center gap-2.5 py-2 px-2.5 mb-0.5" data-action="profile:open" data-tab="general">
                            <div class="p-1.5 rounded-2 bg-primary-subtle text-primary"><i class="bi bi-person-gear"></i></div>
                            <div class="flex-grow-1 text-start">
                                <span class="d-block small fw-semibold text-main">Mi Perfil & Datos</span>
                                <span class="d-block x-small text-muted">Gestión de identidad y ficha técnica</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>

                        <button type="button" class="list-group-item list-group-item-action border-0 rounded-3 d-flex align-items-center gap-2.5 py-2 px-2.5 mb-0.5" data-action="profile:open" data-tab="security">
                            <div class="p-1.5 rounded-2 bg-warning-subtle text-warning"><i class="bi bi-shield-lock"></i></div>
                            <div class="flex-grow-1 text-start">
                                <span class="d-block small fw-semibold text-main">Seguridad & MFA</span>
                                <span class="d-block x-small text-muted">Protección TOTP AAL2 y PIN</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>

                        <button type="button" class="list-group-item list-group-item-action border-0 rounded-3 d-flex align-items-center gap-2.5 py-2 px-2.5 mb-0.5" data-action="ui:open_features_modal">
                            <div class="p-1.5 rounded-2 bg-info-subtle text-info"><i class="bi bi-grid-3x3-gap"></i></div>
                            <div class="flex-grow-1 text-start">
                                <span class="d-block small fw-semibold text-main">Funciones de la App</span>
                                <span class="d-block x-small text-muted">Catálogo modular interactivo</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>

                        <button type="button" class="list-group-item list-group-item-action border-0 rounded-3 d-flex align-items-center gap-2.5 py-2 px-2.5 mb-0.5" data-action="ui:open_changelog_modal">
                            <div class="p-1.5 rounded-2 bg-success-subtle text-success"><i class="bi bi-clock-history"></i></div>
                            <div class="flex-grow-1 text-start">
                                <span class="d-block small fw-semibold text-main">Registro de Cambios</span>
                                <span class="d-block x-small text-muted">Novedades y notas de la versión</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>
                    </div>

                    <!-- Sección de Tema Visual e Interfaz -->
                    <div class="border-top pt-2 mt-1">
                        <span class="x-small fw-bold text-muted text-uppercase px-2.5 py-1 d-block">Tema de Interfaz</span>
                        <div class="d-flex align-items-center justify-content-between p-1.5 mx-1 rounded-3 bg-subtle border">
                            <button type="button" class="btn btn-sm flex-fill rounded-2 py-1 ${currentTheme === 'light' ? 'btn-primary shadow-xs' : 'btn-link text-muted'}" data-action="ui:set_theme" data-theme="light" title="Modo Claro">
                                <i class="bi bi-sun-fill me-1"></i> Claro
                            </button>
                            <button type="button" class="btn btn-sm flex-fill rounded-2 py-1 ${currentTheme === 'dark' ? 'btn-primary shadow-xs' : 'btn-link text-muted'}" data-action="ui:set_theme" data-theme="dark" title="Modo Oscuro">
                                <i class="bi bi-moon-stars-fill me-1"></i> Oscuro
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 3. FOOTER CON ACCIONES DE SESIÓN -->
                <div class="panel-profile-footer p-2.5 bg-subtle border-top">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 d-flex align-items-center gap-1.5 fw-semibold x-small" data-action="auth:logout">
                            <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                        </button>
                        <button type="button" class="btn btn-sm btn-link text-muted text-decoration-none x-small p-0" data-action="ui:open_settings">
                            <i class="bi bi-gear me-1"></i> Ajustes
                        </button>
                    </div>
                    <div class="d-flex align-items-center justify-content-between text-muted x-small border-top pt-2">
                        <span>Zona: America/Caracas</span>
                        <span class="badge bg-secondary-subtle text-muted rounded-pill px-2 py-0.5">v${ENV.APP_VERSION}</span>
                    </div>
                </div>
            </div>
        `;
    }
};

export default ProfilePanel;

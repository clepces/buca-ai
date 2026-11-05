

import { sessionState } from '@/core/state/session.js';
import { escapeHTML } from '@/shared/utils/security.js';

/**
 * ProfilePanel - Subcomponente Rico del Header
 * =========================================================================
 * Gestiona la información del usuario, accesos rápidos y controles del motor.
 * Refactorizado para Seguridad Total (Event Delegation).
 */
export const ProfilePanel = {
    render: (tierCode = 'L1') => {
        const user = sessionState.get().user || {};
        const email = user.email || '';
        const displayName = user.displayName || user.username || (email ? email.split('@')[0] : 'Usuario');
        const initials = displayName.split(/[\s._-]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';
        const role = (user.role || 'user').toUpperCase();

        return `
            <div id="panel-profile" class="glass-panel glass-panel--rich">
                <!-- Arrastre Táctil (Solo Visual en CSS) -->
                <div class="panel-mobile-handle d-md-none"></div>

                <!-- Header de Perfil -->
                <div class="panel-profile-zone d-flex align-items-center gap-3 p-3">
                    <div class="user-avatar-circle large">
                        <span>${initials}</span>
                        <span class="status-dot"></span>
                    </div>
                    <div class="profile-info flex-grow-1 overflow-hidden">
                        <h6 class="profile-name mb-0 text-truncate fw-bold">${escapeHTML(displayName)}</h6>
                        <span class="profile-email text-muted small text-truncate d-block">${escapeHTML(email || 'Sin correo asociado')}</span>
                    </div>
                    <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2 font-monospace profile-badge-sm">${role}</span>
                    
                    <!-- Botón Cerrar (Solo Móvil) -->
                    <button class="btn btn-sm btn-icon d-md-none ms-2" data-action="header:toggle_panel" data-target="panel-profile">
                        <i class="bi bi-chevron-down"></i>
                    </button>
                </div>

                <!-- Acceso Rápido -->
                <div class="px-3 pb-2 border-bottom">
                    <span class="panel-section-title d-block mb-2 text-uppercase fw-bold text-muted">Acceso Rápido</span>
                    <div class="panel-quick-controls d-flex align-items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button class="profile-quick-action d-md-none" data-action="ui:toggle_theme" title="Alternar Modo Oscuro/Claro">
                            <i class="bi bi-moon-stars"></i>
                        </button>
                        <button class="profile-quick-action" data-action="header:toggle_fullscreen" title="Pantalla Completa">
                            <i class="bi bi-arrows-fullscreen"></i>
                        </button>
                        <button class="profile-quick-action d-md-none" data-action="header:toggle_panel" data-target="panel-language" title="Idioma">
                            <i class="bi bi-translate"></i>
                        </button>
                        <button class="profile-quick-action d-md-none" data-action="ui:open_rate" title="Tasa BCV">
                            <i class="bi bi-currency-exchange"></i>
                        </button>
                        <button class="profile-quick-action" data-action="ui:open_performance" title="Motor de Rendimiento">
                            <i class="bi bi-speedometer2"></i>
                        </button>
                        <button class="profile-quick-action" data-action="ui:open_terminal" title="Terminal BNE">
                            <i class="bi bi-terminal"></i>
                        </button>
                    </div>
                </div>

                <!-- ÁREA DE SCROLL -->
                <div class="buca-scroll-area flex-grow-1 px-2 py-3">
                    <!-- Sección: Cuenta -->
                    <div class="list-group list-group-flush mb-4">
                        <div class="px-2 mb-2"><span class="panel-section-title text-uppercase fw-bold text-muted">Mi Cuenta</span></div>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_profile">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-person-badge text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Perfil & Datos</div>
                                <div class="text-muted profile-subtext-micro">Edita tu información personal</div>
                            </div>
                            <i class="bi bi-chevron-right text-muted small"></i>
                        </button>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_security">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-shield-lock text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Seguridad PIN</div>
                                <div class="text-muted profile-subtext-micro">Configurar Llave Maestra</div>
                            </div>
                            <i class="bi bi-chevron-right text-muted small"></i>
                        </button>
                    </div>

                    <!-- Sección: Motor -->
                    <div class="list-group list-group-flush mb-4">
                        <div class="px-2 mb-2"><span class="panel-section-title text-uppercase fw-bold text-muted">Motor de Rendimiento</span></div>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_performance">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-speedometer2 text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Buca Engine</div>
                                <div class="text-muted profile-subtext-micro">Niveles de renderizado</div>
                            </div>
                            <span class="badge bg-primary rounded-pill small" id="profile-engine-badge">${tierCode}</span>
                        </button>
                    </div>

                    <!-- Sección: Sistema -->
                    <div class="list-group list-group-flush">
                        <div class="px-2 mb-2"><span class="panel-section-title text-uppercase fw-bold text-muted">Sistema & Widgets</span></div>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_settings">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-gear-wide-connected text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Centro de Control</div>
                                <div class="text-muted profile-subtext-micro">Ajustes generales</div>
                            </div>
                        </button>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:manage_widgets">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-grid-3x3-gap text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Gestión de Widgets</div>
                                <div class="text-muted profile-subtext-micro">Personaliza tu dashboard</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- FOOTER CON TONOS SUAVES Y ELEGANTE EQUILIBRIO -->
                <div class="panel-footer-bar p-3 border-top d-flex justify-content-between align-items-center">
                    <button class="profile-logout-btn" data-action="ui:logout" title="Cerrar Sesión Activa">
                        <i class="bi bi-box-arrow-right"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                    <div class="d-flex align-items-center gap-2">
                        <button class="profile-settings-btn" data-action="ui:open_settings" title="Configuraciones del Sistema">
                            <i class="bi bi-gear-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};

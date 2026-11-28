/**
 * @fileoverview ribbon-template - Barra de Navegación contextual del Workspace
 * @module modules/workspace/components/ribbon-template
 */
export function renderRibbonTemplate() {
    return `
        <div class="workspace-navigation-ribbon" role="toolbar" aria-label="Navegación y controles del Workspace">
            <div class="ribbon-content">
                <!-- 1. LEFT ZONE: AREA SELECTOR + CONTEXT PILLS -->
                <div class="ws-ribbon-left d-flex align-items-center gap-2">
                    <!-- Area Selector: solo muestra ↨ si hay >1 negocio -->
                    <div class="ribbon-area-selector" data-action="workspace:open_area_menu" data-tooltip="Panel de Control">
                        <i class="bi bi-buildings-fill text-primary"></i>
                        <span class="ribbon-area-selector__label">Panel de Control</span>
                    </div>

                    <span class="ribbon-sep d-none d-lg-inline"></span>

                    <!-- Segmented Context Pills (flat, sin glass) -->
                    <div class="ws-context-segmented" role="tablist">
                        <button type="button" class="context-pill active" data-action="workspace:filter_context" data-context="all" role="tab" aria-selected="true" data-tooltip="Ver todas mis unidades (Ctrl + 1)">
                            <i class="bi bi-briefcase-fill"></i>
                            <span class="pill-text d-none d-sm-inline">Mis Negocios</span>
                            <span class="pill-count">0</span>
                        </button>
                        <button type="button" class="context-pill" data-action="workspace:filter_context" data-context="directory" role="tab" aria-selected="false" data-tooltip="Explorar directorio global (Ctrl + 2)">
                            <i class="bi bi-diagram-3"></i>
                            <span class="pill-text d-none d-sm-inline">Directorio</span>
                        </button>
                    </div>
                </div>

                <!-- 2. CENTER ZONE: RESERVED EMPTY SPACE -->
                <div class="ws-ribbon-center flex-grow-1"></div>

                <!-- 3. RIGHT ZONE: ACTIONS & TOOLS NAV OVERFLOW SUITE -->
                <div class="ws-ribbon-right d-flex align-items-center gap-2">
                    <!-- Primary CTA -->
                    <button type="button" class="btn btn-sm ws-btn-primary shadow-xs" data-action="business:open_create" data-tooltip="Crear Nueva Unidad Comercial (Ctrl + N)">
                        <i class="bi bi-plus-lg"></i>
                        <span class="ws-btn-label">Nueva Unidad</span>
                    </button>

                    <!-- Nav Overflow Tools Cluster -->
                    <div class="ws-tools-overflow nav-overflow d-flex align-items-center gap-1" data-bs-toggle="nav-overflow">
                        <!-- Direct Action Tools (Desktop XL+) -->
                        <div class="ws-direct-tools d-none d-xl-flex align-items-center gap-1">
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Alternar Vista (Ctrl + G)" data-action="workspace:toggle_view_mode">
                                <i class="bi bi-grid-fill"></i>
                            </button>
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Sincronizar Datos (Ctrl + R)" data-action="workspace:refresh_data">
                                <i class="bi bi-arrow-clockwise"></i>
                            </button>
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Exportar Reporte (Ctrl + E)" data-action="workspace:export_report">
                                <i class="bi bi-cloud-arrow-down"></i>
                            </button>
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Ajustes del Workspace (Ctrl + ,)" data-action="ui:open_settings">
                                <i class="bi bi-sliders2"></i>
                            </button>
                        </div>

                        <!-- Nav Overflow Trigger -->
                        <div class="dropdown-wrapper position-relative" id="dw-ws-nav-overflow">
                            <button type="button" class="btn btn-sm action-more-pill" id="ws-nav-overflow-more-toggle" data-tooltip="Centro de Operaciones y Herramientas">
                                <i class="bi bi-three-dots"></i>
                                <span>Más</span>
                            </button>

                            <div class="ws-actions-dropdown shadow-xl border d-none" id="ws-actions-dropdown">
                                <div class="p-2 buca-scroll-area">
                                    <div class="d-xl-none border-bottom pb-2 mb-2">
                                        <span class="dropdown-group-title">Herramientas Rápidas</span>
                                        <div class="d-flex align-items-center gap-1.5 px-1 pt-1">
                                            <button type="button" class="btn btn-sm btn-light border flex-fill py-1.5 px-2 d-flex align-items-center justify-content-center gap-1.5 text-muted x-small" data-action="workspace:toggle_view_mode" data-tooltip="Alternar Vista">
                                                <i class="bi bi-grid-fill"></i> Vista
                                            </button>
                                            <button type="button" class="btn btn-sm btn-light border flex-fill py-1.5 px-2 d-flex align-items-center justify-content-center gap-1.5 text-muted x-small" data-action="workspace:refresh_data" data-tooltip="Sincronizar Datos">
                                                <i class="bi bi-arrow-clockwise"></i> Sync
                                            </button>
                                            <button type="button" class="btn btn-sm btn-light border flex-fill py-1.5 px-2 d-flex align-items-center justify-content-center gap-1.5 text-muted x-small" data-action="workspace:export_report" data-tooltip="Exportar Reporte">
                                                <i class="bi bi-cloud-arrow-down"></i> Exportar
                                            </button>
                                        </div>
                                    </div>

                                    <span class="dropdown-group-title">Gestión Comercial</span>
                                    <button type="button" class="dropdown-item-btn" data-action="router:navigate" data-payload='{"path": "/pos"}'>
                                        <div class="p-1.5 rounded-2 bg-primary-subtle text-primary"><i class="bi bi-pc-display-horizontal"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Punto de Venta (POS)</span>
                                            <span class="d-block x-small text-muted text-truncate">Facturación y cobro rápido</span>
                                        </div>
                                        <kbd class="dropdown-item-kbd">Ctrl P</kbd>
                                    </button>
                                    <button type="button" class="dropdown-item-btn" data-action="router:navigate" data-payload='{"path": "/clients"}'>
                                        <div class="p-1.5 rounded-2 bg-success-subtle text-success"><i class="bi bi-person-badge"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Clientes & CRM</span>
                                            <span class="d-block x-small text-muted text-truncate">Cartera comercial y crédito</span>
                                        </div>
                                    </button>

                                    <button type="button" class="dropdown-item-btn disabled-dev-item" data-action="feature:fiscal_billing" data-status="in-development" title="Función en Desarrollo">
                                        <div class="p-1.5 rounded-2 bg-secondary-subtle text-muted"><i class="bi bi-receipt"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-muted text-truncate">Facturación Fiscal SENIAT</span>
                                            <span class="d-block x-small text-muted opacity-75 text-truncate">Impresoras y libros fiscales</span>
                                        </div>
                                        <span class="item-badge-roadmap">Roadmap</span>
                                    </button>

                                    <button type="button" class="dropdown-item-btn disabled-dev-item" data-action="feature:batch_tracking" data-status="in-development" title="Función en Desarrollo">
                                        <div class="p-1.5 rounded-2 bg-secondary-subtle text-muted"><i class="bi bi-boxes"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-muted text-truncate">Trazabilidad por Lotes</span>
                                            <span class="d-block x-small text-muted opacity-75 text-truncate">Vencimientos y almacén</span>
                                        </div>
                                        <span class="item-badge-roadmap">Roadmap</span>
                                    </button>

                                    <div class="border-top my-1.5"></div>

                                    <span class="dropdown-group-title">Auditoría & Ajustes</span>
                                    <button type="button" class="dropdown-item-btn" data-action="ui:open_activity_log">
                                        <div class="p-1.5 rounded-2 bg-warning-subtle text-warning"><i class="bi bi-clock-history"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Auditoría de Actividad</span>
                                            <span class="d-block x-small text-muted text-truncate">Historial inmutable de eventos</span>
                                        </div>
                                        <kbd class="dropdown-item-kbd">Ctrl L</kbd>
                                    </button>
                                    <button type="button" class="dropdown-item-btn" data-action="ui:open_performance">
                                        <div class="p-1.5 rounded-2 bg-info-subtle text-info"><i class="bi bi-speedometer2"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Diagnóstico BENE</span>
                                            <span class="d-block x-small text-muted text-truncate">Telemetría de hardware & FPS</span>
                                        </div>
                                    </button>
                                    <button type="button" class="dropdown-item-btn" data-action="ui:open_settings">
                                        <div class="p-1.5 rounded-2 bg-secondary-subtle text-muted"><i class="bi bi-gear"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Ajustes del Workspace & BENE</span>
                                            <span class="d-block x-small text-muted text-truncate">Parámetros de espacio y entorno</span>
                                        </div>
                                        <kbd class="dropdown-item-kbd">Ctrl ,</kbd>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export default renderRibbonTemplate;

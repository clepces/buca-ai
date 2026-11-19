/**
 * @fileoverview ribbon-template - Plantilla HTML de la Barra de Navegación y Controles del Workspace
 * @module modules/workspace/components/ribbon-template
 */
export function renderRibbonTemplate() {
    return `
        <div class="workspace-navigation-ribbon" role="toolbar" aria-label="Navegación y controles del Workspace">
            <div class="ribbon-content">
                <!-- 1. LEFT ZONE: BREADCRUMBS & CONTEXT PILLS -->
                <div class="ws-ribbon-left d-flex align-items-center gap-2">
                    <nav class="breadcrumb-trail d-none d-lg-flex align-items-center gap-1.5" aria-label="Ubicación">
                        <div class="crumb cursor-pointer" data-action="router:navigate" data-payload='{"path": "/workspace"}' title="Ir al Panel Principal">
                            <i class="bi bi-buildings-fill text-primary me-1"></i>
                            <span class="fw-semibold small text-main">Workspace</span>
                        </div>
                        <span class="crumb-separator text-muted opacity-40"><i class="bi bi-chevron-right x-small"></i></span>
                        <div class="crumb active d-flex align-items-center gap-1">
                            <span class="crumb-badge-live"></span>
                            <span class="fw-semibold small text-muted">Panel de Control</span>
                        </div>
                    </nav>

                    <span class="text-muted opacity-30 d-none d-lg-inline">|</span>

                    <!-- Segmented Context Pills -->
                    <div class="ws-context-segmented d-flex align-items-center p-0.5 rounded-pill bg-subtle border" role="tablist">
                        <button type="button" class="context-pill active btn btn-sm rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5 fw-semibold x-small" data-action="workspace:filter_context" data-context="all" role="tab" aria-selected="true" title="Ver todas mis unidades">
                            <i class="bi bi-briefcase-fill text-primary"></i>
                            <span class="pill-text d-none d-sm-inline">Mis Negocios</span>
                            <span class="badge bg-primary text-white rounded-pill px-1.5 py-0.2 pill-count">0</span>
                        </button>
                        <button type="button" class="context-pill btn btn-sm rounded-pill px-2.5 py-1 d-flex align-items-center gap-1.5 fw-semibold x-small text-muted" data-action="workspace:filter_context" data-context="directory" role="tab" aria-selected="false" title="Explorar directorio global">
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
                    <button type="button" class="btn btn-sm ws-btn-primary shadow-xs" data-action="ui:open_create_business" data-tooltip="Crear Nueva Unidad Comercial">
                        <i class="bi bi-plus-lg"></i>
                        <span class="ws-btn-label">Nueva Unidad</span>
                    </button>

                    <!-- Nav Overflow Tools Cluster (Direct Tools + Collapsible '... Más') -->
                    <div class="ws-tools-overflow nav-overflow d-flex align-items-center gap-1" data-bs-toggle="nav-overflow">
                        <!-- Direct Action Tools (Desktop XL+) -->
                        <div class="ws-direct-tools d-none d-xl-flex align-items-center gap-1">
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Alternar Vista (Cuadrícula / Lista)" data-action="workspace:toggle_view_mode">
                                <i class="bi bi-grid-fill"></i>
                            </button>
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Sincronizar Datos Operativos" data-action="workspace:refresh_data">
                                <i class="bi bi-arrow-clockwise"></i>
                            </button>
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Exportar Reporte Maestro" data-action="ui:export_report">
                                <i class="bi bi-cloud-arrow-down"></i>
                            </button>
                            <button type="button" class="btn btn-sm action-mini-pill" data-tooltip="Ajustes del Workspace & BENE" data-action="ui:open_settings">
                                <i class="bi bi-sliders2"></i>
                            </button>
                        </div>

                        <!-- Nav Overflow Trigger Button ('... Más') -->
                        <div class="dropdown-wrapper position-relative" id="dw-ws-nav-overflow">
                            <button type="button" class="btn btn-sm action-more-pill" id="ws-nav-overflow-more-toggle" data-tooltip="Centro de Operaciones y Herramientas">
                                <i class="bi bi-three-dots"></i>
                                <span>Más</span>
                            </button>

                            <!-- Collapsible Operations Dropdown (Bootstrap v6 Nav-Overflow Pattern) -->
                            <div class="ws-actions-dropdown shadow-xl border d-none" id="ws-actions-dropdown">
                                <div class="p-2 buca-scroll-area">
                                    <!-- Herramientas Rápidas para móvil / tablet / laptop -->
                                    <div class="d-xl-none border-bottom pb-2 mb-2">
                                        <span class="dropdown-group-title">Herramientas Rápidas</span>
                                        <div class="d-flex align-items-center gap-1.5 px-1 pt-1">
                                            <button type="button" class="btn btn-sm btn-light border flex-fill py-1.5 px-2 d-flex align-items-center justify-content-center gap-1.5 text-muted x-small" data-action="workspace:toggle_view_mode" data-tooltip="Alternar Vista">
                                                <i class="bi bi-grid-fill"></i> Vista
                                            </button>
                                            <button type="button" class="btn btn-sm btn-light border flex-fill py-1.5 px-2 d-flex align-items-center justify-content-center gap-1.5 text-muted x-small" data-action="workspace:refresh_data" data-tooltip="Sincronizar Datos">
                                                <i class="bi bi-arrow-clockwise"></i> Sync
                                            </button>
                                            <button type="button" class="btn btn-sm btn-light border flex-fill py-1.5 px-2 d-flex align-items-center justify-content-center gap-1.5 text-muted x-small" data-action="ui:export_report" data-tooltip="Exportar Reporte">
                                                <i class="bi bi-cloud-arrow-down"></i> Exportar
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Categoría: Gestión Comercial -->
                                    <span class="dropdown-group-title">Gestión Comercial</span>
                                    <button type="button" class="dropdown-item-btn" data-action="router:navigate" data-payload='{"path": "/pos"}'>
                                        <div class="p-1.5 rounded-2 bg-primary-subtle text-primary"><i class="bi bi-pc-display-horizontal"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Punto de Venta (POS)</span>
                                            <span class="d-block x-small text-muted text-truncate">Facturación y cobro rápido</span>
                                        </div>
                                    </button>
                                    <button type="button" class="dropdown-item-btn" data-action="router:navigate" data-payload='{"path": "/clients"}'>
                                        <div class="p-1.5 rounded-2 bg-success-subtle text-success"><i class="bi bi-person-badge"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Clientes & CRM</span>
                                            <span class="d-block x-small text-muted text-truncate">Cartera comercial y crédito</span>
                                        </div>
                                    </button>

                                    <!-- Elementos en Desarrollo (Roadmap) -->
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

                                    <!-- Categoría: Auditoría & Ajustes -->
                                    <span class="dropdown-group-title">Auditoría & Ajustes</span>
                                    <button type="button" class="dropdown-item-btn" data-action="ui:open_activity_log">
                                        <div class="p-1.5 rounded-2 bg-warning-subtle text-warning"><i class="bi bi-clock-history"></i></div>
                                        <div class="flex-grow-1 min-w-0">
                                            <span class="d-block small fw-semibold text-main text-truncate">Auditoría de Actividad</span>
                                            <span class="d-block x-small text-muted text-truncate">Historial inmutable de eventos</span>
                                        </div>
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

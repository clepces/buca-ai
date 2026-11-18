/**
 * @fileoverview ribbon-template - Plantilla HTML de la Barra de Navegación y Controles del Workspace
 * @module modules/workspace/components/ribbon-template
 */
export function renderRibbonTemplate() {
    return `
        <div class="workspace-navigation-ribbon" role="toolbar" aria-label="Navegación y controles del Workspace">
            <div class="ribbon-content container-max px-2">
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

                    <!-- Segmented Pills -->
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

                <!-- 2. CENTER ZONE: NAV OVERFLOW (BOOTSTRAP 6 PATTERN) -->
                <div class="ws-ribbon-center d-none d-xl-flex align-items-center flex-grow-1 justify-content-center">
                    <div class="nav-overflow d-flex align-items-center gap-1" data-bs-toggle="nav-overflow">
                        <button type="button" class="btn btn-sm btn-nav-pill active rounded-pill px-3 py-1 x-small fw-semibold" data-action="router:navigate" data-payload='{"path": "/workspace"}'>
                            Inicio
                        </button>
                        <button type="button" class="btn btn-sm btn-nav-pill rounded-pill px-3 py-1 x-small fw-semibold text-muted" data-action="router:navigate" data-payload='{"path": "/pos"}'>
                            Ventas (POS)
                        </button>
                        <button type="button" class="btn btn-sm btn-nav-pill rounded-pill px-3 py-1 x-small fw-semibold text-muted" data-action="router:navigate" data-payload='{"path": "/clients"}'>
                            Clientes
                        </button>
                        <button type="button" class="btn btn-sm btn-nav-pill rounded-pill px-3 py-1 x-small fw-semibold text-muted" data-action="router:navigate" data-payload='{"path": "/inventory"}'>
                            Inventario
                        </button>
                        <button type="button" class="btn btn-sm btn-nav-pill rounded-pill px-3 py-1 x-small fw-semibold text-muted" data-action="router:navigate" data-payload='{"path": "/providers"}'>
                            Proveedores
                        </button>

                        <!-- Nav Overflow Dropdown Trigger -->
                        <div class="dropdown-wrapper position-relative">
                            <button type="button" class="btn btn-sm btn-nav-pill rounded-pill px-2.5 py-1 x-small fw-semibold text-muted d-flex align-items-center gap-1" id="nav-overflow-more-toggle">
                                <i class="bi bi-three-dots"></i> Más
                            </button>
                            <div class="ws-actions-dropdown shadow-lg rounded-3 border p-1 d-none" id="nav-overflow-more-menu">
                                <button type="button" class="dropdown-item-btn" data-action="router:navigate" data-payload='{"path": "/roles"}'>
                                    <i class="bi bi-shield-lock me-2 text-primary"></i> Roles & Seguridad
                                </button>
                                <button type="button" class="dropdown-item-btn" data-action="router:navigate" data-payload='{"path": "/teams"}'>
                                    <i class="bi bi-people me-2 text-success"></i> Equipos de Trabajo
                                </button>
                                <button type="button" class="dropdown-item-btn" data-action="ui:open_settings">
                                    <i class="bi bi-gear me-2 text-muted"></i> Ajustes de Espacio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. RIGHT ZONE: GROUP-ACTIONS & GROUP-DROPDOWN -->
                <div class="ws-ribbon-right d-flex align-items-center gap-2">
                    <!-- Group Actions: Primary Button + Quick Icon Cluster -->
                    <div class="ws-group-actions d-flex align-items-center gap-1.5">
                        <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 fw-semibold shadow-xs ws-btn-primary" data-action="ui:open_create_business" title="Registrar Nueva Unidad de Negocio">
                            <i class="bi bi-plus-lg"></i>
                            <span class="d-none d-sm-inline">Nueva Unidad</span>
                        </button>

                        <div class="ws-direct-actions d-none d-md-flex align-items-center gap-1 ms-1">
                            <button type="button" class="btn btn-sm btn-icon rounded-circle text-muted p-1.5 action-mini-pill" title="Alternar Vista (Grid/Lista)" data-action="workspace:toggle_view_mode">
                                <i class="bi bi-grid-fill"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-icon rounded-circle text-muted p-1.5 action-mini-pill" title="Sincronizar Datos Operativos" data-action="workspace:refresh_data">
                                <i class="bi bi-arrow-clockwise"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-icon rounded-circle text-muted p-1.5 action-mini-pill" title="Exportar Reporte Mensual" data-action="ui:export_report">
                                <i class="bi bi-cloud-arrow-down"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-icon rounded-circle text-muted p-1.5 action-mini-pill" title="Ajustes del Workspace" data-action="ui:open_settings">
                                <i class="bi bi-sliders2"></i>
                            </button>
                        </div>
                    </div>

                    <div class="vr opacity-20 d-none d-sm-block"></div>

                    <!-- Group Dropdown: Categorized 3-Dots Menu -->
                    <div class="dropdown-wrapper position-relative" id="dw-ws-overflow">
                        <button type="button" class="btn btn-sm btn-icon rounded-circle text-muted p-1.5 action-mini-pill" id="ws-actions-overflow-toggle" title="Centro de Operaciones y Funciones">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>

                        <div class="ws-actions-dropdown shadow-xl rounded-4 border d-none" id="ws-actions-dropdown">
                            <div class="p-2 buca-scroll-area max-h-340">
                                <!-- Categoría: Gestión Operativa -->
                                <span class="x-small fw-bold text-muted text-uppercase px-2.5 py-1 d-block">Gestión Operativa</span>
                                <button type="button" class="dropdown-item-btn d-flex align-items-center gap-2.5 w-100 p-2 rounded-3 text-start border-0 bg-transparent" data-action="router:navigate" data-payload='{"path": "/pos"}'>
                                    <div class="p-1.5 rounded-2 bg-primary-subtle text-primary"><i class="bi bi-pc-display-horizontal"></i></div>
                                    <div class="flex-grow-1 min-w-0">
                                        <span class="d-block small fw-semibold text-main">Punto de Venta (POS)</span>
                                        <span class="d-block x-small text-muted">Facturación y cobro rápido</span>
                                    </div>
                                </button>
                                <button type="button" class="dropdown-item-btn d-flex align-items-center gap-2.5 w-100 p-2 rounded-3 text-start border-0 bg-transparent" data-action="router:navigate" data-payload='{"path": "/clients"}'>
                                    <div class="p-1.5 rounded-2 bg-success-subtle text-success"><i class="bi bi-person-badge"></i></div>
                                    <div class="flex-grow-1 min-w-0">
                                        <span class="d-block small fw-semibold text-main">Clientes & CRM</span>
                                        <span class="d-block x-small text-muted">Cartera comercial y crédito</span>
                                    </div>
                                </button>

                                <!-- Elementos en Desarrollo (Escala de Grises + Tooltip) -->
                                <button type="button" class="dropdown-item-btn d-flex align-items-center gap-2.5 w-100 p-2 rounded-3 text-start border-0 bg-transparent disabled-dev-item" data-action="feature:fiscal_billing" data-status="in-development" title="Función en Desarrollo">
                                    <div class="p-1.5 rounded-2 bg-secondary-subtle text-muted"><i class="bi bi-receipt"></i></div>
                                    <div class="flex-grow-1 min-w-0">
                                        <span class="d-block small fw-semibold text-muted">Facturación Fiscal SENIAT</span>
                                        <span class="d-block x-small text-muted opacity-75">Integración con impresoras fiscales</span>
                                    </div>
                                    <span class="badge bg-secondary-subtle text-muted rounded-pill px-1.5 py-0.2 x-small">Roadmap</span>
                                </button>

                                <button type="button" class="dropdown-item-btn d-flex align-items-center gap-2.5 w-100 p-2 rounded-3 text-start border-0 bg-transparent disabled-dev-item" data-action="feature:batch_tracking" data-status="in-development" title="Función en Desarrollo">
                                    <div class="p-1.5 rounded-2 bg-secondary-subtle text-muted"><i class="bi bi-boxes"></i></div>
                                    <div class="flex-grow-1 min-w-0">
                                        <span class="d-block small fw-semibold text-muted">Trazabilidad por Lotes</span>
                                        <span class="d-block x-small text-muted opacity-75">Control de vencimientos y almacén</span>
                                    </div>
                                    <span class="badge bg-secondary-subtle text-muted rounded-pill px-1.5 py-0.2 x-small">Roadmap</span>
                                </button>

                                <div class="border-top my-1.5"></div>

                                <!-- Categoría: Auditoría & Sistema -->
                                <span class="x-small fw-bold text-muted text-uppercase px-2.5 py-1 d-block">Auditoría & Sistema</span>
                                <button type="button" class="dropdown-item-btn d-flex align-items-center gap-2.5 w-100 p-2 rounded-3 text-start border-0 bg-transparent" data-action="ui:open_activity_log">
                                    <div class="p-1.5 rounded-2 bg-warning-subtle text-warning"><i class="bi bi-clock-history"></i></div>
                                    <div class="flex-grow-1 min-w-0">
                                        <span class="d-block small fw-semibold text-main">Auditoría de Actividad</span>
                                        <span class="d-block x-small text-muted">Historial inmutable de eventos</span>
                                    </div>
                                </button>
                                <button type="button" class="dropdown-item-btn d-flex align-items-center gap-2.5 w-100 p-2 rounded-3 text-start border-0 bg-transparent" data-action="ui:open_performance">
                                    <div class="p-1.5 rounded-2 bg-info-subtle text-info"><i class="bi bi-speedometer2"></i></div>
                                    <div class="flex-grow-1 min-w-0">
                                        <span class="d-block small fw-semibold text-main">Diagnóstico BNE</span>
                                        <span class="d-block x-small text-muted">Telemetría de hardware y FPS</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export default renderRibbonTemplate;

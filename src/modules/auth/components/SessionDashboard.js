/**
 * SessionDashboard - Panel de Control de Sesiones y Seguridad
 * =========================================================================
 * Visualiza dispositivos vinculados, sesiones activas y nivel de seguridad.
 * Refactorizado para Bootstrap 5.3 y sistema de paneles Glass.
 */
export const SessionDashboard = {
    render() {
        return `
            <div class="session-dashboard-card" id="panel-session-dashboard">
                <!-- Mobile Handle -->
                <div class="panel-handle d-md-none"></div>

                <header class="panel-header d-flex align-items-center justify-content-between p-3 border-bottom border-white-10">
                    <h3 class="h6 mb-0 fw-bold d-flex align-items-center gap-2">
                        <i class="bi bi-shield-check text-primary"></i> Seguridad de Sesión
                    </h3>
                    <button class="btn-close shadow-none small d-md-none" data-action="header:close_all_panels"></button>
                </header>

                <div class="panel-body p-0">
                    <div class="list-group list-group-flush bg-transparent">
                        <div class="list-group-item bg-transparent border-white-10 px-3 py-3">
                            <p class="small text-muted text-uppercase fw-bold mb-3 session-header-label">Dispositivos Activos</p>
                            
                            <!-- Dispositivo Actual -->
                            <div class="d-flex align-items-center gap-3 mb-3 p-2 rounded-3 bg-white-5">
                                <div class="bg-primary bg-opacity-10 p-2 rounded-circle text-primary d-flex align-items-center justify-content-center session-device-icon-box">
                                    <i class="bi bi-laptop fs-5"></i>
                                </div>
                                <div class="flex-grow-1 overflow-hidden">
                                    <p class="small fw-bold mb-0 text-truncate">Este Dispositivo (Windows)</p>
                                    <p class="text-muted mb-0 session-subtext-micro">Activo ahora • San Salvador, SV</p>
                                </div>
                                <div class="badge rounded-pill bg-success p-1 session-active-dot">Activo</div>
                            </div>

                            <!-- Otros Dispositivos -->
                            <div class="d-flex align-items-center gap-3 p-2 rounded-3">
                                <div class="bg-white-10 p-2 rounded-circle text-muted d-flex align-items-center justify-content-center session-device-icon-box">
                                    <i class="bi bi-phone fs-5"></i>
                                </div>
                                <div class="flex-grow-1 overflow-hidden">
                                    <p class="small fw-bold mb-0 text-truncate">iPhone 15 Pro</p>
                                    <p class="text-muted mb-0 session-subtext-micro">Hace 2 horas • CDMX</p>
                                </div>
                                <button class="btn btn-link text-danger p-0 border-0" data-action="auth:revoke_session" data-payload='{"device": "iphone-15"}'>
                                    <i class="bi bi-x-circle fs-5"></i>
                                </button>
                            </div>
                        </div>

                        <div class="list-group-item bg-transparent border-white-10 px-3 py-3">
                            <div class="row g-2 text-center">
                                <div class="col-6">
                                    <div class="p-2 rounded-3 bg-white-5 border border-white-10">
                                        <span class="d-block h4 mb-0 fw-bold">2</span>
                                        <span class="small text-muted">Sesiones</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="p-2 rounded-3 bg-white-5 border border-white-10">
                                        <span class="d-block h4 mb-0 fw-bold">64%</span>
                                        <span class="small text-muted">Uso Plan</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel-footer p-3 bg-white-5 border-top border-white-10">
                    <button class="btn btn-primary w-100 btn-sm rounded-pill d-flex align-items-center justify-content-center gap-2" data-action="ui:open_security">
                        <i class="bi bi-gear-fill"></i> Ajustes de Seguridad
                    </button>
                </div>
            </div>
        `;
    },

    init() {
        console.log('[SessionDashboard] -> Integrado en sistema de paneles');
    },

    toggle() {
        const panel = document.getElementById('panel-session-dashboard');
        if (panel) {
            panel.classList.toggle('active');
        }
    }
};

export default SessionDashboard;

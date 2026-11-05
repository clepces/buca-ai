import { sessionState } from '@/core/state/session.js';
import { escapeHTML } from '@/shared/utils/security.js';

/**
 * DashboardPage - Vista Principal del Workspace
 */
export const DashboardPage = {
    render() {
        const { user } = sessionState.get();
        const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
        const userRole = (user?.role || 'user').toUpperCase();

        return `
            <div class="workspace-dashboard ws-system-widgets">
                <div class="row g-3" id="widget-grid-slot">
                    
                    <!-- Widget 1: Conexión y Nube -->
                    <div class="col-12 col-md-4">
                        <div class="system-widget-card h-100" data-buca-perf="L0">
                            <div class="widget-header">
                                <div class="widget-icon-box widget-icon-box--blue">
                                    <i class="bi bi-cloud-check-fill"></i>
                                </div>
                                <div>
                                    <span class="widget-category">Infraestructura Cloud</span>
                                    <h3 class="widget-title">Estado de Nube</h3>
                                </div>
                            </div>
                            <div class="widget-body">
                                <p class="widget-description">
                                    Sincronización en tiempo real activa mediante Emuladores de alta disponibilidad (Zero-Cost Architecture).
                                </p>
                                <div class="widget-meta-strip">
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="badge bg-success bg-opacity-15 text-success border border-success border-opacity-25 rounded-pill widget-badge-pill">
                                            <i class="bi bi-circle-fill me-1 widget-status-dot"></i> Online
                                        </span>
                                        <span class="small text-muted">Latencia: 12ms</span>
                                    </div>
                                    <span class="text-muted widget-meta-micro"><i class="bi bi-hdd-network"></i> SSL OK</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Widget 2: Auditoría y Accesos -->
                    <div class="col-12 col-md-4">
                        <div class="system-widget-card h-100" data-buca-perf="L0">
                            <div class="widget-header">
                                <div class="widget-icon-box widget-icon-box--purple">
                                    <i class="bi bi-shield-lock-fill"></i>
                                </div>
                                <div>
                                    <span class="widget-category">Seguridad Corporativa</span>
                                    <h3 class="widget-title">Auditoría & Accesos</h3>
                                </div>
                            </div>
                            <div class="widget-body">
                                <p class="widget-description">
                                    Sesión corporativa autenticada para <strong>${escapeHTML(userName)}</strong> con rol <strong>${userRole}</strong> y aislamiento estricto por tenant.
                                </p>
                                <div class="widget-meta-strip">
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="badge bg-primary bg-opacity-15 text-primary border border-primary border-opacity-25 rounded-pill widget-badge-pill">
                                            <i class="bi bi-patch-check-fill me-1"></i> MFA Válido
                                        </span>
                                        <span class="small text-muted">Aislamiento 100%</span>
                                    </div>
                                    <span class="text-muted widget-meta-micro"><i class="bi bi-key"></i> AES-256</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Widget 3: Motor Gráfico BNE -->
                    <div class="col-12 col-md-4">
                        <div class="system-widget-card h-100" data-buca-perf="L0">
                            <div class="widget-header">
                                <div class="widget-icon-box widget-icon-box--amber">
                                    <i class="bi bi-cpu-fill"></i>
                                </div>
                                <div>
                                    <span class="widget-category">Hardware Engine</span>
                                    <h3 class="widget-title">Motor Gráfico BNE</h3>
                                </div>
                            </div>
                            <div class="widget-body">
                                <p class="widget-description">
                                    Calibración reactiva del motor adaptando sombras y desenfoque para asegurar 60 FPS estables y autonomía de batería.
                                </p>
                                <div class="progress mb-2 widget-progress-track">
                                    <div class="progress-bar bg-warning widget-progress-fill-85" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <div class="widget-meta-strip">
                                    <div class="d-flex align-items-center gap-2">
                                        <span class="badge bg-warning bg-opacity-15 text-warning border border-warning border-opacity-25 rounded-pill widget-badge-pill">
                                            V-Sync 60 FPS
                                        </span>
                                        <span class="small text-muted">GPU: 85%</span>
                                    </div>
                                    <span class="text-muted widget-meta-micro"><i class="bi bi-lightning-charge"></i> Fluido</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    },
    init() {
        console.log('[Workspace] -> DashboardPage inicializado con telemetría mock.');
    }
};
export default DashboardPage;

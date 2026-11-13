/**
 * SystemHealthMonitor - Estado de Red, Microservicios Cloud & Hardware Engine
 */

export const SystemHealthMonitor = {
    render() {
        return `
            <section class="ws-section h-100 d-flex flex-column mb-0">
                <div class="section-header d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-2 p-2 shadow-2xs d-flex align-items-center justify-content-center health-header-icon-box">
                            <i class="bi bi-hdd-network fs-5"></i>
                        </div>
                        <div>
                            <h2 class="section-title h5 fw-bold mb-0 text-main health-title">
                                Monitoreo Cloud & Hardware
                            </h2>
                            <span class="text-muted small health-subtitle">Salud de microservicios y red local</span>
                        </div>
                    </div>
                </div>

                <div class="card glass-surface p-3.5 p-md-4 rounded-4 border shadow-sm bg-white flex-grow-1 d-flex flex-column justify-content-between">
                    <div class="d-flex flex-column gap-3">
                        
                        <!-- Metric Row 1: Supabase / Database Status -->
                        <div class="p-3 rounded-3 border bg-light shadow-2xs d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-2 p-2 d-flex align-items-center justify-content-center health-card-icon-cloud">
                                    <i class="bi bi-cloud-check-fill fs-5"></i>
                                </div>
                                <div>
                                    <h3 class="h6 fw-bold mb-0 text-main health-card-title">Base de Datos Cloud</h3>
                                    <span class="text-muted small health-subtitle">Sincronización en tiempo real</span>
                                </div>
                            </div>
                            <span class="badge rounded-pill px-2.5 py-1 health-badge-online">ONLINE (12ms)</span>
                        </div>

                        <!-- Metric Row 2: GPU / Engine Hardware Load -->
                        <div class="p-3 rounded-3 border bg-light shadow-2xs">
                            <div class="d-flex align-items-center justify-content-between mb-1.5">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-speedometer2 fs-5 health-card-icon-gpu"></i>
                                    <span class="fw-bold text-main health-card-title">Carga GPU & V-Sync</span>
                                </div>
                                <span class="badge rounded-pill px-2 py-0.5 health-badge-fps">60 FPS ESTABLE</span>
                            </div>
                            <div class="progress mb-1 rounded-pill bg-white border health-progress-gpu">
                                <div class="progress-bar rounded-pill health-progress-bar-gpu" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="d-flex justify-content-between text-muted small health-progress-text">
                                <span>Uso GPU: 85%</span>
                                <span>Modo Batería: Optimizada (L0)</span>
                            </div>
                        </div>

                        <!-- Metric Row 3: IndexedDB Local Cache -->
                        <div class="p-3 rounded-3 border bg-light shadow-2xs d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-2 p-2 d-flex align-items-center justify-content-center health-card-icon-db">
                                    <i class="bi bi-database-check fs-5"></i>
                                </div>
                                <div>
                                    <h3 class="h6 fw-bold mb-0 text-main health-card-title">Almacenamiento Local</h3>
                                    <span class="text-muted small health-subtitle">IndexedDB Driver Híbrido</span>
                                </div>
                            </div>
                            <span class="badge rounded-pill px-2.5 py-1 health-badge-storage">32.4 / 512 MB</span>
                        </div>

                    </div>
                </div>
            </section>
        `;
    }
};

export default SystemHealthMonitor;

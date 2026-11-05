/**
 * ProfileMonitoringTab - Pestaña de Monitoreo de Límites y Módulos ERP.
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const ProfileMonitoringTab = (data = {}) => {
    return `
        <div class="tab-content-pane feature-disabled" id="tab-profile-monitoring">
            <div class="row g-4">
                <!-- COLUMNA IZQUIERDA: MONITOREO DE CONSUMO Y ADVERTENCIAS -->
                <div class="col-12 col-lg-6">
                    <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100">
                        <h5 class="fw-bold text-main mb-3 d-flex align-items-center gap-2">
                            <i class="bi bi-graph-up-arrow text-primary"></i> Límite de Consumo ERP
                            <i class="bi bi-question-circle text-muted fs-6" title="Monitoreo en tiempo real de recursos consumidos vs límite del plan."></i>
                        </h5>
                        <div class="alert alert-warning border-0 p-3 rounded-3 small mb-3">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i> Estás utilizando el 75% de tu capacidad de almacenamiento actual.
                        </div>
                        <div class="bg-body p-3 rounded-3 border mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="small fw-bold">Almacenamiento Base de Datos</span>
                                <span class="small text-muted">37.5 GB / 50 GB</span>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar bg-warning" style="width: 75%"></div>
                            </div>
                        </div>
                        <div class="bg-body p-3 rounded-3 border">
                            <div class="d-flex justify-content-between mb-1">
                                <span class="small fw-bold">Ancho de Banda API</span>
                                <span class="small text-muted">450 GB / 1 TB</span>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar bg-primary" style="width: 45%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: ESTADO DE MÓDULOS ERP -->
                <div class="col-12 col-lg-6">
                    <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100">
                        <h5 class="fw-bold text-main mb-3 d-flex align-items-center gap-2">
                            <i class="bi bi-boxes text-success"></i> Estado Módulos ERP
                            <i class="bi bi-question-circle text-muted fs-6" title="Estado operativo de los módulos habilitados según tu suscripción."></i>
                        </h5>
                        <div class="alert alert-success border-0 p-3 rounded-3 small mb-3">
                            <i class="bi bi-check-circle-fill me-2"></i> Todos los módulos críticos operando dentro de los parámetros normales.
                        </div>
                        <div class="list-group list-group-flush">
                            <div class="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                                <span><i class="bi bi-cash-stack me-2 text-info"></i> Punto de Venta (POS)</span>
                                <span class="badge bg-success rounded-pill">Activo (Online)</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                                <span><i class="bi bi-cart-check me-2 text-info"></i> Inventario & Stock</span>
                                <span class="badge bg-success rounded-pill">Activo (Online)</span>
                            </div>
                             <div class="list-group-item d-flex justify-content-between align-items-center bg-transparent border-0 px-0">
                                <span><i class="bi bi-receipt-cutoff me-2 text-info"></i> Facturación Seniat</span>
                                <span class="badge bg-success rounded-pill">Activo (Online)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default ProfileMonitoringTab;

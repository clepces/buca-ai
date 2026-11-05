/**
 * ProfileSubscriptionTab - Plantilla para la suscripción ERP Enterprise sin estilos en línea.
 * =========================================================================================
 * Banner VIP Master Gold Premier | Cuotas & Consumo | Módulos ERP con Límites de Capacidad
 * =========================================================================================
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const ProfileSubscriptionTab = (data = {}) => {
    const rawTier = (data.planTier || 'ENTERPRISE MASTER GOLD VIP').toUpperCase();
    const planTierDisplay = rawTier === 'GOLD' ? 'GOLD ENTERPRISE MASTER VIP (PROPIETARIO ROOT)' : rawTier;
    const planStatus = data.planStatus || 'ACTIVO (ILIMITADO)';
    const validUntil = data.validUntil || 'Licencia Vitalicia Master (Sin Expiración)';

    return `
        <div class="tab-content-pane feature-disabled" id="tab-profile-subscription">
            
            <!-- PLAN SELECTION BANNER -->
            <div class="card border rounded-4 p-4 mb-4 shadow-sm bg-body">
                <h4 class="fw-bold mb-3">Planes de Suscripción</h4>
                <div class="row g-3">
                    <div class="col-6 col-md-3">
                        <div class="p-3 border rounded-3 bg-body-tertiary">
                            <div class="fw-bold">Free</div>
                            <small class="text-muted">Básico</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 border rounded-3 bg-body-tertiary">
                            <div class="fw-bold">Bronze</div>
                            <small class="text-muted">Iniciación</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 border rounded-3 bg-body-tertiary">
                            <div class="fw-bold">Cobre</div>
                            <small class="text-muted">Crecimiento</small>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="p-3 border rounded-3 bg-primary text-white">
                            <div class="fw-bold">Oro</div>
                            <small class="opacity-75">Pro (Ilimitado)</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- GUÍA DEL ESPECIALISTA SOBRE POLÍTICA DE PLANES -->
            <div class="alert alert-primary border border-primary-subtle bg-primary-subtle text-primary-emphasis p-3 rounded-4 mb-4 d-flex align-items-start gap-3 shadow-xs">
                <div class="profile-icon-box-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0">
                    <i class="bi bi-lightbulb-fill"></i>
                </div>
                <div>
                    <div class="fw-bold small">Guía del Arquitecto ERP: Filosofía de Licenciamiento BUCA Enterprise</div>
                    <div class="small opacity-90 profile-subtext-micro">
                        En BUCA Enterprise <strong>nunca bloqueamos módulos o pantallas clave del sistema</strong> por nivel de suscripción. Todos los planes incluyen las funcionalidades completas. Las membresías superiores (como el plan Gold Master) lo que hacen es <strong>expandir los límites de recursos de infraestructura</strong> (más sucursales, mayor almacenamiento DB, terminales POS ilimitadas y procesamiento redundante).
                    </div>
                </div>
            </div>

            <!-- DASHBOARD DE CUOTAS Y CAPACIDADES DETALLADO CON CONSUMO -->
            <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs mb-4">
                <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                        <i class="bi bi-pie-chart-fill text-primary"></i> Métricas de Capacidad & Cuotas Asignadas
                    </h5>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold profile-badge-sm">
                        <i class="bi bi-infinity me-1"></i>Sin Bloqueos de Función
                    </span>
                </div>

                <div class="row g-3">
                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="p-3 rounded-4 bg-body-tertiary border h-100 shadow-xs">
                            <div class="d-flex align-items-center justify-content-between mb-1.5">
                                <span class="fw-bold text-primary small"><i class="bi bi-building me-1"></i> Sucursales Activas</span>
                                <span class="badge bg-primary text-white rounded-pill profile-badge-micro">3 / 999</span>
                            </div>
                            <div class="fs-4 fw-bold font-monospace text-main mb-1">3 Sucursales</div>
                            <div class="progress profile-progress-bar-sm mb-1.5">
                                <div class="progress-bar bg-primary rounded-pill progress-w-5" role="progressbar" aria-valuenow="5" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="text-muted profile-subtext-micro">Capacidad para 996 sucursales adicionales.</div>
                        </div>
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="p-3 rounded-4 bg-body-tertiary border h-100 shadow-xs">
                            <div class="d-flex align-items-center justify-content-between mb-1.5">
                                <span class="fw-bold text-success small"><i class="bi bi-people-fill me-1"></i> Operadores POS</span>
                                <span class="badge bg-success text-white rounded-pill profile-badge-micro">12 Activos</span>
                            </div>
                            <div class="fs-4 fw-bold font-monospace text-main mb-1">Ilimitados</div>
                            <div class="progress profile-progress-bar-sm mb-1.5">
                                <div class="progress-bar bg-success rounded-pill progress-w-15" role="progressbar" aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="text-muted profile-subtext-micro">Cuentas de cajeros sin restricciones de número.</div>
                        </div>
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="p-3 rounded-4 bg-body-tertiary border h-100 shadow-xs">
                            <div class="d-flex align-items-center justify-content-between mb-1.5">
                                <span class="fw-bold text-warning small"><i class="bi bi-currency-exchange me-1"></i> Tasa Bi-Monetaria</span>
                                <span class="badge bg-warning text-dark rounded-pill profile-badge-micro">100% BCV</span>
                            </div>
                            <div class="fs-4 fw-bold font-monospace text-main mb-1">BCV / USDT</div>
                            <div class="progress profile-progress-bar-sm mb-1.5">
                                <div class="progress-bar bg-warning rounded-pill progress-w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="text-muted profile-subtext-micro">Sincronización en vivo con API del Banco Central.</div>
                        </div>
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="p-3 rounded-4 bg-body-tertiary border h-100 shadow-xs">
                            <div class="d-flex align-items-center justify-content-between mb-1.5">
                                <span class="fw-bold text-info small"><i class="bi bi-database-fill-check me-1"></i> Cloud DB Firestore</span>
                                <span class="badge bg-info text-white rounded-pill profile-badge-micro">2.4 / 50 GB</span>
                            </div>
                            <div class="fs-4 fw-bold font-monospace text-main mb-1">2.4 GB DB</div>
                            <div class="progress profile-progress-bar-sm mb-1.5">
                                <div class="progress-bar bg-info rounded-pill progress-w-8" role="progressbar" aria-valuenow="8" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="text-muted profile-subtext-micro">Uso de almacenamiento de comprobantes y catálogo.</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- FUNCIONALIDADES & MÓDULOS CON LÍMITES DE CONSUMO EN TIEMPO REAL -->
            <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs mb-4">
                <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                        <i class="bi bi-grid-3x3-gap-fill text-success"></i> Monitoreo de Límites de Consumo & Módulos ERP
                    </h5>
                    <span class="badge bg-success-subtle text-success border border-success-subtle profile-badge-micro">
                        Mapeo en Vivo
                    </span>
                </div>

                <div class="row g-3">
                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded-3 bg-body-tertiary profile-module-card d-flex align-items-start gap-3">
                            <div class="profile-icon-box-sm rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center flex-shrink-0">
                                <i class="bi bi-cash-stack"></i>
                            </div>
                            <div class="w-100">
                                <div class="fw-bold small text-main d-flex align-items-center justify-content-between mb-1">
                                    <span>Puntos de Venta (POS Multimoneda)</span>
                                    <span class="badge bg-success text-white profile-badge-micro">5 / Ilimitados</span>
                                </div>
                                <div class="progress profile-progress-bar-sm mb-1">
                                    <div class="progress-bar bg-success rounded-pill progress-w-20" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <div class="text-muted profile-subtext-micro">5 cajas registradoras cobrando en Bolívares BCV y USDT.</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded-3 bg-body-tertiary profile-module-card d-flex align-items-start gap-3">
                            <div class="profile-icon-box-sm rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0">
                                <i class="bi bi-box-seam-fill"></i>
                            </div>
                            <div class="w-100">
                                <div class="fw-bold small text-main d-flex align-items-center justify-content-between mb-1">
                                    <span>Catálogo de Productos & Inventario FIFO</span>
                                    <span class="badge bg-primary text-white profile-badge-micro">1,450 / 50,000 SKUs</span>
                                </div>
                                <div class="progress profile-progress-bar-sm mb-1">
                                    <div class="progress-bar bg-primary rounded-pill progress-w-3" role="progressbar" aria-valuenow="3" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <div class="text-muted profile-subtext-micro">1,450 productos registrados con control de lotes y vencimiento.</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded-3 bg-body-tertiary profile-module-card d-flex align-items-start gap-3">
                            <div class="profile-icon-box-sm rounded-circle bg-warning-subtle text-warning-emphasis d-flex align-items-center justify-content-center flex-shrink-0">
                                <i class="bi bi-receipt-cutoff"></i>
                            </div>
                            <div class="w-100">
                                <div class="fw-bold small text-main d-flex align-items-center justify-content-between mb-1">
                                    <span>Facturación Electrónica & Ticketera SENIAT</span>
                                    <span class="badge bg-warning text-dark profile-badge-micro">Ilimitado</span>
                                </div>
                                <div class="progress profile-progress-bar-sm mb-1">
                                    <div class="progress-bar bg-warning rounded-pill progress-w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <div class="text-muted profile-subtext-micro">Sin límite mensual de emisión de facturas térmicas ni cartas.</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="p-3 rounded-3 bg-body-tertiary profile-module-card d-flex align-items-start gap-3">
                            <div class="profile-icon-box-sm rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center flex-shrink-0">
                                <i class="bi bi-shield-lock-fill"></i>
                            </div>
                            <div class="w-100">
                                <div class="fw-bold small text-main d-flex align-items-center justify-content-between mb-1">
                                    <span>Auditoría Forense & Logs Inmutables</span>
                                    <span class="badge bg-danger text-white profile-badge-micro">Protegido</span>
                                </div>
                                <div class="progress profile-progress-bar-sm mb-1">
                                    <div class="progress-bar bg-danger rounded-pill progress-w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <div class="text-muted profile-subtext-micro">Registro cronológico inalterable con retención histórica vitalicia.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- GARANTÍA Y AVISO DE LICENCIA ENRIQUECIDO -->
            <div class="alert alert-success border border-success-subtle bg-success-subtle text-success-emphasis p-3.5 rounded-4 d-flex align-items-start gap-3 shadow-xs">
                <div class="profile-icon-box-sm rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0">
                    <i class="bi bi-shield-check"></i>
                </div>
                <div>
                    <div class="fw-bold small">Garantía Técnica de Licencia Vitalicia Root & SLA 99.99%</div>
                    <div class="small opacity-85 profile-subtext-micro">
                        Esta cuenta posee certificado de firma digital maestro verificado en Google Cloud Firestore. Garantiza soporte prioritario sin cobros por comisión de transacción ni caducidad de licencia.
                    </div>
                </div>
            </div>

        </div>
    `;
};

export default ProfileSubscriptionTab;

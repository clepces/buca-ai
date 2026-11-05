/**
 * QuickActionsControl - Centro de Control Operativo & Atajos Rápidos ERP
 * Refactorización Phase 4: Grid Limpio, Zero-Pill y Consistencia de Radios (1rem)
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const QuickActionsControl = {
    render() {
        const quickActions = [
            { title: 'Punto de Venta (POS)', desc: 'Facturación rápida & divisas', icon: 'bi-pc-display-horizontal', route: '/pos', theme: 'blue', badge: 'Cobro BCV' },
            { title: 'Clientes & CRM', desc: 'Cartera comercial & créditos', icon: 'bi-person-badge', route: '/clients', theme: 'green', badge: '142 Activos' },
            { title: 'Inventario & Stock', desc: 'Alertas & almacenes multitenant', icon: 'bi-box-seam', route: '/inventory', theme: 'amber', badge: '2 Críticos' },
            { title: 'Proveedores', desc: 'Suministros & órdenes compra', icon: 'bi-truck', route: '/providers', theme: 'purple', badge: 'Orden OK' }
        ];

        return `
            <section class="ws-section h-100 d-flex flex-column mb-0">
                <div class="section-header d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-4 p-2 shadow-2xs d-flex align-items-center justify-content-center qa-header-icon-box">
                            <i class="bi bi-grid-fill fs-5"></i>
                        </div>
                        <div>
                            <h2 class="section-title h5 fw-bold mb-0 text-main health-title">
                                Centro de Control Operativo
                            </h2>
                            <span class="text-muted small health-subtitle">Atajos directos a submódulos ERP</span>
                        </div>
                    </div>
                </div>

                <div class="glass-surface p-3.5 p-md-4 rounded-4 border-glass shadow-lg flex-grow-1 d-flex flex-column justify-content-between overflow-hidden">
                    <div class="row g-3 mb-3 flex-grow-1 align-content-start">
                        ${quickActions.map(act => `
                            <div class="col-12 col-sm-6">
                                <a href="${act.route}" class="glass-surface qa-tile-link p-3 rounded-4 border d-flex flex-column justify-content-between text-decoration-none transition-all h-100 shadow-2xs-hover" style="border-color: rgba(255,255,255,0.15) !important;">
                                    <div class="d-flex align-items-center justify-content-between mb-2.5">
                                        <div class="rounded-3 p-2 d-flex align-items-center justify-content-center qa-tile-icon-box qa-tile-icon-box--${act.theme}">
                                            <i class="bi ${act.icon} fs-5"></i>
                                        </div>
                                        <div class="d-flex align-items-center gap-1.5">
                                            <span class="badge bg-secondary-subtle text-muted rounded-pill px-2 py-0.5" style="font-size: 0.65rem; border: 1px solid rgba(148, 163, 184, 0.2);">Beta</span>
                                            <span class="quick-badge fw-bold qa-badge qa-badge--${act.theme}">
                                                <i class="bi bi-dot"></i> ${act.badge}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 class="h6 fw-bold mb-0 text-main qa-title">${escapeHTML(act.title)}</h3>
                                        <span class="text-muted small d-block mt-0.5 qa-desc">${escapeHTML(act.desc)}</span>
                                    </div>
                                </a>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Compact Operational Summary Box -->
                    <div class="p-3.5 rounded-4 border-glass-bright bg-white-5 d-flex align-items-center justify-content-between mt-auto qa-summary-box">
                        <div class="d-flex align-items-center gap-3">
                            <div class="rounded-3 d-flex align-items-center justify-content-center qa-summary-icon">
                                <i class="bi bi-shield-lock-fill text-success fs-5"></i>
                            </div>
                            <div>
                                <span class="d-block fw-bold text-main qa-summary-title">Aislamiento Multitenant Activo</span>
                                <span class="text-muted d-block qa-summary-sub">Matriz RBAC: Super Admin / Owner</span>
                            </div>
                        </div>
                        <a href="/roles" class="btn btn-sm btn-link text-decoration-none fw-bold p-0 qa-link-btn text-primary">Configurar <i class="bi bi-arrow-right ms-1"></i></a>
                    </div>
                </div>
            </section>
        `;
    }
};

export default QuickActionsControl;

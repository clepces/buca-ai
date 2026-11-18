/**
 * @fileoverview advisor-panel - Centro de Asesoría y Diagnóstico Corporativo (Advisor Center)
 * @module shared/ui/components/header/advisor-panel
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const AdvisorPanel = {
    _activeView: 'list', // 'list' | 'detail'
    _selectedAdvisor: null,

    getAdvisors() {
        return [
            {
                id: 'adv-auth-1',
                category: 'Autenticación',
                severity: 'info',
                severityLabel: 'INFORMACIÓN',
                title: 'Protección Multi-Factor AAL2 Activa',
                desc: 'La verificación TOTP (RFC 6238) está configurada y protegiendo accesos administrativos.',
                entity: 'Supabase Auth',
                resolved: true
            },
            {
                id: 'adv-rls-1',
                category: 'Base de Datos',
                severity: 'warning',
                severityLabel: 'AUDITORÍA',
                title: 'Políticas RLS en public.finance_rates',
                desc: 'Lecturas públicas habilitadas para consulta de cotizaciones, escrituras protegidas por UID.',
                entity: 'PostgreSQL RLS',
                resolved: true
            },
            {
                id: 'adv-tenant-1',
                category: 'Multi-Tenant',
                severity: 'success',
                severityLabel: 'ÓPTIMO',
                title: 'Aislamiento Estricto por Unidad Activo',
                desc: 'Las transacciones y balances están anclados al tenant_id de la sesión.',
                entity: 'Tenant Manager',
                resolved: true
            },
            {
                id: 'adv-perf-1',
                category: 'Rendimiento',
                severity: 'info',
                severityLabel: 'RECOMENDACIÓN',
                title: 'Motor Gráfico BNE en Nivel Óptimo',
                desc: 'La tasa de refresco supera 60 FPS con aceleración por GPU y cero bloqueos de DOM.',
                entity: 'Buca Neural Engine',
                resolved: true
            }
        ];
    },

    render() {
        const advisors = this.getAdvisors();

        return `
            <div id="panel-advisor" class="glass-panel solid-dropdown-panel advisor-dropdown-panel">
                <!-- Header con Filtros -->
                <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-lightbulb-fill text-warning fs-5"></i>
                        <span class="fw-bold small text-main">Advisor Center</span>
                        <span class="badge bg-primary-subtle text-primary rounded-pill px-2 py-0.5 x-small">${advisors.length} Activos</span>
                    </div>
                    <button type="button" class="btn-close-panel btn btn-sm p-0 text-muted" data-action="header:close_all_panels">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>

                <!-- Barra de Filtros Rápidos -->
                <div class="px-3 py-2 border-bottom bg-subtle d-flex align-items-center gap-1.5 overflow-x-auto scrollbar-hide">
                    <span class="badge bg-secondary-subtle text-muted rounded-pill px-2 py-1 x-small cursor-pointer">Categoría <i class="bi bi-chevron-down ms-1"></i></span>
                    <span class="badge bg-secondary-subtle text-muted rounded-pill px-2 py-1 x-small cursor-pointer">Estado <i class="bi bi-chevron-down ms-1"></i></span>
                    <span class="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 x-small cursor-pointer">Gravedad: ${advisors.length} <i class="bi bi-chevron-down ms-1"></i></span>
                </div>

                <!-- Lista de Avisos -->
                <div class="advisor-list p-2 buca-scroll-area max-h-350" id="advisor-items-container">
                    ${advisors.map(adv => `
                        <div class="advisor-card p-2.5 rounded-3 border mb-2 cursor-pointer transition-all" 
                             data-action="advisor:show_detail" 
                             data-id="${adv.id}">
                            <div class="d-flex align-items-start gap-2.5">
                                <div class="advisor-shield-icon flex-shrink-0 mt-0.5 ${adv.severity === 'warning' ? 'text-warning' : (adv.severity === 'success' ? 'text-success' : 'text-primary')}">
                                    <i class="bi bi-shield-check fs-5"></i>
                                </div>
                                <div class="flex-grow-1 min-w-0">
                                    <div class="d-flex align-items-center justify-content-between mb-0.5">
                                        <span class="d-block fw-bold text-main small text-truncate">${escapeHTML(adv.title)}</span>
                                        <span class="badge bg-secondary-subtle text-muted rounded-pill px-1.5 py-0.5 x-small font-monospace">${adv.severityLabel}</span>
                                    </div>
                                    <span class="d-block text-muted x-small mb-1 text-truncate">${escapeHTML(adv.entity)}</span>
                                    <p class="x-small text-muted mb-0 lh-sm line-clamp-2">${escapeHTML(adv.desc)}</p>
                                </div>
                                <i class="bi bi-chevron-right text-muted x-small mt-1"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Footer del Advisor -->
                <div class="p-2.5 bg-subtle border-top d-flex justify-content-between align-items-center">
                    <span class="x-small text-muted">Auditoría en tiempo real</span>
                    <button type="button" class="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0 x-small" data-action="ui:open_activity_log">
                        Ver registro completo <i class="bi bi-arrow-right ms-0.5"></i>
                    </button>
                </div>
            </div>
        `;
    }
};

export default AdvisorPanel;

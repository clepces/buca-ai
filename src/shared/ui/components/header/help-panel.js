/**
 * @fileoverview help-panel - Panel Lateral / Desplegable de Ayuda y Soporte
 * @module shared/ui/components/header/help-panel
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const HelpPanel = {
    render() {
        const helpItems = [
            {
                id: 'ai_copilot',
                icon: 'bi-stars',
                colorClass: 'text-primary',
                bgClass: 'bg-primary-subtle',
                title: 'BUCA Assistant',
                desc: 'Obtén ayuda guiada con tu ERP directamente en el sistema.',
                action: 'ui:open_ai_assistant'
            },
            {
                id: 'docs',
                icon: 'bi-journal-code',
                colorClass: 'text-success',
                bgClass: 'bg-success-subtle',
                title: 'Documentación Oficial',
                desc: 'Consulta guías, referencias y arquitectura de módulos.',
                action: 'ui:open_docs'
            },
            {
                id: 'troubleshooting',
                icon: 'bi-wrench-adjustable',
                colorClass: 'text-warning',
                bgClass: 'bg-warning-subtle',
                title: 'Resolución de Problemas',
                desc: 'Encuentra soluciones a errores comunes de la plataforma.',
                action: 'ui:open_troubleshooting'
            },
            {
                id: 'status',
                icon: 'bi-activity',
                colorClass: 'text-info',
                bgClass: 'bg-info-subtle',
                title: 'Estatus del Sistema',
                desc: 'Revisa disponibilidad de Supabase y servicios de red.',
                action: 'ui:open_performance'
            },
            {
                id: 'support',
                icon: 'bi-envelope',
                colorClass: 'text-primary',
                bgClass: 'bg-primary-subtle',
                title: 'Contacta con Soporte',
                desc: 'Envía una solicitud para problemas de cuenta o facturación.',
                action: 'feedback:select_type',
                payload: { type: 'support' }
            }
        ];

        return `
            <div id="panel-help" class="glass-panel solid-dropdown-panel help-dropdown-panel">
                <div class="px-3.5 py-3 border-bottom d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold small text-main">Ayuda y Soporte</span>
                        <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5 x-small fw-semibold">
                            <i class="bi bi-circle-fill me-1 x-small text-success"></i> TODOS LOS SISTEMAS OK
                        </span>
                    </div>
                    <button type="button" class="btn-close-panel btn btn-sm p-0 text-muted" data-action="header:close_all_panels">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>

                <div class="help-items-list p-2.5 buca-scroll-area max-h-350">
                    ${helpItems.map(item => `
                        <button type="button" class="help-item-btn w-100 p-2.5 rounded-3 d-flex align-items-center gap-3 border-0 bg-transparent text-start transition-all mb-1"
                                data-action="${item.action}"
                                ${item.payload ? `data-payload='${JSON.stringify(item.payload)}'` : ''}>
                            <div class="help-icon-wrapper rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${item.bgClass} ${item.colorClass}" style="width: 38px; height: 38px; min-width: 38px;">
                                <i class="bi ${item.icon} fs-5"></i>
                            </div>
                            <div class="flex-grow-1 min-w-0">
                                <span class="d-block fw-bold text-main small text-truncate mb-0.5">${escapeHTML(item.title)}</span>
                                <span class="d-block text-muted x-small lh-sm">${escapeHTML(item.desc)}</span>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small"></i>
                        </button>
                    `).join('')}
                </div>

                <!-- Apoyo Comunitario Banner -->
                <div class="px-3.5 py-3 bg-subtle border-top">
                    <span class="fw-bold x-small text-muted d-block text-uppercase mb-1">Apoyo Comunitario</span>
                    <p class="x-small text-muted mb-2.5 lh-sm">Comunidad de operadores e ingenieros para soporte inmediato.</p>
                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-semibold py-2">
                        <i class="bi bi-discord fs-6"></i> Únete en Discord
                    </a>
                </div>
            </div>
        `;
    }
};

export default HelpPanel;
